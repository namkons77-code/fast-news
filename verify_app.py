import urllib.request
import json

def run_tests():
    print("========================================")
    print(" FastNews E2E Integration Verification ")
    print("========================================")

    # 1. 프론트엔드 접속 확인
    with urllib.request.urlopen('http://localhost:5173') as res:
        html = res.read().decode('utf-8')
        assert res.status == 200
        assert '<div id="root"></div>' in html
        print("✔ 1. Frontend Server (Vite React): Healthy (HTTP 200)")

    # 2. 백엔드 루트 및 헬스체크
    with urllib.request.urlopen('http://127.0.0.1:8000') as res:
        data = json.loads(res.read().decode('utf-8'))
        assert res.status == 200
        assert data.get("status") == "running"
        print(f"✔ 2. Backend Server (FastAPI): Running ({data.get('app')})")

    # 3. 8대 카테고리 API
    with urllib.request.urlopen('http://127.0.0.1:8000/api/news/categories') as res:
        categories = json.loads(res.read().decode('utf-8'))
        assert len(categories) == 8
        expected = ["politics", "economy", "society", "culture", "international", "regional", "sports", "it_science"]
        codes = [c["code"] for c in categories]
        assert set(expected) == set(codes)
        print(f"✔ 3. 8 Categories Verified: {', '.join([c['name'] for c in categories])}")
        for c in categories:
            print(f"     • {c['name']} ({c['code']}): {c['count']}건 저장됨")

    # 4. 뉴스 목록 API 및 카테고리 필터링
    with urllib.request.urlopen('http://127.0.0.1:8000/api/news?category=it_science&limit=3') as res:
        data = json.loads(res.read().decode('utf-8'))
        assert res.status == 200
        assert len(data['data']) > 0
        sample = data['data'][0]
        print(f"✔ 4. Category News Query (IT과학): {data['pagination']['total']} articles found")
        print(f"     • Sample: [{sample['source']}] {sample['title'][:35]}...")

    # 5. 뉴스 상세 조회 API
    sample_id = sample['id']
    with urllib.request.urlopen(f'http://127.0.0.1:8000/api/news/{sample_id}') as res:
        detail = json.loads(res.read().decode('utf-8'))
        assert detail['id'] == sample_id
        assert 'link' in detail
        print(f"✔ 5. News Detail API: ID {sample_id} ({detail['title'][:30]}...)")

    # 6. 스케줄러 상태 API (APScheduler 1시간 주기)
    with urllib.request.urlopen('http://127.0.0.1:8000/api/crawler/status') as res:
        status = json.loads(res.read().decode('utf-8'))
        assert status['interval_hours'] == 1
        assert status['scheduler_active'] is True
        print(f"✔ 6. APScheduler Status: Active (Interval: {status['interval_hours']} hour)")
        print(f"     • Next execution at: {status['next_run_at']}")
        print(f"     • Database Mode: {status['db_mode']}")
        print(f"     • Total Articles: {status['total_news_count']}건")

    # 7. 검색 기능 API
    with urllib.request.urlopen('http://127.0.0.1:8000/api/news?search=%EB%89%B4%EC%8A%A4&limit=2') as res:
        search_res = json.loads(res.read().decode('utf-8'))
        print(f"✔ 7. Search API ('뉴스'): Total {search_res['pagination']['total']} results found")

    print("\n🎉 ALL TESTS SUCCESSFULLY PASSED! System is fully operational.")

if __name__ == '__main__':
    run_tests()
