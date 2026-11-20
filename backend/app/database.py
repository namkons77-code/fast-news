import os
import sqlite3
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional, Tuple
from app.config import settings

# SQLite 데이터베이스 경로
SQLITE_DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "news.db")

# Supabase 클라이언트 초기화 및 가용성 검증 (Fail-Fast)
supabase_client = None
USE_SUPABASE = False

if settings.SUPABASE_URL and settings.SUPABASE_KEY and "your-project" not in settings.SUPABASE_URL:
    try:
        from supabase import create_client, Client
        client_candidate: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        # 테이블 조회 권한 1회 사전 검증
        test_res = client_candidate.table("news").select("id").limit(1).execute()
        supabase_client = client_candidate
        USE_SUPABASE = True
        print(f"[Database] Supabase 연결 및 권한 검증 성공: {settings.SUPABASE_URL}")
    except Exception as e:
        print(f"[Database] Supabase 권한/연결 오류 ({e}). 고성능 SQLite(WAL 모드)로 즉시 전환합니다.")
        USE_SUPABASE = False
else:
    print("[Database] Supabase 미설정. 고성능 로컬 SQLite(news.db)를 사용합니다.")


def get_db_connection() -> sqlite3.Connection:
    """최적화된 SQLite 연결 반환 (WAL 모드, 캐시 64MB, Row 팩토리)"""
    conn = sqlite3.connect(SQLITE_DB_PATH, timeout=20.0)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode = WAL;")
    conn.execute("PRAGMA synchronous = NORMAL;")
    conn.execute("PRAGMA cache_size = -64000;")  # 64MB 메모리 캐시
    conn.execute("PRAGMA temp_store = MEMORY;")
    return conn


def init_sqlite_db():
    """SQLite 테이블 생성 및 고속 인덱스 구축"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                guid TEXT,
                title TEXT NOT NULL,
                link TEXT NOT NULL UNIQUE,
                summary TEXT,
                content TEXT,
                source TEXT NOT NULL,
                category TEXT NOT NULL,
                category_code TEXT NOT NULL,
                image_url TEXT,
                author TEXT,
                published_at TEXT NOT NULL,
                crawled_at TEXT DEFAULT CURRENT_TIMESTAMP,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        """)
        # 고속 조회 인덱스
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_news_category_code ON news(category_code)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at DESC)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_news_link ON news(link)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_news_source ON news(source)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_news_cat_pub ON news(category_code, published_at DESC)")

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS crawl_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                status TEXT NOT NULL,
                total_fetched INT DEFAULT 0,
                total_inserted INT DEFAULT 0,
                categories_crawled INT DEFAULT 0,
                duration_seconds REAL,
                error_message TEXT,
                started_at TEXT,
                finished_at TEXT
            )
        """)
        conn.commit()


# 앱 시작 시 SQLite 초기화
init_sqlite_db()


def get_db_mode() -> str:
    return "supabase" if USE_SUPABASE else "sqlite (WAL optimized)"


async def save_news_batch(articles: List[Dict[str, Any]]) -> Tuple[int, int]:
    """기사 목록을 DB에 배치 저장 (중복은 무시, executemany 최적화)"""
    if not articles:
        return 0, 0

    inserted_count = 0

    if USE_SUPABASE and supabase_client:
        try:
            prepared_records = []
            for a in articles:
                rec = dict(a)
                if isinstance(rec.get("published_at"), datetime):
                    rec["published_at"] = rec["published_at"].isoformat()
                prepared_records.append(rec)

            chunk_size = 50
            for i in range(0, len(prepared_records), chunk_size):
                chunk = prepared_records[i : i + chunk_size]
                res = supabase_client.table("news").upsert(
                    chunk, on_conflict="link", ignore_duplicates=True
                ).execute()
                if res.data:
                    inserted_count += len(res.data)
            return len(articles), inserted_count
        except Exception as e:
            print(f"[Supabase Save Error] {e}. Saving to SQLite fallback...")

    # SQLite 고속 배치 저장
    with get_db_connection() as conn:
        cursor = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        
        insert_rows = []
        for a in articles:
            pub_date = (
                a["published_at"].isoformat()
                if isinstance(a["published_at"], datetime)
                else str(a["published_at"])
            )
            insert_rows.append((
                a.get("guid"),
                a.get("title"),
                a.get("link"),
                a.get("summary"),
                a.get("content"),
                a.get("source"),
                a.get("category"),
                a.get("category_code"),
                a.get("image_url"),
                a.get("author"),
                pub_date,
                now_str,
                now_str,
            ))

        cursor.executemany(
            """
            INSERT OR IGNORE INTO news 
            (guid, title, link, summary, content, source, category, category_code, image_url, author, published_at, crawled_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            insert_rows
        )
        inserted_count = cursor.rowcount
        conn.commit()

    return len(articles), inserted_count


async def record_crawl_log(log_data: Dict[str, Any]):
    """크롤링 실행 로그 기록"""
    started = log_data.get("started_at")
    finished = log_data.get("finished_at")
    s_str = started.isoformat() if isinstance(started, datetime) else str(started)
    f_str = finished.isoformat() if isinstance(finished, datetime) else str(finished)

    if USE_SUPABASE and supabase_client:
        try:
            supabase_client.table("crawl_logs").insert({
                "status": "SUCCESS" if not log_data.get("errors") else "PARTIAL",
                "total_fetched": log_data.get("total_fetched", 0),
                "total_inserted": log_data.get("total_inserted", 0),
                "categories_crawled": log_data.get("categories_crawled", 0),
                "duration_seconds": log_data.get("duration_seconds", 0.0),
                "error_message": "; ".join(log_data.get("errors", [])) if log_data.get("errors") else None,
                "started_at": s_str,
                "finished_at": f_str,
            }).execute()
            return
        except Exception:
            pass

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """
            INSERT INTO crawl_logs 
            (status, total_fetched, total_inserted, categories_crawled, duration_seconds, error_message, started_at, finished_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                "SUCCESS" if not log_data.get("errors") else "PARTIAL",
                log_data.get("total_fetched", 0),
                log_data.get("total_inserted", 0),
                log_data.get("categories_crawled", 0),
                log_data.get("duration_seconds", 0.0),
                "; ".join(log_data.get("errors", [])) if log_data.get("errors") else None,
                s_str,
                f_str,
            ),
        )
        conn.commit()


async def get_news(
    category_code: Optional[str] = None,
    search: Optional[str] = None,
    source: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
) -> Tuple[List[Dict[str, Any]], int]:
    """뉴스 목록 조회 및 페이지네이션 (인덱스 최적화)"""
    offset = (page - 1) * limit

    if USE_SUPABASE and supabase_client:
        try:
            query = supabase_client.table("news").select("*", count="exact")
            if category_code:
                query = query.eq("category_code", category_code)
            if search:
                query = query.or_(f"title.ilike.%{search}%,summary.ilike.%{search}%")
            if source:
                query = query.eq("source", source)

            res = (
                query.order("published_at", desc=True)
                .range(offset, offset + limit - 1)
                .execute()
            )
            items = res.data or []
            total = res.count or len(items)
            return items, total
        except Exception:
            pass

    # SQLite 고속 인덱스 조회
    with get_db_connection() as conn:
        cursor = conn.cursor()

        where_clauses = []
        params = []

        if category_code:
            where_clauses.append("category_code = ?")
            params.append(category_code)

        if search:
            where_clauses.append("(title LIKE ? OR summary LIKE ?)")
            search_param = f"%{search}%"
            params.extend([search_param, search_param])

        if source:
            where_clauses.append("source = ?")
            params.append(source)

        where_str = " WHERE " + " AND ".join(where_clauses) if where_clauses else ""

        # 총 개수 계산
        count_sql = f"SELECT COUNT(*) FROM news{where_str}"
        cursor.execute(count_sql, params)
        total = cursor.fetchone()[0]

        # 데이터 조회: published_at 인덱스를 직렬로 활용
        select_sql = f"""
            SELECT * FROM news{where_str}
            ORDER BY published_at DESC
            LIMIT ? OFFSET ?
        """
        cursor.execute(select_sql, params + [limit, offset])
        rows = cursor.fetchall()
        items = [dict(r) for r in rows]

        return items, total


async def get_news_detail(news_id: int) -> Optional[Dict[str, Any]]:
    """뉴스 상세 조회"""
    if USE_SUPABASE and supabase_client:
        try:
            res = supabase_client.table("news").select("*").eq("id", news_id).single().execute()
            if res.data:
                return res.data
        except Exception:
            pass

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM news WHERE id = ?", (news_id,))
        row = cursor.fetchone()
        return dict(row) if row else None


async def get_category_counts() -> Dict[str, int]:
    """카테고리별 뉴스 개수 집계 (GROUP BY 인덱스 활용)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT category_code, COUNT(*) FROM news GROUP BY category_code")
        return {row[0]: row[1] for row in cursor.fetchall()}


async def get_total_news_count() -> int:
    """전체 뉴스 개수"""
    if USE_SUPABASE and supabase_client:
        try:
            res = supabase_client.table("news").select("id", count="exact").limit(1).execute()
            return res.count or 0
        except Exception:
            pass

    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM news")
        return cursor.fetchone()[0]


async def get_news_sources() -> List[Dict[str, Any]]:
    """전체 언론사 출처 목록 및 기사 수 집계 (인덱스 활용)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT source, COUNT(*) as cnt FROM news GROUP BY source ORDER BY cnt DESC")
        rows = cursor.fetchall()
        return [{"source": row[0], "count": row[1]} for row in rows]
