import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import SearchBar from './components/SearchBar';
import NewsCard from './components/NewsCard';
import NewsModal from './components/NewsModal';
import Pagination from './components/Pagination';
import CrawlStatusModal from './components/CrawlStatusModal';
import {
  fetchNews,
  fetchCategories,
  fetchCrawlStatus,
  triggerManualCrawl,
  fetchSources,
} from './api/newsApi';
import { Newspaper, AlertTriangle, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
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

  // 모달 상태
  const [selectedNews, setSelectedNews] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  // 크롤러 상태
  const [crawlStatus, setCrawlStatus] = useState(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 1. 카테고리 목록 로드
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

  // 2. 크롤러 상태 로드
  const loadCrawlStatus = useCallback(async () => {
    try {
      const data = await fetchCrawlStatus();
      setCrawlStatus(data);
      setIsCrawling(data.is_running);
    } catch (err) {
      console.error('크롤러 상태 로드 실패:', err);
    }
  }, []);

  // 3. 뉴스 목록 로드
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

  // 첫 마운트 시 실행
  useEffect(() => {
    loadCategories();
    loadSources();
    loadCrawlStatus();
  }, [loadCategories, loadSources, loadCrawlStatus]);

  // 필터 변경 시 뉴스 목록 다시 로드
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  // 카테고리 선택 핸들러
  const handleSelectCategory = (catCode) => {
    setSelectedCategory(catCode);
    setCurrentPage(1);
  };

  // 검색 핸들러
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // 출처 필터 변경 핸들러
  const handleSourceChange = (src) => {
    setSourceFilter(src);
    setCurrentPage(1);
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSourceFilter('');
    setCurrentPage(1);
  };

  // 수동 크롤링 실행
  const handleTriggerCrawl = async () => {
    if (isCrawling) return;
    setIsCrawling(true);
    showToast('뉴스 크롤링 작업을 시작했습니다. 잠시만 기다려주세요...', 'info');

    try {
      await triggerManualCrawl();

      // 크롤링 상태 폴링 (완료될 때까지 2초 간격 확인)
      const checkInterval = setInterval(async () => {
        try {
          const status = await fetchCrawlStatus();
          setCrawlStatus(status);
          if (!status.is_running) {
            clearInterval(checkInterval);
            setIsCrawling(false);
            loadNews();
            loadCategories();
            loadSources();
            showToast('뉴스 크롤링 및 DB 저장이 완료되었습니다!', 'success');
          }
        } catch {
          clearInterval(checkInterval);
          setIsCrawling(false);
        }
      }, 2000);
    } catch (err) {
      setIsCrawling(false);
      showToast(err.message || '크롤링 요청에 실패했습니다.', 'error');
    }
  };

  // 현재 활성 카테고리 한글명
  const activeCategoryMeta = categories.find((c) => c.code === selectedCategory);
  const activeCategoryName = selectedCategory === 'all' ? '전체' : (activeCategoryMeta ? activeCategoryMeta.name : selectedCategory);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* 토스트 알림 */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-medium rounded-2xl shadow-xl animate-in slide-in-from-bottom-5">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : toast.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-red-400" />
          ) : (
            <Sparkles className="w-4 h-4 text-blue-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 헤더 */}
      <Header
        crawlStatus={crawlStatus}
        onTriggerCrawl={handleTriggerCrawl}
        isCrawling={isCrawling}
        onOpenStatusModal={() => setShowStatusModal(true)}
      />

      {/* 카테고리 네비게이션 바 */}
      <CategoryNav
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        totalCount={crawlStatus?.total_news_count || 0}
      />

      {/* 메인 본문 콘텐츠 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 검색 및 필터 바 */}
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

        {/* 로딩 상태 */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-medium">최신 뉴스를 불러오고 있습니다...</p>
          </div>
        )}

        {/* 에러 상태 */}
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

        {/* 기사 목록이 비어있는 경우 */}
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
              {(searchQuery || sourceFilter || selectedCategory !== 'all') && (
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
                >
                  필터 초기화
                </button>
              )}
              <button
                onClick={handleTriggerCrawl}
                disabled={isCrawling}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
              >
                지금 크롤링 실행
              </button>
            </div>
          </div>
        )}

        {/* 뉴스 그리드 */}
        {!loading && !error && newsList.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsList.map((news) => (
                <NewsCard
                  key={news.id || news.link}
                  news={news}
                  onClick={(n) => setSelectedNews(n)}
                />
              ))}
            </div>

            {/* 페이지네이션 */}
            <Pagination
              pagination={pagination}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </>
        )}
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-slate-200 py-8 text-xs text-slate-400 text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-medium text-slate-500">
            FastNews — FastAPI & APScheduler & Supabase 뉴스 크롤러 서비스
          </p>
          <p>
            수집 대상: 정치 · 경제 · 문화 · 사회 · 국제 · 지역 · 스포츠 · IT과학 (1시간 주기 자동 크롤링)
          </p>
          <p className="text-[11px] text-slate-400">
            본 사이트에서 제공하는 뉴스는 RSS 피드를 통해 자동 수집된 것으로 저작권은 각 언론사에 있습니다.
          </p>
        </div>
      </footer>

      {/* 뉴스 상세 모달 */}
      {selectedNews && (
        <NewsModal
          news={selectedNews}
          onClose={() => setSelectedNews(null)}
        />
      )}

      {/* 스케줄러 & DB 모니터링 상세 모달 */}
      {showStatusModal && (
        <CrawlStatusModal
          status={crawlStatus}
          onClose={() => setShowStatusModal(false)}
          onTriggerCrawl={handleTriggerCrawl}
          isCrawling={isCrawling}
        />
      )}
    </div>
  );
}
