import React, { useEffect } from 'react';
import { X, ExternalLink, Calendar, User, Newspaper, Share2, Check } from 'lucide-react';
import { getCategoryTheme } from '../utils/formatters';

export default function NewsModal({ news, onClose }) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!news) return null;

  const theme = getCategoryTheme(news.category_code);

  const handleShare = () => {
    navigator.clipboard.writeText(news.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 닫기 버튼 */}
        <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${theme.badge}`}>
              {news.category}
            </span>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              {news.source}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition"
              title="기사 링크 복사"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition"
              title="닫기 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 본문 내용 */}
        <div className="p-6 sm:p-8 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
            {news.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>발행: {new Date(news.published_at).toLocaleString('ko-KR')}</span>
            </div>
            {news.author && (
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                <span>기자/작성자: {news.author}</span>
              </div>
            )}
          </div>

          {/* 대표 이미지 */}
          {news.image_url && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-96">
              <img
                src={news.image_url}
                alt={news.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 요약 및 본문 */}
          <div className="space-y-4 text-slate-700 leading-relaxed text-sm sm:text-base">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 text-slate-800 font-medium">
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1">
                기사 요약
              </div>
              <p>{news.summary || '요약 정보가 없습니다.'}</p>
            </div>

            {news.content && news.content !== news.summary && (
              <div className="prose prose-slate max-w-none pt-2">
                <p className="whitespace-pre-line">{news.content}</p>
              </div>
            )}
          </div>
        </div>

        {/* 하단 액션 버튼 */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200/80 px-6 py-4 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            저작권은 해당 언론사({news.source})에 있습니다.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition"
            >
              닫기
            </button>
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <span>언론사 원문 보기</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
