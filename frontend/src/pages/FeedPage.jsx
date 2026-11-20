import React, { useState, useEffect, useCallback } from 'react';
import CategoryNav from '../components/CategoryNav';
import SearchBar from '../components/SearchBar';
import NewsCard from '../components/NewsCard';
import Pagination from '../components/Pagination';
import { fetchNews, fetchCategories, fetchSources } from '../api/newsApi';
import { Newspaper, AlertTriangle, RefreshCw, LayoutGrid, Database } from 'lucide-react';

export default function FeedPage({
  onSelectNews,
  onTriggerCrawl,
  isCrawling,
  crawlStatus
}) {
  const [newsList, setNewsList] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sourcesList, setSourcesList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 카테고리 목록 로드
  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories();
      setCategories(data);
    } catch (err) {
      console.error('카테고리 로드 실패:', err);
    }
  }, []);

  // 전체 언론사 목록 로드
  const loadSources = useCallback(async () => {
    try {
      const data = await fetchSources();
      setSourcesList(data || []);
    } catch (err) {
      console.error('언론사 목록 로드 실패:', err);
    }
  }, []);

  // 뉴스 목록 로드
  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNews({
        category: selectedCategory,
        search: searchQuery,
        source: sourceFilter,
        page: currentPage,
        limit: 12,
      });
      setNewsList(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.message || '뉴스를 불러오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sourceFilter, currentPage]);

  useEffect(() => {
    loadCategories();
    loadSources();
  }, [loadCategories, loadSources]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const handleSelectCategory = (catCode) => {
    setSelectedCategory(catCode);
    setCurrentPage(1);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleSourceChange = (src) => {
    setSourceFilter(src);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSourceFilter('');
    setCurrentPage(1);
  };

  const activeCategoryMeta = categories.find((c) => c.code === selectedCategory);
  const activeCategoryName =
    selectedCategory === 'all'
      ? '전체'
      : activeCategoryMeta
      ? activeCategoryMeta.name
      : selectedCategory;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* 1. 상단 통일 헤더 섹션 */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 shadow-xs">
                  <LayoutGrid className="w-3.5 h-3.5" />
                  실시간 전체 뉴스 피드
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  15분 자동 수집
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                전체 뉴스 <span className="text-blue-600">피드 탐색</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
                정치·경제·사회·문화·국제·지역·스포츠·IT과학 8대 분야와 180여 개 언론사의 실시간 뉴스를 키워드 검색, 언론사 필터, 페이지네이션으로 정밀하게 탐색하세요.
              </p>
            </div>

            {/* 우측 총 기사 수 배지 */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600 flex items-center gap-2 shadow-xs">
                <Database className="w-4 h-4 text-blue-600" />
                <span>총 기사 수:</span>
                <strong className="text-slate-900 font-extrabold text-sm">
                  {crawlStatus?.total_news_count?.toLocaleString() || 0}
                </strong>
                <span>건</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 카테고리 탭 네비게이션 */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        totalCount={crawlStatus?.total_news_count || 0}
      />

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SearchBar
          searchQuery={searchQuery}
          onSearch={handleSearch}
          sourceFilter={sourceFilter}
          onSourceChange={handleSourceChange}
          activeCategoryName={activeCategoryName}
          totalResults={pagination?.total || 0}
          onReset={handleResetFilters}
          sourcesList={sourcesList}
        />

        {/* 로딩 인디케이터 */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">최신 뉴스를 불러오고 있습니다...</p>
          </div>
        )}

        {/* 에러 화면 */}
        {!loading && error && (
          <div className="my-12 p-8 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-3xl text-center">
            <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-800 mb-1">오류가 발생했습니다</h3>
            <p className="text-xs text-red-600 mb-4">{error}</p>
            <button
              onClick={loadNews}
              className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 결과 없음 */}
        {!loading && !error && newsList.length === 0 && (
          <div className="my-20 text-center max-w-md mx-auto p-8 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <Newspaper className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              조회된 뉴스가 없습니다
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              {searchQuery
                ? `"${searchQuery}"에 해당하는 기사를 찾을 수 없습니다.`
                : '아직 수집된 뉴스가 없거나 필터 조건에 맞는 기사가 없습니다.'}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
              >
                필터 초기화
              </button>
              <button
                onClick={onTriggerCrawl}
                disabled={isCrawling}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
              >
                지금 크롤링 실행
              </button>
            </div>
          </div>
        )}

        {/* 뉴스 카드 그리드 */}
        {!loading && !error && newsList.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsList.map((news) => (
                <NewsCard
                  key={news.id || news.link}
                  news={news}
                  onClick={onSelectNews}
                />
              ))}
            </div>

            <Pagination
              pagination={pagination}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </>
        )}
      </main>
    </div>
  );
}
