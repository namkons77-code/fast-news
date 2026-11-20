from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class NewsBase(BaseModel):
    title: str
    link: str
    summary: Optional[str] = None
    content: Optional[str] = None
    source: str
    category: str
    category_code: str
    image_url: Optional[str] = None
    author: Optional[str] = None
    published_at: datetime
    guid: Optional[str] = None


class NewsCreate(NewsBase):
    pass


class NewsItem(NewsBase):
    id: int
    crawled_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class NewsPagination(BaseModel):
    page: int
    limit: int
    total: int
    total_pages: int
    has_next: bool
    has_prev: bool


class NewsListResponse(BaseModel):
    data: List[NewsItem]
    pagination: NewsPagination
    category: Optional[str] = None
    category_code: Optional[str] = None
    search: Optional[str] = None


class CategoryItem(BaseModel):
    code: str
    name: str
    description: str
    count: int = 0


class CrawlStatusResponse(BaseModel):
    is_running: bool
    scheduler_active: bool = True
    last_run_at: Optional[datetime] = None
    next_run_at: Optional[datetime] = None
    interval_minutes: int = 15
    interval_hours: Optional[float] = 0.25
    db_mode: str  # "supabase" or "sqlite (local fallback)"
    total_news_count: int
    last_crawl_result: Optional[dict] = None
