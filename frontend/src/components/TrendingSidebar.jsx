import React from 'react';
import { Tag, Building2, Server, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const POPULAR_KEYWORDS = [
  '인공지능',
  '금리',
  '반도체',
  '대통령',
  '국회',
  '부동산',
  '수능',
  '미국',
  '우주',
  '축구',
];

export default function TrendingSidebar({
  sourcesList = [],
  crawlStatus,
  onKeywordClick
}) {
  const navigate = useNavigate();

  const handleTagClick = (kw) => {
    if (onKeywordClick) {
      onKeywordClick(kw);
    } else {
      navigate(`/frontend?search=${encodeURIComponent(kw)}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. 오늘의 핫 키워드 태그 클라우드 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Tag className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">오늘의 핫 토픽 키워드</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          관심 있는 키워드를 누르면 관련 기사로 바로 이동합니다.
        </p>

        <div className="flex flex-wrap gap-2">
          {POPULAR_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => handleTagClick(kw)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-300 transition"
            >
              #{kw}
            </button>
          ))}
        </div>
      </div>

      {/* 2. 빅카인즈 및 주요 언론사 현황 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">주요 수집 언론사</h3>
          </div>
          <span className="text-[11px] text-slate-400">총 {sourcesList.length}개사</span>
        </div>

        <div className="space-y-2 mt-4">
          {sourcesList.slice(0, 6).map((item) => (
            <div
              key={item.source}
              className="flex items-center justify-between text-xs py-1 px-2 rounded-lg hover:bg-slate-50"
            >
              <span className="font-medium text-slate-700">{item.source}</span>
              <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {item.count}건
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <Link
            to="/frontend"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>전체 언론사 필터 보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 3. 시스템 엔진 정보 카드 */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <Server className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-bold">FastNews 엔진 상태</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          APScheduler가 1시간마다 빅카인즈 54개 언론사 및 RSS 피드를 실시간으로 교차 수집하여 Supabase DB에 적재합니다.
        </p>

        <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">스케줄러 주기:</span>
            <strong className="text-blue-400">1시간 자동 크롤링</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">데이터베이스:</span>
            <strong className="text-emerald-400">
              {crawlStatus?.db_mode?.includes('supabase') ? 'Supabase (PostgreSQL)' : 'SQLite Local'}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">누적 저장 기사:</span>
            <strong className="text-white">
              {crawlStatus?.total_news_count?.toLocaleString()} 건
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
