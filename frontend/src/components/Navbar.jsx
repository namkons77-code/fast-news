import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Newspaper, Flame, LayoutGrid } from 'lucide-react';

export default function Navbar() {
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

          {/* 우측 툴바 제거됨 (사용자 요청) */}
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
