import React from 'react';
import { Clock, Bookmark, ArrowUpRight, Newspaper, Flame, Eye } from 'lucide-react';
import { formatTimeAgo, getCategoryTheme } from '../utils/formatters';

export default function MagazineHero({
  topArticle,
  subArticles = [],
  trendingArticles = [],
  onSelectNews,
  onToggleBookmark,
  bookmarkedIds = new Set(),
}) {
  if (!topArticle) return null;

  const topTheme = getCategoryTheme(topArticle.category_code);
  const isTopBookmarked = bookmarkedIds.has(topArticle.id);

  return (
    <section className="mb-10">
      {/* 섹션 타이틀 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-6 bg-blue-600 rounded-full inline-block"></span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            오늘의 1면 헤드라인 & 이슈 브리핑
          </h2>
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">
          실시간 주요 뉴스 분석 & 큐레이션
        </span>
      </div>

      {/* 3단 그리드 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 좌측: 대형 메인 헤드라인 커버 스토리 (7칸) */}
        <div
          onClick={() => onSelectNews(topArticle)}
          className="lg:col-span-7 group relative bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-blue-400 transition-all duration-300 flex flex-col cursor-pointer"
        >
          {/* 와이드 이미지 영역 */}
          <div className="relative aspect-16/10 bg-slate-900 overflow-hidden">
            {topArticle.image_url ? (
              <img
                src={topArticle.image_url}
                alt={topArticle.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${topTheme.gradient} flex flex-col items-center justify-center text-white`}
              >
                <Newspaper className="w-16 h-16 opacity-60 mb-2" />
                <span className="text-sm font-bold opacity-80 uppercase">
                  {topArticle.category} 헤드라인
                </span>
              </div>
            )}

            {/* 어두운 그라디언트 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

            {/* 상단 뱃지 & 북마크 */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-600 text-white shadow-md">
                  TOP STORY
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md bg-white/90 ${topTheme.badge}`}
                >
                  {topArticle.category}
                </span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleBookmark(topArticle);
                }}
                className={`p-2 rounded-full backdrop-blur-md transition ${
                  isTopBookmarked
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'bg-slate-900/60 text-white hover:bg-slate-900/90'
                }`}
                title={isTopBookmarked ? '스크랩 취소' : '기사 스크랩'}
              >
                <Bookmark className={`w-4 h-4 ${isTopBookmarked ? 'fill-white' : ''}`} />
              </button>
            </div>

            {/* 이미지 하단 출처 & 시간 */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-xs text-white/90">
              <span className="font-bold bg-slate-900/80 px-2.5 py-1 rounded-lg backdrop-blur-xs">
                {topArticle.source}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <Clock className="w-3.5 h-3.5" />
                {formatTimeAgo(topArticle.published_at)}
              </span>
            </div>
          </div>

          {/* 메인 텍스트 정보 */}
          <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-[26px] font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-[1.35] tracking-tight break-keep mb-3">
                {topArticle.title}
              </h3>
              <p className="text-sm sm:text-[15px] text-slate-600 line-clamp-3 leading-relaxed break-keep font-normal">
                {topArticle.summary || topArticle.content}
              </p>
            </div>

            <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center gap-1">
                기사 전문 읽기 <ArrowUpRight className="w-4 h-4" />
              </span>
              {topArticle.author && (
                <span className="text-xs text-slate-400 font-medium">기자: {topArticle.author}</span>
              )}
            </div>
          </div>
        </div>

        {/* 우측: 서브 헤드라인 2건 + 실시간 트렌딩 목록 (5칸) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* 서브 헤드라인 카드 2개 */}
          <div className="space-y-3">
            {subArticles.slice(0, 2).map((art) => {
              const theme = getCategoryTheme(art.category_code);
              return (
                <div
                  key={art.id}
                  onClick={() => onSelectNews(art)}
                  className="group bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-blue-400 hover:shadow-md transition cursor-pointer flex gap-4"
                >
                  {art.image_url && (
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={art.image_url}
                        alt={art.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.badge}`}>
                          {art.category}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {art.source}
                        </span>
                      </div>
                      <h4 className="text-[15px] font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-[1.4] break-keep">
                        {art.title}
                      </h4>
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatTimeAgo(art.published_at)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 실시간 핫 랭킹 5 (Quick Trending List) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex-1">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>실시간 주요 브리핑 TOP 5</span>
              </div>
              <span className="text-[11px] text-blue-600 font-semibold">속보 순</span>
            </div>

            <div className="space-y-2.5">
              {trendingArticles.slice(0, 5).map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => onSelectNews(item)}
                  className="group flex items-start gap-3 p-1.5 rounded-xl hover:bg-slate-50 cursor-pointer transition"
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-extrabold shrink-0 mt-0.5 ${
                      idx === 0
                        ? 'bg-blue-600 text-white'
                        : idx === 1
                        ? 'bg-blue-500 text-white'
                        : idx === 2
                        ? 'bg-blue-400 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-slate-800 group-hover:text-blue-600 truncate leading-snug break-keep">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">{item.source}</span>
                      <span>·</span>
                      <span>{item.category}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
