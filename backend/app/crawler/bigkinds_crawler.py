import re
import html
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Any, Optional
import httpx
from bs4 import BeautifulSoup

BIGKINDS_CATEGORIES = [
    {"code": "politics", "name": "정치", "bigkinds_code": "001000000"},
    {"code": "economy", "name": "경제", "bigkinds_code": "002000000"},
    {"code": "society", "name": "사회", "bigkinds_code": "003000000"},
    {"code": "culture", "name": "문화", "bigkinds_code": "004000000"},
    {"code": "international", "name": "국제", "bigkinds_code": "005000000"},
    {"code": "regional", "name": "지역", "bigkinds_code": "006000000"},
    {"code": "sports", "name": "스포츠", "bigkinds_code": "007000000"},
    {"code": "it_science", "name": "IT과학", "bigkinds_code": "008000000"},
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": "https://www.bigkinds.or.kr/v2/news/index.do",
    "Content-Type": "application/json; charset=UTF-8",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
}


def clean_text(raw_text: Optional[str]) -> str:
    """HTML 태그 제거 및 텍스트 정리"""
    if not raw_text:
        return ""
    unescaped = html.unescape(raw_text)
    # <br/> 태그 공백 처리
    unescaped = unescaped.replace("<br/>", " ").replace("<br>", " ")
    soup = BeautifulSoup(unescaped, "html.parser")
    for el in soup(["script", "style", "font"]):
        el.decompose()
    text = soup.get_text(separator=" ", strip=True)
    return re.sub(r"\s+", " ", text).strip()


def parse_date(date_str: Optional[str]) -> datetime:
    """빅카인즈 DATE 형식 (YYYYMMDD)을 datetime으로 변환"""
    if not date_str:
        return datetime.now(timezone.utc)
    try:
        dt = datetime.strptime(str(date_str).strip(), "%Y%m%d")
        return dt.replace(tzinfo=timezone.utc)
    except Exception:
        return datetime.now(timezone.utc)


def parse_image_url(images_field: Optional[str]) -> Optional[str]:
    """빅카인즈 IMAGES 필드에서 첫 번째 이미지 URL 추출 (.jpg 확장자 보정)"""
    if not images_field:
        return None
    # 쉼표 또는 공백으로 분리
    urls = [u.strip() for u in str(images_field).split(",") if u.strip()]
    if urls:
        first_url = urls[0]
        if not first_url.startswith("http") and first_url.startswith("/"):
            first_url = f"https://www.bigkinds.or.kr{first_url}"

        # 빅카인즈 이미지 URL은 .01 등 번호로 끝나는 경우가 많으므로 .jpg 확장자 보정
        if "bigkinds.or.kr" in first_url and not any(first_url.lower().endswith(ext) for ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]):
            first_url = f"{first_url}.jpg"

        return first_url
    return None


async def fetch_category_from_bigkinds(
    client: httpx.AsyncClient,
    category_meta: Dict[str, str],
    limit: int = 25
) -> List[Dict[str, Any]]:
    """빅카인즈 API를 호출하여 특정 카테고리의 최신 뉴스 수집"""
    today = datetime.now()
    start_date = (today - timedelta(days=3)).strftime("%Y-%m-%d")
    end_date = today.strftime("%Y-%m-%d")

    payload = {
        "indexName": "news",
        "searchKey": "",
        "searchKeys": [{}],
        "startDate": start_date,
        "endDate": end_date,
        "categoryCodes": [category_meta["bigkinds_code"]],
        "startNo": 1,
        "resultNumber": limit,
        "searchSortType": "date",
        "sortMethod": "date",
        "isTmUsr": False,
        "editorialIs": False,
    }

    try:
        response = await client.post(
            "https://www.bigkinds.or.kr/api/news/search.do",
            json=payload,
            headers=HEADERS,
            timeout=15.0,
        )
        if response.status_code != 200:
            print(f"[BigKinds] {category_meta['name']} HTTP Error: {response.status_code}")
            return []

        data = response.json()
        raw_list = data.get("resultList", [])
        items = []

        for row in raw_list:
            news_id = row.get("NEWS_ID", "").strip()
            title = clean_text(row.get("TITLE", ""))
            if not news_id or not title:
                continue

            # 링크 생성 (원문 링크 우선, 없으면 빅카인즈 상세 뷰)
            link = row.get("PROVIDER_LINK_PAGE", "").strip()
            if not link:
                link = f"https://www.bigkinds.or.kr/v2/news/newsDetailView.do?newsId={news_id}"

            # 요약 및 본문
            summary = clean_text(row.get("CONTENT", ""))
            provider = row.get("PROVIDER", "빅카인즈").strip()
            author = row.get("BYLINE", "").strip() or None
            image_url = parse_image_url(row.get("IMAGES"))
            published_at = parse_date(row.get("DATE"))

            items.append({
                "guid": news_id,
                "title": title,
                "link": link,
                "summary": summary[:400] if summary else "",
                "content": summary,
                "source": provider,
                "category": category_meta["name"],
                "category_code": category_meta["code"],
                "image_url": image_url,
                "author": author,
                "published_at": published_at,
            })

        return items

    except Exception as e:
        print(f"[BigKinds] Error crawling {category_meta['name']}: {e}")
        return []


async def crawl_all_bigkinds(limit_per_category: int = 25) -> Dict[str, Any]:
    """빅카인즈에서 8대 카테고리 전체 비동기 크롤링"""
    start_time = datetime.now(timezone.utc)
    all_articles: List[Dict[str, Any]] = []
    category_counts: Dict[str, int] = {}
    errors: List[str] = []

    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        tasks = [
            fetch_category_from_bigkinds(client, cat, limit=limit_per_category)
            for cat in BIGKINDS_CATEGORIES
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        for cat, res in zip(BIGKINDS_CATEGORIES, results):
            cat_code = cat["code"]
            if isinstance(res, Exception):
                errors.append(f"[{cat['name']}] 빅카인즈 수집 실패: {str(res)}")
                category_counts[cat_code] = 0
            elif isinstance(res, list):
                category_counts[cat_code] = len(res)
                all_articles.extend(res)
            else:
                category_counts[cat_code] = 0

    end_time = datetime.now(timezone.utc)
    duration = (end_time - start_time).total_seconds()

    return {
        "articles": all_articles,
        "total_fetched": len(all_articles),
        "category_counts": category_counts,
        "categories_crawled": len(BIGKINDS_CATEGORIES),
        "duration_seconds": round(duration, 2),
        "errors": errors,
        "started_at": start_time,
        "finished_at": end_time,
    }
