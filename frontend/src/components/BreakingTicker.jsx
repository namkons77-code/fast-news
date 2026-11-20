import React, { useState, useEffect, memo } from 'react';
import { Zap, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { formatTimeAgo } from '../utils/formatters';

function BreakingTicker({ articles = [], onSelectNews }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!articles || articles.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [articles, isPaused]);

  if (!articles || articles.length === 0) return null;

  const current = articles[currentIndex];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + articles.length) % articles.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % articles.length);
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-3">
        {/* 속보 레이블 배지 */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full font-extrabold text-[11px] bg-red-600 text-white tracking-wide animate-pulse">
            <Zap className="w-3 h-3 fill-white" />
            속보 LIVE
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
        </div>

        {/* 롤링 뉴스 타이틀 */}
        <div
          onClick={() => onSelectNews(current)}
          className="flex-1 overflow-hidden cursor-pointer hover:text-blue-300 transition-colors flex items-center gap-2"
        >
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">
            [{current.source}]
          </span>
          <p className="truncate font-medium text-slate-200 hover:underline">
            {current.title}
          </p>
          <span className="text-[11px] text-slate-400 shrink-0 hidden md:inline">
            · {formatTimeAgo(current.published_at)}
          </span>
        </div>

        {/* 인덱스 표시 및 컨트롤러 */}
        <div className="flex items-center gap-1 shrink-0 text-slate-400">
          <span className="text-[11px] font-medium mr-1 hidden sm:inline">
            {currentIndex + 1} / {articles.length}
          </span>
          <button
            onClick={handlePrev}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title="이전 속보"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused(!isPaused);
            }}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title={isPaused ? "자동 롤링 재생" : "일시정지"}
          >
            {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:text-white rounded hover:bg-slate-800 transition"
            title="다음 속보"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(BreakingTicker);
