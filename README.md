# 📰 FastNews — FastAPI & React 기반 실시간 뉴스 크롤링 플랫폼

> **FastAPI** 백엔드와 **React** 프론트엔드로 구축된 카테고리별 RSS 실시간 뉴스 수집 및 제공 사이트입니다.  
> **Python APScheduler**를 통해 **1시간마다 주기적으로 자동 크롤링**을 수행하며, 수집된 기사는 **Supabase (PostgreSQL)** DB에 저장되어 웹 UI를 통해 실시간으로 제공됩니다.

---

## 🌟 주요 기능

1. **빅카인즈 (BigKinds) & 8대 카테고리별 실시간 크롤링**
   - **한국언론진흥재단 빅카인즈(Big Kinds)** 및 실시간 피드 연동
   - 54개 주요 언론사(조선일보, 한국일보, 데일리안, 경향신문, 지역일보 등)의 기사 및 고해상도 썸네일 수집
   - **정치 (politics)**: 국회, 정당, 외교/안보 뉴스
   - **경제 (economy)**: 금융, 부동산, 기업, 증권 등 경제 뉴스
   - **사회 (society)**: 법원/검찰, 교육, 노동, 사건사고 뉴스
   - **문화 (culture)**: 전시, 공연, 도서, 학술, 문화예술 뉴스
   - **국제 (international)**: 미국, 유럽, 아시아 등 글로벌 외교/분쟁 뉴스
   - **지역 (regional)**: 전국 각 지자체 및 지역 소식
   - **스포츠 (sports)**: 축구, 야구, 농구, 해외 스포츠 소식
   - **IT과학 (it_science)**: AI, 모바일, 반도체, 우주/과학 등 최신 IT 소식

2. **APScheduler 1시간 주기 자동 크롤러**
   - 백그라운드에서 `AsyncIOScheduler`가 1시간 간격(`IntervalTrigger(hours=1)`)으로 자동 실행
   - 중복 기사 수집 방지 (고유 URL 및 GUID 기반 중복 제거)
   - UI 상단 '지금 크롤링' 버튼 또는 `POST /api/crawler/run` API를 통한 **수동 즉시 크롤링** 지원

3. **Supabase (PostgreSQL) 데이터베이스 연동**
   - Supabase `news` 및 `crawl_logs` 테이블 지원
   - Row Level Security (RLS) 및 조회 성능 최적화 인덱스 탑재
   - **자동 로컬 Fallback 기능**: Supabase API 키가 없는 개발 환경에서도 로컬 SQLite(`news.db`)로 자동 전환되어 즉시 사용 가능

4. **모던하고 직관적인 React 프론트엔드 UI**
   - 카테고리별 탭 및 실시간 기사 개수 배지
   - 키워드(제목/요약문) 실시간 검색 및 출처 필터링
   - 기사 카드 뷰 (언론사, 발행 시간, 카테고리 배지, 썸네일)
   - 기사 상세 읽기 팝업 모달 & 언론사 원문 새 창 열기
   - 스케줄러 & DB 상태 모니터링 모달

---

## 🛠️ 기술 스택

- **Backend**:
  - Python 3.10+ (FastAPI, Uvicorn)
  - `APScheduler` (1시간 주기 비동기 스케줄링)
  - `feedparser`, `beautifulsoup4`, `httpx` (RSS 피드 파싱 & 웹 데이터 정제)
  - `supabase` (Supabase 공식 파이썬 클라이언트)
  - `pydantic-settings`
- **Frontend**:
  - React 19, Vite
  - Tailwind CSS v4
  - Lucide React (아이콘)

---

## 📂 프로젝트 구조

```
fastapi-news/
├── backend/
│   ├── app/
│   │   ├── config.py             # 환경설정 및 CORS
│   │   ├── database.py           # Supabase 연동 & SQLite 폴백 어댑터
│   │   ├── main.py               # FastAPI 엔트리포인트 및 lifespan
│   │   ├── scheduler.py          # APScheduler 1시간 주기 설정
│   │   ├── crawler/
│   │   │   ├── feeds.py          # 8대 카테고리 RSS 피드 URL 매핑
│   │   │   └── rss_crawler.py    # RSS 파싱, 썸네일/요약 추출 로직
│   │   ├── models/
│   │   │   └── news.py           # Pydantic 데이터 모델
│   │   └── routers/
│   │       ├── news.py           # 뉴스 목록, 상세, 카테고리 API
│   │       └── crawler.py        # 크롤러 상태 조회 및 수동 실행 API
│   ├── supabase_schema.sql       # Supabase 테이블 및 RLS DDL
│   ├── requirements.txt
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── newsApi.js        # 백엔드 API 통신 모듈
│   │   ├── components/
│   │   │   ├── Header.jsx        # 상단 네비게이션 & 스케줄러 뱃지
│   │   │   ├── CategoryNav.jsx   # 8대 카테고리 탭 네비게이션
│   │   │   ├── SearchBar.jsx     # 검색 및 출처 필터
│   │   │   ├── NewsCard.jsx      # 기사 카드 컴포넌트
│   │   │   ├── NewsModal.jsx     # 기사 상세 읽기 모달
│   │   │   ├── Pagination.jsx    # 페이지네이션
│   │   │   └── CrawlStatusModal.jsx # 시스템 모니터링 모달
│   │   ├── utils/
│   │   │   └── formatters.js     # 시간 포맷(방금 전, n분 전) & 테마
│   │   ├── App.jsx
│   │   └── index.css
│   ├── vite.config.js
│   └── package.json
└── README.md
```

---

## 🚀 실행 방법

### 1. 백엔드 (FastAPI) 실행

```bash
cd backend

# 1) 가상환경 생성 (최초 1회)
python -m venv venv

# 가상환경 활성화
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 2) 의존성 설치
pip install -r requirements.txt

# 3) 환경변수 설정 (선택사항)
cp .env.example .env

# 4) 백엔드 서버 시작 (포트 8000)
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

- API 문서(Swagger UI): [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. 프론트엔드 (React) 실행

새 터미널을 열고 다음을 실행합니다:

```bash
cd frontend

# 1) 패키지 설치
npm install

# 2) 개발 서버 시작 (포트 5173)
npm run dev
```

- 웹 브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

---

## 🗄️ Supabase 데이터베이스 연동 안내

본 프로젝트는 Supabase와 완벽히 호환됩니다.

### 1) Supabase에 테이블 생성
1. [Supabase](https://supabase.com)에 로그인 후 신규 프로젝트를 생성합니다.
2. 좌측 메뉴 **SQL Editor**로 이동합니다.
3. 프로젝트의 `backend/supabase_schema.sql` 파일 내용을 복사하여 붙여넣고 **Run** 버튼을 클릭합니다.
   (`news` 테이블, `crawl_logs` 테이블, 인덱스 및 RLS 정책이 생성됩니다.)

### 2) `.env` 파일에 API 키 입력
`backend/.env` 파일을 열고 본인 Supabase 프로젝트의 정보를 입력합니다:
```env
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_KEY=<your-anon-or-service-role-key>

CRAWL_INTERVAL_HOURS=1
CRAWL_ON_STARTUP=true
NEWS_PER_FEED_LIMIT=30
```
- 서버를 재시작하면 자동으로 Supabase 데이터베이스 모드로 전환되어 크롤링된 기사가 Supabase에 저장됩니다.
- (키를 입력하지 않을 경우 자동으로 로컬 SQLite `news.db` 모드로 동작합니다.)

---

## 📡 백엔드 REST API 엔드포인트

| Method | Endpoint | 설명 |
|--------|----------|------|
| `GET` | `/api/news` | 뉴스 목록 조회 (`category`, `search`, `source`, `page`, `limit` 쿼리 파라미터 지원) |
| `GET` | `/api/news/{id}` | 특정 뉴스 기사 상세 정보 조회 |
| `GET` | `/api/news/categories` | 8개 카테고리 목록 및 카테고리별 저장 기사 수 반환 |
| `GET` | `/api/crawler/status` | APScheduler 스케줄러 상태, 다음 크롤링 시각, DB 모드 조회 |
| `POST` | `/api/crawler/run` | 수동 크롤링 즉시 실행 (비동기 백그라운드 태스크) |
| `GET` | `/health` | 서버 헬스체크 |
