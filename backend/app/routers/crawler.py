import asyncio
from fastapi import APIRouter, BackgroundTasks
from app.scheduler import news_scheduler
from app.models.news import CrawlStatusResponse

router = APIRouter(prefix="/api/crawler", tags=["Crawler"])


@router.get("/status", response_model=CrawlStatusResponse)
async def get_crawler_status():
    """크롤러 및 15분 주기 스케줄러 상태 조회"""
    return await news_scheduler.get_status()


@router.post("/run")
async def trigger_manual_crawl(background_tasks: BackgroundTasks):
    """수동 크롤링 즉시 트리거 (비동기 백그라운드 태스크로 실행)"""
    if news_scheduler.is_crawling:
        return {
            "status": "ALREADY_RUNNING",
            "message": "현재 크롤링 작업이 이미 실행 중입니다."
        }

    # 백그라운드로 즉시 크롤링 실행
    background_tasks.add_task(news_scheduler.execute_crawl, trigger_type="manual")

    return {
        "status": "STARTED",
        "message": "수동 크롤링 작업이 시작되었습니다. 잠시 후 새로고침해주세요."
    }
