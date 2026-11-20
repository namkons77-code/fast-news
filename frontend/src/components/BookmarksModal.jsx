import React from 'react';
import { X, Bookmark, Trash2, ArrowUpRight, ExternalLink } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

export default function BookmarksModal({
  bookmarks = [],
  onClose,
  onSelectNews,
  onRemoveBookmark,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 relative p-6 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                내 스크랩 기사 ({bookmarks.length})
              </h3>
              <p className="text-xs text-slate-400">
                나중에 읽기 위해 저장해 둔 기사 목록입니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 기사 목록 */}
        <div className="py-4 space-y-3 flex-1 overflow-y-auto">
          {bookmarks.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p className="text-xs">아직 스크랩한 기사가 없습니다.</p>
              <p className="text-[11px] text-slate-300 mt-1">
                기사 카드의 책갈피(★) 아이콘을 눌러 저장해보세요.
              </p>
            </div>
          ) : (
            bookmarks.map((art) => (
              <div
                key={art.id}
                onClick={() => {
                  onSelectNews(art);
                  onClose();
                }}
                className="group flex items-start justify-between gap-3 p-3.5 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/20 transition cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-1">
                    <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {art.source}
                    </span>
                    <span>·</span>
                    <span>{art.category}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(art.published_at)}</span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBookmark(art);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition"
                  title="스크랩 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* 닫기 버튼 */}
        <div className="pt-3 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
