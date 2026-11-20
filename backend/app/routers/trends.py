from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Query, HTTPException

from app.database import (
    get_latest_trend_keywords,
    get_trend_keyword_timestamps,
)
from app.scheduler import news_scheduler

router = APIRouter(prefix="/api/trends", tags=["Trends"])


@router.get("/keywords")
async def get_trend_keywords(
    category: Optional[str] = Query(None, description="카테고리명 (전체, 정치, 경제, 사회, 문화, 국제, 지역, 스포츠, IT과학)"),
    entity_type: Optional[str] = Query(None, description="개체명 유형 (PS: 인물, OG: 기관, LC: 장소)"),
    timestamp: Optional[str] = Query(None, description="특정 수집 스냅샷 타임스탬프 (미입력 시 최신)")
) -> Dict[str, Any]:
    """빅카인즈 오늘의 키워드 워드클라우드 데이터 조회"""
    # 1. DB에서 키워드 데이터 조회
    result = await get_latest_trend_keywords(
        category=category,
        entity_type=entity_type,
        target_timestamp=timestamp
    )

    # 만약 DB에 아직 수집된 데이터가 없다면 즉시 첫 수집 실행 (Zero-Data 방지)
    if not result.get("crawled_at") or result.get("total", 0) == 0:
        crawl_res = await news_scheduler.execute_trend_crawl(trigger_type="on_demand")
        if crawl_res.get("status") == "SUCCESS":
            result = await get_latest_trend_keywords(
                category=category,
                entity_type=entity_type,
                target_timestamp=timestamp
            )

    # 2. 스케줄러 상태 부가 정보 추가
    status = await news_scheduler.get_status()
    trend_sched = status.get("trend_scheduler", {})

    return {
        "status": "SUCCESS",
        "category": category or "전체",
        "entity_type": entity_type or "ALL",
        "crawled_at": result.get("crawled_at"),
        "news_count": result.get("news_count", 0),
        "total": result.get("total", 0),
        "keywords": result.get("keywords", []),
        "scheduler": {
            "schedule": "매일 00:30부터 3시간 간격 (00:30, 03:30, 06:30, 09:30, 12:30, 15:30, 18:30, 21:30 KST)",
            "next_run_at": trend_sched.get("next_run_at"),
            "last_run_at": trend_sched.get("last_run_at"),
        }
    }


@router.post("/crawl")
async def trigger_trend_crawl() -> Dict[str, Any]:
    """빅카인즈 오늘의 키워드 수동 즉시 크롤링"""
    result = await news_scheduler.execute_trend_crawl(trigger_type="manual")
    return result


@router.get("/history")
async def get_trend_history() -> List[str]:
    """수집된 키워드 타임스탬프 이력 목록"""
    return await get_trend_keyword_timestamps()


@router.get("/status")
async def get_trend_status() -> Dict[str, Any]:
    """키워드 트렌드 스케줄러 상태 조회"""
    status = await news_scheduler.get_status()
    return status.get("trend_scheduler", {})
