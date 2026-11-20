-- ===================================================
-- Supabase Schema for News Crawler
-- ===================================================

-- 1. 뉴스 기사 테이블 (news)
CREATE TABLE IF NOT EXISTS public.news (
    id BIGSERIAL PRIMARY KEY,
    guid TEXT,                                -- RSS GUID 또는 고유 식별값
    title TEXT NOT NULL,                      -- 기사 제목
    link TEXT NOT NULL UNIQUE,                -- 기사 원문 링크 (중복 수집 방지)
    summary TEXT,                             -- 기사 요약 / 본문 일부
    content TEXT,                             -- 상세 내용
    source TEXT NOT NULL,                     -- 언론사/출처 (예: 연합뉴스, 조선일보 등)
    category TEXT NOT NULL,                   -- 카테고리 한글명 (정치, 경제, 사회, 문화, 국제, 지역, 스포츠, IT과학)
    category_code TEXT NOT NULL,              -- 카테고리 영문 코드 (politics, economy, society, culture, international, regional, sports, it_science)
    image_url TEXT,                           -- 썸네일/대표 이미지 URL
    author TEXT,                              -- 기자/작성자명 (있을 경우)
    published_at TIMESTAMPTZ NOT NULL,        -- 기사 발행 일시
    crawled_at TIMESTAMPTZ DEFAULT NOW(),     -- 크롤링 일시
    created_at TIMESTAMPTZ DEFAULT NOW()      -- DB 레코드 생성 일시
);

-- 2. 인덱스 생성 (조회 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_news_category_code ON public.news(category_code);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON public.news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_crawled_at ON public.news(crawled_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_source ON public.news(source);

-- 3. 크롤링 로그/이력 테이블 (crawl_logs)
CREATE TABLE IF NOT EXISTS public.crawl_logs (
    id BIGSERIAL PRIMARY KEY,
    status TEXT NOT NULL,                     -- SUCCESS, PARTIAL_SUCCESS, FAILED
    total_fetched INT DEFAULT 0,              -- 수집된 총 건수
    total_inserted INT DEFAULT 0,             -- 새로 DB에 추가된 건수
    categories_crawled INT DEFAULT 0,         -- 처리된 카테고리 수
    duration_seconds NUMERIC(6, 2),           -- 소요 시간(초)
    error_message TEXT,                       -- 에러 메시지 (있을 경우)
    started_at TIMESTAMPTZ DEFAULT NOW(),     -- 크롤링 시작 시각
    finished_at TIMESTAMPTZ                   -- 크롤링 종료 시각
);

-- 4. RLS (Row Level Security) 설정
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crawl_logs ENABLE ROW LEVEL SECURITY;

-- 익명 사용자(anon) 및 인증 사용자 모두 읽기 가능하도록 정책 설정
CREATE POLICY "Allow public read-only access to news" 
ON public.news FOR SELECT USING (true);

CREATE POLICY "Allow service role or anon insert/update to news" 
ON public.news FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read-only access to crawl_logs" 
ON public.crawl_logs FOR SELECT USING (true);

CREATE POLICY "Allow write access to crawl_logs" 
ON public.crawl_logs FOR ALL USING (true) WITH CHECK (true);

-- 5. API 접근을 위한 역할별 테이블 권한 부여 (필수)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.news TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.crawl_logs TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
