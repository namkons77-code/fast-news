import React from 'react';
import { Newspaper, RefreshCw, Clock, Database, Info, Activity } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

export default function Header({
  crawlStatus,
  onTriggerCrawl,
  isCrawling,
  onOpenStatusModal
}) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 영역 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  FastNews <span className="text-blue-600 text-sm font-semibold">Live</span>
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 mr-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  실시간 RSS
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                카테고리별 RSS 수집 · 15분 주기 APScheduler · Supabase DB
              </p>
            </div>
          </div>

          {/* 우측 도구 및 상태 버튼 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* DB 모드 배지 */}
            <div
              onClick={onOpenStatusModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer text-xs font-medium transition"
              title="클릭하여 상세 스케줄러 및 DB 상태 보기"
            >
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>{crawlStatus?.db_mode?.includes('supabase') ? 'Supabase' : 'SQLite DB'}</span>
              <span className="text-slate-400">|</span>
              <span>총 {crawlStatus?.total_news_count?.toLocaleString() || 0}건</span>
            </div>

            {/* 스케줄러 정보 배지 */}
            <button
              onClick={onOpenStatusModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-medium transition"
              title="스케줄러 정보 보기"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">15분 주기</span>
              {crawlStatus?.last_run_at && (
                <span className="text-blue-500 hidden lg:inline">
                  ({formatTimeAgo(crawlStatus.last_run_at)})
                </span>
              )}
              <Info className="w-3.5 h-3.5 text-blue-400 ml-0.5" />
            </button>

            {/* 수동 크롤링 버튼 */}
            <button
              onClick={onTriggerCrawl}
              disabled={isCrawling}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium text-xs text-white transition shadow-sm ${
                isCrawling
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-blue-500/20'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
              <span>{isCrawling ? '수집 중...' : '지금 크롤링'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
