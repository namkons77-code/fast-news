"""
SQLite news.db -> Supabase 일괄 마이그레이션 스크립트
Supabase SQL 권한 설정 완료 후 실행하면 로컬 기사를 Supabase 클라우드로 전송합니다.
"""
import sqlite3
import os
import asyncio
from datetime import datetime, timezone
from supabase import create_client
from app.config import settings

SQLITE_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "news.db")


async def migrate():
    print("=== Supabase 마이그레이션 시작 ===")
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        print("[Error] .env 파일에 SUPABASE_URL 및 SUPABASE_KEY가 설정되지 않았습니다.")
        return

    client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

    # 1. 연결 및 권한 테스트
    try:
        test = client.table("news").select("id").limit(1).execute()
        print(f"[1/3] Supabase 연결 및 권한 확인 성공! (기존 Supabase 기사 수: {len(test.data)})")
    except Exception as e:
        print(f"[Error] Supabase 테이블 접근 실패: {e}")
        print("\n▶ 해결 방법: Supabase 대시보드 > SQL Editor에서 아래 쿼리를 먼저 실행해주세요:")
        print("----------------------------------------------------------------")
        print("GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;")
        print("GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;")
        print("GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;")
        print("ALTER TABLE public.news DISABLE ROW LEVEL SECURITY;")
        print("ALTER TABLE public.crawl_logs DISABLE ROW LEVEL SECURITY;")
        print("----------------------------------------------------------------")
        return

    # 2. SQLite 데이터 추출
    conn = sqlite3.connect(SQLITE_DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM news ORDER BY id ASC")
    rows = cursor.fetchall()
    total_rows = len(rows)
    print(f"[2/3] 로컬 SQLite 기사 총 {total_rows}건 추출 완료.")

    # 3. 50개씩 청크 분할하여 Supabase에 Upsert
    chunk_size = 50
    inserted_total = 0

    print("[3/3] Supabase 클라우드로 전송 중...")
    for i in range(0, total_rows, chunk_size):
        chunk = rows[i : i + chunk_size]
        records = []
        for r in chunk:
            item = dict(r)
            # id는 Supabase의 BIGSERIAL이 자동 생성하도록 제외 (link가 UNIQUE 키)
            if "id" in item:
                del item["id"]
            records.append(item)

        try:
            res = client.table("news").upsert(records, on_conflict="link", ignore_duplicates=True).execute()
            count = len(res.data) if res.data else len(records)
            inserted_total += count
            pct = min(100, round((i + len(chunk)) / total_rows * 100))
            print(f"  -> 전송 진행률: {pct}% ({inserted_total}/{total_rows}건 완료)")
        except Exception as e:
            print(f"  [경고] 청크 {i}~{i+chunk_size} 전송 중 오류: {e}")

    print(f"\n🎉 마이그레이션 완료! 총 {inserted_total}건의 기사가 Supabase에 성공적으로 적재되었습니다.")


if __name__ == "__main__":
    asyncio.run(migrate())
