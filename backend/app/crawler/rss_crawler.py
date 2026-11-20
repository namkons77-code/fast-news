import re
import html
import asyncio
import calendar
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
import feedparser
from bs4 import BeautifulSoup
import httpx

from app.crawler.feeds import CATEGORIES


def clean_html(raw_html: Optional[str]) -> str:
    """HTML 태그 제거 및 텍스트 정리 (고속 패스 포함)"""
    if not raw_html:
        return ""
    # HTML 엔티티 언이스케이프
    unescaped = html.unescape(raw_html)
    if "<" not in unescaped:
        return re.sub(r"\s+", " ", unescaped).strip()
    soup = BeautifulSoup(unescaped, "html.parser")
    # 불필요한 태그 제거
    for element in soup(["script", "style", "noscript"]):
        element.decompose()
    text = soup.get_text(separator=" ", strip=True)
    # 연속된 공백 및 줄바꿈 정리
    text = re.sub(r"\s+", " ", text).strip()
    return text


def extract_image_url(entry: Any) -> Optional[str]:
    """피드 엔트리에서 썸네일/대표 이미지 URL 추출"""
    # 1. media_content
    if hasattr(entry, "media_content") and entry.media_content:
        for media in entry.media_content:
            if "url" in media and (media.get("medium") == "image" or "image" in media.get("type", "")):
                return media["url"]

    # 2. media_thumbnail
    if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
        if len(entry.media_thumbnail) > 0 and "url" in entry.media_thumbnail[0]:
            return entry.media_thumbnail[0]["url"]

    # 3. enclosures
    if hasattr(entry, "enclosures") and entry.enclosures:
        for enc in entry.enclosures:
            if "image" in enc.get("type", "") and "href" in enc:
                return enc["href"]

    # 4. summary 또는 content 내부 img 태그
    html_content = ""
    if hasattr(entry, "summary"):
        html_content += entry.summary
    if hasattr(entry, "content"):
        for c in entry.content:
            html_content += c.get("value", "")

    if html_content:
        soup = BeautifulSoup(html_content, "html.parser")
        img = soup.find("img")
        if img and img.get("src"):
            src = img["src"]
            # 1x1 추적 픽셀이나 빈 아이콘 등 제외
            if not any(x in src.lower() for x in ["pixel", "spacer", "blank.gif", "beacon"]):
                return src

    return None


def parse_published_date(entry: Any) -> datetime:
    """발행일 파싱 (feedparser의 UTC struct_time을 calendar.timegm을 통해 오차 없이 UTC datetime으로 변환)"""
    time_struct = getattr(entry, "published_parsed", None) or getattr(entry, "updated_parsed", None)
    if time_struct:
        try:
            return datetime.fromtimestamp(calendar.timegm(time_struct), tz=timezone.utc)
        except Exception:
            pass
    return datetime.now(timezone.utc)


def parse_entry(entry: Any, category_info: Dict[str, Any], default_source: str) -> Dict[str, Any]:
    """개별 RSS 기사 엔트리를 정제된 딕셔너리로 변환"""
    title = clean_html(getattr(entry, "title", "제목 없음"))
    link = getattr(entry, "link", "").strip()
    guid = getattr(entry, "id", None) or getattr(entry, "guid", None) or link

    # 구글 뉴스의 경우 타이틀 끝에 "- 언론사" 형식이 붙어있는 경우가 많음
    source = default_source
    if default_source == "구글뉴스":
        if hasattr(entry, "source") and isinstance(entry.source, dict) and "title" in entry.source:
            source = entry.source["title"]
        elif " - " in title:
            parts = title.rsplit(" - ", 1)
            title = parts[0].strip()
            source = parts[1].strip()

    # 요약문 파싱
    raw_summary = getattr(entry, "summary", "")
    summary = clean_html(raw_summary)

    # 본문 파싱 (content 필드가 있는 경우)
    content = ""
    if hasattr(entry, "content"):
        content_parts = [c.get("value", "") for c in entry.content if isinstance(c, dict)]
        content = clean_html(" ".join(content_parts))
    if not content:
        content = summary

    # 이미지 URL 추출
    image_url = extract_image_url(entry)

    # 경향신문 등 일부 언론사의 RSS 피드에 이미지가 없을 경우 og:image 자동 보강
    if not image_url and "khan.co.kr" in link:
        try:
            with httpx.Client(timeout=2.0, follow_redirects=True) as client:
                resp = client.get(link, headers={"User-Agent": "Mozilla/5.0"})
                if resp.status_code == 200:
                    soup = BeautifulSoup(resp.text, "html.parser")
                    og_tag = soup.find("meta", property="og:image") or soup.find("meta", {"name": "og:image"})
                    if og_tag and og_tag.get("content"):
                        img_c = og_tag.get("content")
                        if not any(x in img_c.lower() for x in ["logo", "icon", "khan_logo"]):
                            image_url = img_c
        except Exception:
            pass

    # 작성자 파싱
    author = getattr(entry, "author", None)

    # 날짜 파싱
    published_at = parse_published_date(entry)

    return {
        "guid": guid,
        "title": title,
        "link": link,
        "summary": summary[:400] if summary else "",
        "content": content,
        "source": source,
        "category": category_info["name"],
        "category_code": category_info["code"],
        "image_url": image_url,
        "author": author,
        "published_at": published_at,
    }


def fetch_feed_sync(url: str, category_info: Dict[str, Any], default_source: str, limit: int = 30) -> List[Dict[str, Any]]:
    """단일 피드 동기 수집 및 파싱 (feedparser는 동기 라이브러리)"""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    }
    try:
        # httpx로 요청 후 feedparser에 문자열 전달 (User-Agent 차단 우회 및 타임아웃 방지)
        with httpx.Client(timeout=10.0, follow_redirects=True, headers=headers) as client:
            response = client.get(url)
            if response.status_code != 200:
                # 직접 feedparser로 시도
                parsed = feedparser.parse(url)
            else:
                parsed = feedparser.parse(response.content)
    except Exception:
        # fallback
        parsed = feedparser.parse(url)

    items = []
    seen_links = set()
    for entry in parsed.entries[:limit]:
        link = getattr(entry, "link", "")
        if not link or link in seen_links:
            continue
        seen_links.add(link)
        try:
            item = parse_entry(entry, category_info, default_source)
            if item["title"] and item["link"]:
                items.append(item)
        except Exception as e:
            continue
    return items


async def fetch_category_news(category_info: Dict[str, Any], limit_per_feed: int = 30) -> List[Dict[str, Any]]:
    """한 카테고리의 모든 피드를 비동기로 수집"""
    loop = asyncio.get_running_loop()
    tasks = []
    for feed in category_info.get("feeds", []):
        tasks.append(
            loop.run_in_executor(
                None,
                fetch_feed_sync,
                feed["url"],
                category_info,
                feed["source"],
                limit_per_feed
            )
        )
    
    results = await asyncio.gather(*tasks, return_exceptions=True)
    combined = []
    seen_links = set()
    for res in results:
        if isinstance(res, list):
            for item in res:
                if item["link"] not in seen_links:
                    seen_links.add(item["link"])
                    combined.append(item)
    return combined


async def crawl_all_categories(limit_per_feed: int = 30) -> Dict[str, Any]:
    """모든 8개 카테고리 크롤링 실행"""
    start_time = datetime.now(timezone.utc)
    all_articles: List[Dict[str, Any]] = []
    category_counts: Dict[str, int] = {}
    errors: List[str] = []

    tasks = [fetch_category_news(cat, limit_per_feed) for cat in CATEGORIES]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    for cat, res in zip(CATEGORIES, results):
        cat_code = cat["code"]
        if isinstance(res, Exception):
            errors.append(f"[{cat['name']}] 수집 에러: {str(res)}")
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
        "categories_crawled": len(CATEGORIES),
        "duration_seconds": round(duration, 2),
        "errors": errors,
        "started_at": start_time,
        "finished_at": end_time
    }
