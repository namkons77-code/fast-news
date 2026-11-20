import React, { useState, useEffect } from 'react';
import { Search, X, SlidersHorizontal, RotateCcw } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  onSearch,
  sourceFilter,
  onSourceChange,
  activeCategoryName,
  totalResults,
  onReset,
  sourcesList = []
}) {
  const [localInput, setLocalInput] = useState(searchQuery || '');

  useEffect(() => {
    setLocalInput(searchQuery || '');
  }, [searchQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(localInput.trim());
  };

  const handleClear = () => {
    setLocalInput('');
    onSearch('');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs mb-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* 검색 인풋 폼 */}
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              value={localInput}
              onChange={(e) => setLocalInput(e.target.value)}
              placeholder="뉴스 제목이나 키워드를 검색하세요 (예: APEC, 금리, 인공지능...)"
              className="w-full pl-10 pr-20 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition"
            />
            <div className="absolute right-2 flex items-center gap-1">
              {localInput && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
                  title="검색어 지우기"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition"
              >
                검색
              </button>
            </div>
          </div>
        </form>

        {/* 필터 옵션 */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <select
              value={sourceFilter}
              onChange={(e) => onSourceChange(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 max-w-[180px]"
            >
              <option value="">전체 출처 ({sourcesList.length}개)</option>
              {sourcesList.map((item) => (
                <option key={item.source} value={item.source}>
                  {item.source} ({item.count})
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || sourceFilter) && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 px-3 py-2.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition"
              title="검색 및 필터 초기화"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>초기화</span>
            </button>
          )}
        </div>
      </div>

      {/* 검색 결과 상태 바 */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span>현재 카테고리:</span>
          <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
            {activeCategoryName}
          </span>
          {searchQuery && (
            <>
              <span>·</span>
              <span>검색어:</span>
              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                "{searchQuery}"
              </span>
            </>
          )}
        </div>
        <div>
          총 <strong className="text-slate-800">{totalResults.toLocaleString()}</strong>개의 기사
        </div>
      </div>
    </div>
  );
}
