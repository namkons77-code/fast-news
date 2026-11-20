import asyncio
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from typing import Dict, Any, Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from apscheduler.triggers.cron import CronTrigger

from app.config import settings
from app.crawler.rss_crawler import crawl_all_categories
from app.crawler.bigkinds_crawler import crawl_all_bigkinds
from app.crawler.trend_crawler import fetch_bigkinds_trend_keywords
from app.database import (
    save_news_batch,
    record_crawl_log,
    get_total_news_count,
    get_db_mode,
    save_trend_keywords_batch,
)


class NewsSchedulerService:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.is_crawling = False
        self.last_run_at: Optional[datetime] = None
        self.last_crawl_result: Optional[Dict[str, Any]] = None
        self._lock = asyncio.Lock()
        self.job_id = "news_crawl_job"

        # 빅카인즈 오늘의 키워드 트렌드 전용 상태
        self.trend_job_id = "trend_keywords_job"
        self.is_trend_crawling = False
        self.last_trend_run_at: Optional[datetime] = None
        self.last_trend_result: Optional[Dict[str, Any]] = None
        self._trend_lock = asyncio.Lock()

    async def execute_crawl(self, trigger_type: str = "scheduled") -> Dict[str, Any]:
        """크롤링 실행 함수: 빅카인즈(BigKinds) + RSS 피드 하이브리드 수집"""
        if self.is_crawling:
            return {
                "status": "BUSY",
                "message": "이미 크롤링이 진행 중입니다.",
                "last_run_at": self.last_run_at
            }

        async with self._lock:
            self.is_crawling = True
            started_at = datetime.now(timezone.utc)
            print(f"[Scheduler] ({trigger_type}) 빅카인즈 & RSS 뉴스 크롤링 시작: {started_at.isoformat()}")

            try:
                # 1. 빅카인즈(BigKinds) 및 RSS 병렬 크롤링 수행
                bigkinds_task = crawl_all_bigkinds(limit_per_category=25)
                rss_task = crawl_all_categories(limit_per_feed=20)

                bigkinds_res, rss_res = await asyncio.gather(
                    bigkinds_task, rss_task, return_exceptions=True
                )

                all_articles = []
                category_counts = {}
                errors = []

                # 빅카인즈 결과 취합
                if isinstance(bigkinds_res, dict):
                    all_articles.extend(bigkinds_res.get("articles", []))
                    for cat, cnt in bigkinds_res.get("category_counts", {}).items():
                        category_counts[cat] = category_counts.get(cat, 0) + cnt
                    errors.extend(bigkinds_res.get("errors", []))
                    print(f"[Scheduler] 빅카인즈 수집 완료: {bigkinds_res.get('total_fetched', 0)}개")
                elif isinstance(bigkinds_res, Exception):
                    errors.append(f"빅카인즈 수집 실패: {bigkinds_res}")

                # RSS 결과 취합
                if isinstance(rss_res, dict):
                    all_articles.extend(rss_res.get("articles", []))
                    for cat, cnt in rss_res.get("category_counts", {}).items():
                        category_counts[cat] = category_counts.get(cat, 0) + cnt
                    errors.extend(rss_res.get("errors", []))
                    print(f"[Scheduler] RSS 피드 수집 완료: {rss_res.get('total_fetched', 0)}개")
                elif isinstance(rss_res, Exception):
                    errors.append(f"RSS 피드 수집 실패: {rss_res}")

                # 2. 링크 기준 중복 제거
                unique_articles = []
                seen_links = set()
                for art in all_articles:
                    link = art.get("link")
                    if link and link not in seen_links:
                        seen_links.add(link)
                        unique_articles.append(art)

                # 3. 데이터베이스 저장
                total_fetched, inserted_count = await save_news_batch(unique_articles)

                finished_at = datetime.now(timezone.utc)
                duration = round((finished_at - started_at).total_seconds(), 2)

                # 4. 크롤링 로그 기록
                log_payload = {
                    "articles": unique_articles,
                    "total_fetched": total_fetched,
                    "total_inserted": inserted_count,
                    "categories_crawled": 8,
                    "category_counts": category_counts,
                    "duration_seconds": duration,
                    "errors": errors,
                    "started_at": started_at,
                    "finished_at": finished_at,
                    "trigger_type": trigger_type
                }
                await record_crawl_log(log_payload)

                self.last_run_at = finished_at
                self.last_crawl_result = {
                    "status": "SUCCESS" if not errors else "PARTIAL",
                    "total_fetched": total_fetched,
                    "total_inserted": inserted_count,
                    "category_counts": category_counts,
                    "duration_seconds": duration,
                    "finished_at": finished_at.isoformat(),
                    "errors": errors
                }

                print(
                    f"[Scheduler] 크롤링 완료: 총 {total_fetched}개 수집, {inserted_count}개 신규 저장 (소요시간: {duration}초)"
                )
                return self.last_crawl_result

            except Exception as e:
                print(f"[Scheduler] 크롤링 에러 발생: {e}")
                err_result = {
                    "status": "ERROR",
                    "error": str(e),
                    "finished_at": datetime.now(timezone.utc).isoformat()
                }
                self.last_crawl_result = err_result
                return err_result
            finally:
                self.is_crawling = False

    async def execute_trend_crawl(self, trigger_type: str = "scheduled") -> Dict[str, Any]:
        """빅카인즈 오늘의 키워드 트렌드 크롤링 및 DB 적재 (매일 00:30부터 3시간 간격)"""
        if self.is_trend_crawling:
            return {
                "status": "BUSY",
                "message": "이미 키워드 트렌드 크롤링이 진행 중입니다.",
                "last_run_at": self.last_trend_run_at
            }

        async with self._trend_lock:
            self.is_trend_crawling = True
            started_at = datetime.now(timezone.utc)
            print(f"[TrendScheduler] ({trigger_type}) 빅카인즈 '오늘의 키워드' 수집 시작: {started_at.isoformat()}")

            try:
                res = await fetch_bigkinds_trend_keywords()
                if res.get("status") == "SUCCESS":
                    keywords = res.get("keywords", [])
                    news_count = res.get("news_count", 0)
                    saved_count = await save_trend_keywords_batch(keywords)

                    finished_at = datetime.now(timezone.utc)
                    result_payload = {
                        "status": "SUCCESS",
                        "news_count": news_count,
                        "total_keywords": len(keywords),
                        "saved_count": saved_count,
                        "started_at": started_at.isoformat(),
                        "finished_at": finished_at.isoformat(),
                        "trigger_type": trigger_type
                    }
                    self.last_trend_run_at = finished_at
                    self.last_trend_result = result_payload
                    print(f"[TrendScheduler] 키워드 트렌드 수집 완료: {len(keywords)}개 저장 (분석대상 뉴스: {news_count}건)")
                    return result_payload
                else:
                    err_payload = {
                        "status": "ERROR",
                        "error": res.get("error", "Unknown error"),
                        "finished_at": datetime.now(timezone.utc).isoformat()
                    }
                    self.last_trend_result = err_payload
                    return err_payload
            except Exception as e:
                print(f"[TrendScheduler] 수집 중 예외 발생: {e}")
                err_payload = {
                    "status": "ERROR",
                    "error": str(e),
                    "finished_at": datetime.now(timezone.utc).isoformat()
                }
                self.last_trend_result = err_payload
                return err_payload
            finally:
                self.is_trend_crawling = False

    def start(self):
        """스케줄러 시작:
        1) 뉴스 크롤링: 15분 주기
        2) 빅카인즈 오늘의 키워드: 매일 00시 30분부터 3시간 간격 (00:30, 03:30, 06:30, 09:30, 12:30, 15:30, 18:30, 21:30 KST)
        """
        if not self.scheduler.running:
            # 1. 15분 뉴스 주기
            interval_minutes = getattr(settings, "CRAWL_INTERVAL_MINUTES", 15)
            self.scheduler.add_job(
                self.execute_crawl,
                trigger=IntervalTrigger(minutes=interval_minutes),
                id=self.job_id,
                name=f"{interval_minutes}분 주기 뉴스 크롤링 (빅카인즈 & RSS)",
                replace_existing=True,
                kwargs={"trigger_type": "scheduled"}
            )

            # 2. 빅카인즈 오늘의 키워드 3시간 간격 크론 (매일 00:30, 03:30, 06:30, 09:30, 12:30, 15:30, 18:30, 21:30 KST)
            self.scheduler.add_job(
                self.execute_trend_crawl,
                trigger=CronTrigger(hour="0,3,6,9,12,15,18,21", minute=30, timezone=ZoneInfo("Asia/Seoul")),
                id=self.trend_job_id,
                name="빅카인즈 오늘의 키워드 3시간 주기 수집 (00:30 시작)",
                replace_existing=True,
                kwargs={"trigger_type": "scheduled"}
            )

            self.scheduler.start()
            print(f"[Scheduler] APScheduler 시작 완료 (뉴스: {interval_minutes}분 주기, 오늘의 키워드: 매일 00:30부터 3시간 간격 크론)")

    def shutdown(self):
        """스케줄러 종료"""
        if self.scheduler.running:
            self.scheduler.shutdown()
            print("[Scheduler] APScheduler 정상 종료")

    async def get_status(self) -> Dict[str, Any]:
        """현재 스케줄러 및 크롤러 상태 조회"""
        next_run_at = None
        trend_next_run_at = None
        if self.scheduler.running:
            job = self.scheduler.get_job(self.job_id)
            if job and job.next_run_time:
                next_run_at = job.next_run_time

            trend_job = self.scheduler.get_job(self.trend_job_id)
            if trend_job and trend_job.next_run_time:
                trend_next_run_at = trend_job.next_run_time

        total_news = await get_total_news_count()
        db_mode = get_db_mode()
        interval_minutes = getattr(settings, "CRAWL_INTERVAL_MINUTES", 15)

        return {
            "is_running": self.is_crawling,
            "scheduler_active": self.scheduler.running,
            "last_run_at": self.last_run_at,
            "next_run_at": next_run_at,
            "interval_minutes": interval_minutes,
            "interval_hours": round(interval_minutes / 60.0, 2),
            "db_mode": db_mode,
            "total_news_count": total_news,
            "last_crawl_result": self.last_crawl_result,
            # 키워드 트렌드 스케줄러 정보
            "trend_scheduler": {
                "cron": "00:30부터 3시간 간격 (00:30, 03:30, 06:30, 09:30, 12:30, 15:30, 18:30, 21:30 KST)",
                "is_running": self.is_trend_crawling,
                "last_run_at": self.last_trend_run_at,
                "next_run_at": trend_next_run_at,
                "last_result": self.last_trend_result,
            }
        }


# 싱글톤 인스턴스
news_scheduler = NewsSchedulerService()
