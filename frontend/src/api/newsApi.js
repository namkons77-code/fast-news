const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

/**
 * 뉴스 목록 조회
 */
export async function fetchNews({ category = '', search = '', source = '', page = 1, limit = 12 } = {}) {
  const params = new URLSearchParams();
  if (category && category !== 'all') params.append('category', category);
  if (search) params.append('search', search);
  if (source) params.append('source', source);
  params.append('page', page);
  params.append('limit', limit);

  const res = await fetch(`${API_BASE}/news?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`뉴스 목록을 불러오지 못했습니다. (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * 카테고리 목록 및 개수 조회
 */
export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/news/categories`);
  if (!res.ok) {
    throw new Error(`카테고리 목록을 불러오지 못했습니다. (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * 뉴스 상세 조회
 */
export async function fetchNewsDetail(id) {
  const res = await fetch(`${API_BASE}/news/${id}`);
  if (!res.ok) {
    throw new Error(`기사 정보를 불러올 수 없습니다. (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * 크롤러 및 스케줄러 상태 조회
 */
export async function fetchCrawlStatus() {
  const res = await fetch(`${API_BASE}/crawler/status`);
  if (!res.ok) {
    throw new Error(`크롤러 상태를 조회하지 못했습니다. (HTTP ${res.status})`);
  }
  return res.json();
}

/**
 * 수동 크롤링 즉시 실행 요청
 */
export async function triggerManualCrawl() {
  const res = await fetch(`${API_BASE}/crawler/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`크롤링을 실행하지 못했습니다. (HTTP ${res.status})`);
  }
  return res.json();
}


/**
 * 전체 언론사 출처 목록 조회
 */
export async function fetchSources() {
  const res = await fetch(`${API_BASE}/news/sources`);
  if (!res.ok) {
    throw new Error(`언론사 목록을 불러오지 못했습니다. (HTTP ${res.status})`);
  }
  return res.json();
}
