const RAW_BASE = import.meta.env.VITE_API_BASE_URL || '/api';
const API_BASE_URL = RAW_BASE.endsWith('/') ? RAW_BASE.slice(0, -1) : RAW_BASE;

/**
 * 빅카인즈 오늘의 키워드 트렌드 데이터 조회
 * @param {Object} params - { category, entityType, timestamp }
 */
export async function fetchTrendKeywords({ category, entityType, timestamp } = {}) {
  const query = new URLSearchParams();
  if (category && category !== '전체') query.append('category', category);
  if (entityType && entityType !== 'ALL') query.append('entity_type', entityType);
  if (timestamp) query.append('timestamp', timestamp);

  const url = `${API_BASE_URL}/trends/keywords${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`키워드 조회 실패: ${res.status}`);
  }
  return await res.json();
}

/**
 * 빅카인즈 오늘의 키워드 수동 즉시 수집 트리거
 */
export async function triggerTrendCrawl() {
  const res = await fetch(`${API_BASE_URL}/trends/crawl`, {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`키워드 수동 크롤링 실패: ${res.status}`);
  }
  return await res.json();
}

/**
 * 키워드 타임스탬프 이력 목록 조회
 */
export async function fetchTrendHistory() {
  const res = await fetch(`${API_BASE_URL}/trends/history`);
  if (!res.ok) {
    throw new Error(`키워드 이력 조회 실패: ${res.status}`);
  }
  return await res.json();
}

/**
 * 트렌드 스케줄러 상태 조회
 */
export async function fetchTrendStatus() {
  const res = await fetch(`${API_BASE_URL}/trends/status`);
  if (!res.ok) {
    throw new Error(`트렌드 상태 조회 실패: ${res.status}`);
  }
  return await res.json();
}
