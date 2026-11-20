import html
import re
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
import httpx

BIGKINDS_KEYWORD_URL = "https://www.bigkinds.or.kr/api/categoryKeywords.do"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": "https://www.bigkinds.or.kr/",
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "X-Requested-With": "XMLHttpRequest",
}

# 9대 카테고리 매핑 (빅카인즈 원본 카테고리명 -> 서비스 표준명)
CATEGORY_NAME_MAP = {
    "전체": "전체",
    "정치": "정치",
    "경제": "경제",
    "사회": "사회",
    "문화": "문화",
    "국제": "국제",
    "지역": "지역",
    "스포츠": "스포츠",
    "IT_과학": "IT과학",
    "IT과학": "IT과학",
}

# 개체명 타입 한글 레이블 매핑
ENTITY_TYPE_MAP = {
    "PS": "인물",
    "OG": "기관",
    "LC": "장소",
}


async def fetch_bigkinds_trend_keywords() -> Dict[str, Any]:
    """빅카인즈 메인 '오늘의 키워드' API (/api/categoryKeywords.do) 호출 및 파싱"""
    crawled_at = datetime.now(timezone.utc)

    try:
        async with httpx.AsyncClient(timeout=15.0, follow_redirects=True) as client:
            resp = await client.get(BIGKINDS_KEYWORD_URL, headers=HEADERS)

            if resp.status_code != 200:
                return {
                    "status": "ERROR",
                    "error": f"HTTP status {resp.status_code}",
                    "news_count": 0,
                    "keywords": [],
                    "crawled_at": crawled_at.isoformat(),
                }

            data = resp.json()
            news_count = int(data.get("newsCount", 0))
            raw_keywords = data.get("categoryKeyword", [])

            parsed_keywords: List[Dict[str, Any]] = []

            for item in raw_keywords:
                raw_cat = item.get("CATEGORY_NAME", "전체").strip()
                cat_name = CATEGORY_NAME_MAP.get(raw_cat, raw_cat)
                cat_code = str(item.get("CATEGORY_CODE", "")).strip()

                entity_name = str(item.get("NAMED_ENTITY", "")).strip()
                entity_type = str(item.get("NAMED_ENTITY_TYPE", "")).strip()
                
                try:
                    count = int(item.get("NAMED_ENTITY_COUNT", 0))
                except (ValueError, TypeError):
                    count = 0

                step = str(item.get("ENTITY_STEP", "step1")).strip()

                if not entity_name:
                    continue

                parsed_keywords.append({
                    "category_name": cat_name,
                    "category_code": cat_code,
                    "entity_name": entity_name,
                    "entity_type": entity_type,
                    "entity_type_label": ENTITY_TYPE_MAP.get(entity_type, entity_type),
                    "count": count,
                    "step": step,
                    "news_count": news_count,
                    "crawled_at": crawled_at.isoformat(),
                })

            return {
                "status": "SUCCESS",
                "news_count": news_count,
                "total_keywords": len(parsed_keywords),
                "keywords": parsed_keywords,
                "crawled_at": crawled_at.isoformat(),
            }

    except Exception as e:
        print(f"[TrendCrawler Error] {e}")
        return {
            "status": "ERROR",
            "error": str(e),
            "news_count": 0,
            "keywords": [],
            "crawled_at": crawled_at.isoformat(),
        }
