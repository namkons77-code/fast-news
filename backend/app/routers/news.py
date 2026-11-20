import math
from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from app.crawler.feeds import CATEGORIES, CATEGORY_MAP
from app.database import get_news, get_news_detail, get_category_counts, get_news_sources
from app.models.news import NewsListResponse, NewsPagination, CategoryItem, NewsItem

router = APIRouter(prefix="/api/news", tags=["News"])


@router.get("", response_model=NewsListResponse)
async def list_news(
    category: Optional[str] = Query(None, description="카테고리 코드 (politics, economy, society, culture, international, regional, sports, it_science)"),
    search: Optional[str] = Query(None, description="검색어 (제목 및 요약)"),
    source: Optional[str] = Query(None, description="언론사 출처 필터"),
    page: int = Query(1, ge=1, description="페이지 번호"),
    limit: int = Query(12, ge=1, le=100, description="페이지당 개수")
):
    """뉴스 기사 목록 조회 (카테고리 필터, 검색, 페이지네이션 지원)"""
    category_name = None
    if category:
        if category in CATEGORY_MAP:
            category_name = CATEGORY_MAP[category]["name"]
        else:
            # 한글 이름으로 들어왔을 경우 대응
            for code, meta in CATEGORY_MAP.items():
                if meta["name"] == category:
                    category_name = category
                    category = code
                    break

    items, total = await get_news(
        category_code=category,
        search=search,
        source=source,
        page=page,
        limit=limit
    )

    total_pages = math.ceil(total / limit) if total > 0 else 1

    return NewsListResponse(
        data=items,
        pagination=NewsPagination(
            page=page,
            limit=limit,
            total=total,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        ),
        category=category_name,
        category_code=category,
        search=search
    )


@router.get("/categories", response_model=list[CategoryItem])
async def list_categories():
    """8개 카테고리 목록 및 카테고리별 기사 통계 반환"""
    counts = await get_category_counts()

    result = []
    for cat in CATEGORIES:
        code = cat["code"]
        result.append(
            CategoryItem(
                code=code,
                name=cat["name"],
                description=cat["description"],
                count=counts.get(code, 0)
            )
        )
    return result


@router.get("/sources")
async def list_sources():
    """전체 언론사 출처 목록 및 건수 반환"""
    return await get_news_sources()


@router.get("/{news_id}", response_model=NewsItem)
async def get_news_by_id(news_id: int):
    """뉴스 상세 정보 조회"""
    item = await get_news_detail(news_id)
    if not item:
        raise HTTPException(status_code=404, detail="해당 뉴스를 찾을 수 없습니다.")
    return item
