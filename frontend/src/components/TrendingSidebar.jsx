import React from 'react';
import { Building2, Server, ArrowRight, Compass } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { code: 'politics', name: '정치' },
  { code: 'economy', name: '경제' },
  { code: 'society', name: '사회' },
  { code: 'culture', name: '문화' },
  { code: 'international', name: '국제' },
  { code: 'regional', name: '지역' },
  { code: 'sports', name: '스포츠' },
  { code: 'it_science', name: 'IT과학' },
];

export default function TrendingSidebar({
  sourcesList = [],
  crawlStatus
}) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* 1. 카테고리 빠른 탐색 */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <Compass className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">카테고리 빠른 탐색</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          원하는 분야를 선택해 전체 기사를 확인하세요.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.code}
              onClick={() => navigate(`/feed?category=${cat.code}`)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 hover:border-blue-300 transition text-left flex items-center justify-between"
            >
              <span>{cat.name}</span>
              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
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
          {sourcesList.slice(0, 8).map((item) => (
            <div
              key={item.source}
              onClick={() => navigate(`/feed?source=${encodeURIComponent(item.source)}`)}
              className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg hover:bg-slate-50 cursor-pointer transition"
            >
              <span className="font-medium text-slate-700 hover:text-blue-600">{item.source}</span>
              <span className="font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {item.count}건
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <Link
            to="/feed"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>전체 139개 언론사 필터 보기</span>
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
          APScheduler가 15분마다 빅카인즈 54개 언론사 및 RSS 피드를 실시간으로 교차 수집하여 Supabase DB에 적재합니다.
        </p>

        <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
          <div className="flex justify-between">
            <span className="text-slate-400">스케줄러 주기:</span>
            <strong className="text-blue-400">15분 자동 크롤링</strong>
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
