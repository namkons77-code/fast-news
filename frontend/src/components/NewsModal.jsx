import React, { useEffect } from 'react';
import { X, ExternalLink, Calendar, User, Newspaper, Share2, Check } from 'lucide-react';
import { getCategoryTheme } from '../utils/formatters';

export default function NewsModal({ news, onClose }) {
  const [copied, setCopied] = React.useState(false);
  const [fontSize, setFontSize] = React.useState('lg'); // 'md', 'lg', 'xl'

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

  const contentFontSizeClass = {
    md: 'text-base leading-relaxed',
    lg: 'text-lg leading-[1.8]',
    xl: 'text-xl leading-[1.85]',
  }[fontSize];

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
            {/* 글자 크기 조절 바 */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 mr-1">
              <button
                onClick={() => setFontSize('md')}
                className={`px-2 py-0.5 rounded-lg transition ${fontSize === 'md' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'}`}
                title="글자 크기 보통"
              >
                가
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded-lg transition text-sm ${fontSize === 'lg' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'}`}
                title="글자 크기 크게 (권장)"
              >
                가+
              </button>
              <button
                onClick={() => setFontSize('xl')}
                className={`px-2 py-0.5 rounded-lg transition text-base ${fontSize === 'xl' ? 'bg-white text-blue-600 shadow-xs' : 'hover:text-slate-900'}`}
                title="글자 크기 아주 크게"
              >
                가++
              </button>
            </div>

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
        <div className="p-6 sm:p-9 space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-[1.35] tracking-tight break-keep">
            {news.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>발행: {new Date(news.published_at).toLocaleString('ko-KR')}</span>
            </div>
            {news.author && (
              <div className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-slate-400" />
                <span>기자: {news.author}</span>
              </div>
            )}
          </div>

          {/* 대표 이미지 */}
          {news.image_url && (
            <div className="rounded-2xl overflow-hidden bg-slate-100 max-h-[460px] shadow-xs">
              <img
                src={news.image_url}
                alt={news.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* 요약 및 본문 */}
          <div className="space-y-5 text-slate-800 break-keep">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-slate-800">
              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider mb-1.5">
                핵심 기사 요약
              </div>
              <p className="text-[15px] sm:text-base leading-relaxed font-medium text-slate-700">
                {news.summary || '요약 정보가 없습니다.'}
              </p>
            </div>

            {news.content && news.content !== news.summary && (
              <div className="pt-2 text-slate-800">
                <p className={`${contentFontSizeClass} whitespace-pre-line text-slate-800 font-normal`}>
                  {news.content}
                </p>
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
