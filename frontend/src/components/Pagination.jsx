import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.total_pages <= 1) return null;

  const { page, total_pages, has_next, has_prev } = pagination;

  // 표시할 페이지 번호 계산
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(total_pages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 my-10">
      {/* 이전 페이지 버튼 */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!has_prev}
        className={`flex items-center justify-center p-2 rounded-xl border text-xs font-medium transition ${
          has_prev
            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
        }`}
        title="이전 페이지"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* 첫 페이지 바로가기 */}
      {pages[0] > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            1
          </button>
          {pages[0] > 2 && <span className="px-1 text-slate-400 text-xs">...</span>}
        </>
      )}

      {/* 페이지 번호 목록 */}
      {pages.map((p) => {
        const isCurrent = p === page;
        return (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-semibold transition ${
              isCurrent
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            {p}
          </button>
        );
      })}

      {/* 마지막 페이지 바로가기 */}
      {pages[pages.length - 1] < total_pages && (
        <>
          {pages[pages.length - 1] < total_pages - 1 && (
            <span className="px-1 text-slate-400 text-xs">...</span>
          )}
          <button
            onClick={() => onPageChange(total_pages)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs font-semibold"
          >
            {total_pages}
          </button>
        </>
      )}

      {/* 다음 페이지 버튼 */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!has_next}
        className={`flex items-center justify-center p-2 rounded-xl border text-xs font-medium transition ${
          has_next
            ? 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
            : 'border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed'
        }`}
        title="다음 페이지"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
