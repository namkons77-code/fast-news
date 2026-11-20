import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Newspaper, Flame, LayoutGrid, Sparkles } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 좌측 브랜드 로고 */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
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

          {/* 우측 강조된 네비게이션 탭 (매거진 홈 / 전체 피드 / 오늘의 키워드) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-md shadow-slate-300/40 border border-slate-200/60 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Flame
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-amber-500 fill-amber-500/20' : 'text-slate-400'
                    }`}
                  />
                  <span>매거진 홈</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/feed"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-md shadow-slate-300/40 border border-slate-200/60 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutGrid
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-blue-600 fill-blue-600/15' : 'text-slate-400'
                    }`}
                  />
                  <span>전체 피드</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/trend"
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-extrabold transition-all duration-150 ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-md shadow-slate-300/40 border border-slate-200/60 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Sparkles
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-600 fill-indigo-600/20' : 'text-indigo-400'
                    }`}
                  />
                  <span>오늘의 키워드</span>
                </>
              )}
            </NavLink>
          </nav>
        </div>

        {/* 모바일용 서브 탭 (강조된 바텀 네비게이션) */}
        <div className="flex md:hidden items-center justify-around py-2.5 px-2 border-t border-slate-200/80 text-xs bg-slate-50/90 backdrop-blur-xs">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center gap-1.5 font-extrabold py-1.5 px-3.5 rounded-xl transition ${
                isActive ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Flame className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500 fill-amber-500/20' : ''}`} />
                <span>매거진 홈</span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/feed"
            className={({ isActive }) =>
              `flex items-center gap-1.5 font-extrabold py-1.5 px-3.5 rounded-xl transition ${
                isActive ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <LayoutGrid className={`w-3.5 h-3.5 ${isActive ? 'text-blue-600 fill-blue-600/15' : ''}`} />
                <span>전체 피드</span>
              </>
            )}
          </NavLink>
          <NavLink
            to="/trend"
            className={({ isActive }) =>
              `flex items-center gap-1.5 font-extrabold py-1.5 px-3.5 rounded-xl transition ${
                isActive ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60' : 'text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Sparkles className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 fill-indigo-600/20' : ''}`} />
                <span>오늘의 키워드</span>
              </>
            )}
          </NavLink>
        </div>
      </div>
    </header>
  );
}
