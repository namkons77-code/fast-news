/**
 * 날짜를 상대적 시간(예: '10분 전', '2시간 전') 또는 포맷된 문자열로 변환
 */
export function formatTimeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return '방금 전';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}일 전`;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

/**
 * 카테고리별 테마 색상 및 배지 스타일
 */
export const CATEGORY_THEMES = {
  politics: {
    label: '정치',
    badge: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    gradient: 'from-red-500 to-rose-600',
    iconColor: 'text-red-500',
  },
  economy: {
    label: '경제',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    gradient: 'from-emerald-500 to-teal-600',
    iconColor: 'text-emerald-500',
  },
  society: {
    label: '사회',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    gradient: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-500',
  },
  culture: {
    label: '문화',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    gradient: 'from-purple-500 to-indigo-600',
    iconColor: 'text-purple-500',
  },
  international: {
    label: '국제',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    gradient: 'from-blue-500 to-cyan-600',
    iconColor: 'text-blue-500',
  },
  regional: {
    label: '지역',
    badge: 'bg-teal-50 text-teal-700 border-teal-200',
    dot: 'bg-teal-500',
    gradient: 'from-teal-500 to-green-600',
    iconColor: 'text-teal-500',
  },
  sports: {
    label: '스포츠',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    gradient: 'from-orange-500 to-amber-600',
    iconColor: 'text-orange-500',
  },
  it_science: {
    label: 'IT과학',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    gradient: 'from-indigo-500 to-violet-600',
    iconColor: 'text-indigo-500',
  },
};

export function getCategoryTheme(code) {
  return CATEGORY_THEMES[code] || {
    label: '기타',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-500',
    gradient: 'from-slate-500 to-slate-700',
    iconColor: 'text-slate-500',
  };
}
