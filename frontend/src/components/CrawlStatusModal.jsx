import React from 'react';
import { X, Clock, Database, CheckCircle, RefreshCw, AlertCircle, Server } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

export default function CrawlStatusModal({
  status,
  onClose,
  onTriggerCrawl,
  isCrawling
}) {
  if (!status) return null;

  const isSupabase = status.db_mode?.includes('supabase');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div className="shrink-0 p-6 sm:p-7 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                백엔드 시스템 & 스케줄러 정보
              </h3>
              <p className="text-xs text-slate-500">
                APScheduler 및 Supabase DB 연동 상태
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

        {/* 정보 카드 그리드 */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-7 space-y-4">
          {/* 1. 스케줄러 상태 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">
                  APScheduler 15분 자동 크롤러
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                <span className="w-1.5 h-1.5 mr-1 bg-emerald-500 rounded-full animate-pulse"></span>
                정상 가동 중
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200/60">
              <div>
                <span className="text-slate-400">실행 주기:</span>{' '}
                <strong className="text-slate-800">
                  {status.interval_minutes ? `${status.interval_minutes}분 간격` : '15분 간격'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">현재 상태:</span>{' '}
                <strong className={status.is_running ? 'text-amber-600' : 'text-emerald-600'}>
                  {status.is_running ? '크롤링 진행 중' : '대기 중 (Idle)'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">마지막 실행:</span>{' '}
                <strong className="text-slate-800">
                  {status.last_run_at ? formatTimeAgo(status.last_run_at) : '없음'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400">다음 예정:</span>{' '}
                <strong className="text-blue-600">
                  {status.next_run_at ? new Date(status.next_run_at).toLocaleTimeString('ko-KR') : '계산 중'}
                </strong>
              </div>
            </div>
          </div>

          {/* 2. 데이터베이스 연동 상태 */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">
                  데이터베이스 연동 현황
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                  isSupabase
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {status.db_mode}
              </span>
            </div>
            <div className="text-xs text-slate-600 space-y-1.5 mt-2">
              <div className="flex justify-between">
                <span className="text-slate-400">총 저장된 기사 수:</span>
                <strong className="text-slate-800 font-bold">
                  {status.total_news_count?.toLocaleString()} 건
                </strong>
              </div>
              {!isSupabase && (
                <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                  💡 <strong>Supabase 연동 안내:</strong> 현재 로컬 SQLite 모드로 동작 중입니다. Supabase를 사용하시려면 <code className="bg-white/80 px-1 rounded">backend/.env</code> 파일에 <code className="bg-white/80 px-1 rounded">SUPABASE_URL</code>과 <code className="bg-white/80 px-1 rounded">SUPABASE_KEY</code>를 입력하고, Supabase SQL Editor에서 <code className="bg-white/80 px-1 rounded">backend/supabase_schema.sql</code>을 실행하시면 즉시 Supabase로 데이터가 저장됩니다.
                </div>
              )}
            </div>
          </div>

          {/* 3. 최근 크롤링 통계 */}
          {status.last_crawl_result && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                최근 크롤링 결과 통계
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">수집된 기사</div>
                  <div className="text-sm font-bold text-slate-800">
                    {status.last_crawl_result.total_fetched || 0}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">신규 저장</div>
                  <div className="text-sm font-bold text-blue-600">
                    {status.last_crawl_result.total_inserted || 0}
                  </div>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200/60">
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">소요 시간</div>
                  <div className="text-sm font-bold text-emerald-600">
                    {status.last_crawl_result.duration_seconds || 0}s
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 수동 크롤링 실행 버튼 */}
        <div className="shrink-0 p-6 sm:p-7 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            주기적인 15분 자동 수집 외에도 언제든 즉시 수집할 수 있습니다.
          </span>
          <button
            onClick={() => {
              onTriggerCrawl();
              onClose();
            }}
            disabled={isCrawling}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCrawling ? 'animate-spin' : ''}`} />
            <span>{isCrawling ? '수집 진행 중' : '수동 크롤링 실행'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
