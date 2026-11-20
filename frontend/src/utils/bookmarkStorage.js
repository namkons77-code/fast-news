const STORAGE_KEY = 'fastnews_bookmarks_v1';

export function getBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function isBookmarked(newsId) {
  const list = getBookmarks();
  return list.some((item) => item.id === newsId);
}

export function toggleBookmark(news) {
  if (!news || !news.id) return false;
  const list = getBookmarks();
  const exists = list.some((item) => item.id === news.id);
  let updated;
  if (exists) {
    updated = list.filter((item) => item.id !== news.id);
  } else {
    updated = [news, ...list];
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save bookmark:', err);
  }
  return !exists;
}
