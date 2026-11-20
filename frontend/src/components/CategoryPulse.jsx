import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Newspaper, ChevronRight } from 'lucide-react';
import { formatTimeAgo, getCategoryTheme } from '../utils/formatters';

const FEATURED_SECTIONS = [
  { code: 'economy', label: '경제·금융 레이더', desc: '주식, 금리, 부동산, 거시경제 분석' },
  { code: 'it_science', label: 'IT·AI 과학 테크', desc: '인공지능, 빅데이터, 모바일, 반도체' },
  { code: 'politics', label: '정치·정책 브리핑', desc: '국회, 입법, 선거, 정부 주요 정책' },
  { code: 'society', label: '사회·이슈 포커스', desc: '사건사고, 환경, 교육, 생활 밀착 이슈' },
];

export default function CategoryPulse({ allArticles = [], onSelectNews }) {
  const [activeTab, setActiveTab] = useState('economy');

  // 카테고리별로 기사 분류
  const getArticlesByCat = (code) => {
    return allArticles.filter((a) => a.category_code === code);
  };

  const currentMeta = FEATURED_SECTIONS.find((s) => s.code === activeTab) || FEATURED_SECTIONS[0];
  const sectionArticles = getArticlesByCat(activeTab);
  const leadArticle = sectionArticles[0];
  const subArticles = sectionArticles.slice(1, 5);
  const theme = getCategoryTheme(activeTab);

  return (
    <section className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
      {/* 섹션 상단 탭 헤더 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-5 bg-indigo-600 rounded-full inline-block"></span>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              분야별 심층 큐레이션 (Category Pulse)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            {currentMeta.desc}
          </p>
        </div>

        {/* 카테고리 선택 탭 버튼들 */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {FEATURED_SECTIONS.map((sec) => {
            const isSelected = activeTab === sec.code;
            return (
              <button
                key={sec.code}
                onClick={() => setActiveTab(sec.code)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec.label.split(' ')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* 기사 큐레이션 레이아웃 (좌측 대표 기사 1개 + 우측 서브 리스트 4개) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* 좌측: 리드 기사 (5칸) */}
        {leadArticle ? (
          <div
            onClick={() => onSelectNews(leadArticle)}
            className="lg:col-span-5 group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100 mb-4">
                {leadArticle.image_url ? (
                  <img
                    src={leadArticle.image_url}
                    alt={leadArticle.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white`}>
                    <Newspaper className="w-12 h-12 opacity-60" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border bg-white/90 ${theme.badge}`}>
                    {leadArticle.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700">{leadArticle.source}</span>
                <span>·</span>
                <span>{formatTimeAgo(leadArticle.published_at)}</span>
              </div>

              <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug mb-2 line-clamp-2">
                {leadArticle.title}
              </h3>
              <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                {leadArticle.summary}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-blue-600 font-semibold">
              <span>상세 보기</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        ) : (
          <div className="lg:col-span-5 p-12 text-center text-slate-400 bg-slate-50 rounded-2xl">
            해당 카테고리 기사를 불러오는 중입니다...
          </div>
        )}

        {/* 우측: 서브 기사 리스트 4건 (7칸) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div className="divide-y divide-slate-100">
            {subArticles.map((art, idx) => (
              <div
                key={art.id}
                onClick={() => onSelectNews(art)}
                className="group py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4 cursor-pointer"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-600">{art.source}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(art.published_at)}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                </div>
                {art.image_url && (
                  <div className="w-18 h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={art.image_url}
                      alt={art.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 하단 전체 기사 피드로 이동 링크 */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {currentMeta.label} 관련 기사 총 {sectionArticles.length}건 수집됨
            </span>
            <Link
              to="/feed"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
            >
              <span>전체 기사 피드에서 탐색하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
