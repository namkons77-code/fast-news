import re
import asyncio
import httpx
from datetime import datetime, timezone, timedelta
from app.config import settings
from app.database import supabase_client, get_db_connection

def parse_ts(guid):
    if not guid or "." not in guid:
        return None
    try:
        part = guid.split(".")[1]
        m = re.match(r"^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})", part)
        if m:
            kst = timezone(timedelta(hours=9))
            dt = datetime(
                int(m.group(1)), int(m.group(2)), int(m.group(3)),
                int(m.group(4)), int(m.group(5)), int(m.group(6)),
                tzinfo=kst
            )
            return dt.astimezone(timezone.utc).isoformat()
    except Exception:
        pass
    return None

def fix_sqlite():
    print("[SQLite] Updating BigKinds timestamps...")
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, guid FROM news WHERE guid LIKE '%.%' AND published_at LIKE '%T00:00:00%'")
        rows = cursor.fetchall()
        print(f"[SQLite] Found {len(rows)} rows to update")
        updated = 0
        for r in rows:
            new_ts = parse_ts(r["guid"])
            if new_ts:
                cursor.execute("UPDATE news SET published_at = ? WHERE id = ?", (new_ts, r["id"]))
                updated += 1
        conn.commit()
        print(f"[SQLite] Updated {updated} rows successfully.")

async def fix_supabase():
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        print("[Supabase] No credentials configured.")
        return

    print("[Supabase] Updating BigKinds timestamps in Supabase...")
    headers = {
        "apikey": settings.SUPABASE_KEY,
        "Authorization": f"Bearer {settings.SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    limits = httpx.Limits(max_connections=40, max_keepalive_connections=30)
    sem = asyncio.Semaphore(25)

    async with httpx.AsyncClient(headers=headers, limits=limits, timeout=15.0) as client:
        total_updated = 0
        while True:
            # Fetch up to 1000 rows at a time using supabase_client
            res = supabase_client.table("news") \
                .select("id, guid") \
                .like("guid", "%.%") \
                .eq("published_at", "2026-11-20T00:00:00+00:00") \
                .limit(1000) \
                .execute()
            rows = res.data or []
            if not rows:
                print("[Supabase] No more rows with 00:00:00 timestamp.")
                break

            print(f"[Supabase] Fetched batch of {len(rows)} rows to update...")

            async def patch_row(r):
                row_id = r["id"]
                new_ts = parse_ts(r.get("guid")) or "2026-11-20T00:00:01+00:00"
                async with sem:
                    url_patch = f"{settings.SUPABASE_URL}/rest/v1/news?id=eq.{row_id}"
                    await client.patch(url_patch, json={"published_at": new_ts})

            await asyncio.gather(*(patch_row(r) for r in rows))
            total_updated += len(rows)
            print(f"[Supabase] Batch finished. Total updated: {total_updated}")

            if len(rows) < 1000:
                break

    print(f"[Supabase] Finished updating {total_updated} rows in Supabase.")

if __name__ == "__main__":
    fix_sqlite()
    asyncio.run(fix_supabase())
