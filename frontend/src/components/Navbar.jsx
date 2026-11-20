import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Newspaper,
  Compass,
  Bookmark,
  RefreshCw,
  Clock,
  Database,
  Flame,
  LayoutGrid,
} from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

export default function Navbar({
  crawlStatus,
  onTriggerCrawl,
  isCrawling,
  onOpenStatusModal,
  onOpenBookmarks,
  bookmarkCount = 0,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 좌측 브랜드 로고 */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Newspaper className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    Fast<span className="text-blue-600">News</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                    Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block -mt-0.5">
                  실시간 8대 분야 뉴스 & 큐레이션
                </span>
              </div>
            </Link>

            {/* 네비게이션 탭 (메인 추천 포털 vs 전체 피드) */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                <Flame className="w-3.5 h-3.5" />
                <span>추천 홈 (Magazine)</span>
              </NavLink>
              <NavLink
                to="/feed"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`
                }
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>전체 피드 (/feed)</span>
              </NavLink>
            </nav>
          </div>

          {/* 우측 툴바 */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* 북마크 / 스크랩 버튼 */}
            <button
              onClick={onOpenBookmarks}
              className="relative flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
              title="내가 스크랩한 기사"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
              <span className="hidden sm:inline">내 스크랩</span>
              {bookmarkCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* 스케줄러 상태 배지 */}
            <button
              onClick={onOpenStatusModal}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
              title="1시간 주기 APScheduler 상태 보기"
            >
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              <span>1시간 자동 수집</span>
              {crawlStatus?.last_run_at && (
                <span className="text-blue-500">
                  ({formatTimeAgo(crawlStatus.last_run_at)})
                </span>
              )}
            </button>

            {/* 지금 크롤링 실행 버튼 */}
            <button
              onClick={onTriggerCrawl}
              disabled={isCrawling}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs text-white transition shadow-sm ${
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

        {/* 모바일용 서브 탭 */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1 font-bold py-1 px-3 rounded-lg ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
              }`
            }
          >
            <Flame className="w-3.5 h-3.5" />
            <span>추천 홈</span>
          </NavLink>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `flex items-center gap-1 font-bold py-1 px-3 rounded-lg ${
                isActive ? 'bg-blue-50 text-blue-600' : 'text-slate-600'
              }`
            }
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>전체 기사 (/feed)</span>
          </NavLink>
        </div>
      </div>
    </header>
  );
}
