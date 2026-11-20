"""
카테고리별 RSS 피드 정의
요구사항 카테고리: 정치, 경제, 문화, 사회, 국제, 지역, 스포츠, IT과학
"""

CATEGORIES = [
    {
        "code": "politics",
        "name": "정치",
        "description": "국회, 정당, 청와대/대통령실, 외교/안보 등 정치 뉴스",
        "feeds": [
            {
                "source": "연합뉴스",
                "url": "https://www.yna.co.kr/rss/politics.xml"
            },
            {
                "source": "구글뉴스",
                "url": "https://news.google.com/rss/headlines/section/topic/POLITICS?hl=ko&gl=KR&ceid=KR:ko"
            }
        ]
    },
    {
        "code": "economy",
        "name": "경제",
        "description": "금융, 증권, 부동산, 기업, 거시경제 등 경제 뉴스",
        "feeds": [
            {
                "source": "연합뉴스",
                "url": "https://www.yna.co.kr/rss/economy.xml"
            },
            {
                "source": "구글뉴스",
                "url": "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=ko&gl=KR&ceid=KR:ko"
            }
        ]
    },
    {
        "code": "society",
        "name": "사회",
        "description": "사건사고, 법원/검찰, 교육, 노동, 환경 등 사회 뉴스",
        "feeds": [
            {
                "source": "연합뉴스",
                "url": "https://www.yna.co.kr/rss/society.xml"
            },
            {
                "source": "구글뉴스",
                "url": "https://news.google.com/rss/search?q=%EC%82%AC%ED%92%8C+%EA%B8%B0%EC%82%AC&hl=ko&gl=KR&ceid=KR:ko"
            }
        ]
    },
    {
        "code": "culture",
        "name": "문화",
        "description": "공연, 전시, 도서, 학술, 영화/음악/방송 등 문화예술 뉴스",
        "feeds": [
            {
                "source": "연합뉴스",
                "url": "https://www.yna.co.kr/rss/culture.xml"
            },
            {
                "source": "구글뉴스",
                "url": "https://news.google.com/rss/search?q=%EB%AC%B8%ED%99%94%EC%98%88%EC%88%A0&hl=ko&gl=KR&ceid=KR:ko"
            }
        ]
    },
    {
        "code": "international",
        "name": "국제",
        "description": "미국, 중국, 일본, 유럽, 글로벌 외교/분쟁 등 국제 뉴스",
        "feeds": [
            {
                "source": "연합뉴스",
                "url": "https://www.yna.co.kr/rss/international.xml"
            },
            {
                "source": "구글뉴스",
                "url": "https://news.google.com/rss/headlines/section/topic/WORLD?hl=ko&gl=KR&ceid=KR:ko"
            }
        ]
    },
    {
        "code": "regional",
        "name": "지역",
        "description": "수도권, 영남, 호남, 충청, 강원, 제주 등 전국 지자체 소식",
        "feeds": [
            {
                "source": "연합뉴스",
                "url": "https://www.yna.co.kr/rss/local.xml"
            },
            {
                "source": "구글뉴스",
                "url": "https://news.google.com/rss/search?q=%EC%A7%80%EC%97%AD+%EC%A7%80%EC%9E%90%EC%B2%B4&hl=ko&gl=KR&ceid=KR:ko"
            }
        ]
    },
    {
        "code": "sports",
        "name": "스포츠",
        "description": "야구, 축구, 농구, 배구, 해외스포츠, 골프 등 스포츠 소식",
        "feeds": [
            {
                "source": "연합뉴스",
                "url": "https://www.yna.co.kr/rss/sports.xml"
            },
            {
                "source": "구글뉴스",
                "url": "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=ko&gl=KR&ceid=KR:ko"
            }
        ]
    },
    {
        "code": "it_science",
        "name": "IT과학",
        "description": "인공지능, 모바일, 인터넷, 통신, 반도체, 우주/과학 등 IT과학 뉴스",
        "feeds": [
            {
                "source": "연합뉴스",
                "url": "https://www.yna.co.kr/rss/industry.xml"
            },
            {
                "source": "구글뉴스",
                "url": "https://news.google.com/rss/headlines/section/topic/SCITECH?hl=ko&gl=KR&ceid=KR:ko"
            }
        ]
    }
]

# 코드로 카테고리 빠른 검색
CATEGORY_MAP = {c["code"]: c for c in CATEGORIES}
