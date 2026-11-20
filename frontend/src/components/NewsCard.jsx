import React, { useState, memo } from 'react';
import { ExternalLink, Clock, Newspaper, ArrowUpRight } from 'lucide-react';
import { formatTimeAgo, getCategoryTheme } from '../utils/formatters';

function NewsCard({ news, onClick }) {
  const [imgError, setImgError] = useState(false);
  const theme = getCategoryTheme(news.category_code);

  return (
    <article
      onClick={() => onClick(news)}
      className="group bg-white rounded-2xl border border-slate-200/90 overflow-hidden hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* 썸네일 영역 */}
      <div className="relative aspect-16/9 bg-slate-100 overflow-hidden">
        {news.image_url && !imgError ? (
          <img
            src={news.image_url}
            alt={news.title}
            onError={() => setImgError(true)}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${theme.gradient} opacity-90 flex flex-col items-center justify-center p-6 text-white`}
          >
            <Newspaper className="w-10 h-10 opacity-70 mb-2" />
            <span className="text-xs font-semibold tracking-wide uppercase opacity-90">
              {news.category} 뉴스
            </span>
          </div>
        )}

        {/* 카테고리 뱃지 */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-xs border ${theme.badge} bg-white/90`}
          >
            {news.category}
          </span>
        </div>

        {/* 출처 뱃지 */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-900/70 text-white backdrop-blur-xs">
            {news.source}
          </span>
        </div>
      </div>

      {/* 텍스트 내용 영역 */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-[17px] sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-[1.4] break-keep mb-2.5">
            {news.title}
          </h2>
          <p className="text-[13.5px] sm:text-sm text-slate-600 line-clamp-3 leading-relaxed break-keep mb-4 font-normal">
            {news.summary || '내용 요약이 제공되지 않는 기사입니다. 원문 기사를 확인해주세요.'}
          </p>
        </div>

        {/* 하단 메타정보 */}
        <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{formatTimeAgo(news.published_at)}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={news.link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-slate-600 hover:text-blue-600 font-semibold px-2 py-1 rounded-md hover:bg-slate-100 transition"
              title="언론사 원문 보기"
            >
              <span>원문 보기</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

export default memo(NewsCard);
