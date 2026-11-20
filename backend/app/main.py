import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import news, crawler
from app.scheduler import news_scheduler
from app.database import get_total_news_count


@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. APScheduler 시작 (15분 주기 크롤링 등록)
    news_scheduler.start()

    # 2. 서버 기동 시 최신 기사 즉시 크롤링 백그라운드 실행
    if settings.CRAWL_ON_STARTUP:
        async def initial_crawl_task():
            print("[Lifespan] 서버 시작 즉시 최신 기사 크롤링을 백그라운드로 실행합니다...")
            await news_scheduler.execute_crawl(trigger_type="startup")

        asyncio.create_task(initial_crawl_task())

    yield

    # 종료 시 스케줄러 안전 종료
    news_scheduler.shutdown()


app = FastAPI(
    title=settings.APP_NAME,
    description="카테고리별 RSS 뉴스 크롤링 & 15분 주기 APScheduler & Supabase DB 뉴스 서비스",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(news.router)
app.include_router(crawler.router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "running",
        "scheduler_interval": f"{settings.CRAWL_INTERVAL_MINUTES} minute(s)",
        "docs_url": "/docs"
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
