import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FeedPage from './pages/FeedPage';
import NewsModal from './components/NewsModal';
import CrawlStatusModal from './components/CrawlStatusModal';
import BookmarksModal from './components/BookmarksModal';
import { fetchCrawlStatus, triggerManualCrawl } from './api/newsApi';
import { getBookmarks, toggleBookmark } from './utils/bookmarkStorage';
import { Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function App() {
  const [selectedNews, setSelectedNews] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showBookmarksModal, setShowBookmarksModal] = useState(false);

  // 크롤러 상태
  const [crawlStatus, setCrawlStatus] = useState(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [toast, setToast] = useState(null);

  // 북마크(스크랩) 상태
  const [bookmarks, setBookmarks] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // 북마크 목록 로드
  const reloadBookmarks = useCallback(() => {
    const list = getBookmarks();
    setBookmarks(list);
    setBookmarkedIds(new Set(list.map((item) => item.id)));
  }, []);

  // 크롤러 상태 로드
  const loadCrawlStatus = useCallback(async () => {
    try {
      const data = await fetchCrawlStatus();
      setCrawlStatus(data);
      setIsCrawling(data.is_running);
    } catch (err) {
      console.error('크롤러 상태 로드 실패:', err);
    }
  }, []);

  useEffect(() => {
    loadCrawlStatus();
    reloadBookmarks();
  }, [loadCrawlStatus, reloadBookmarks]);

  // 북마크 토글 핸들러
  const handleToggleBookmark = (news) => {
    const added = toggleBookmark(news);
    reloadBookmarks();
    if (added) {
      showToast('기사를 내 스크랩에 저장했습니다.', 'success');
    } else {
      showToast('기사 스크랩을 취소했습니다.', 'info');
    }
  };

  // 수동 크롤링 실행 핸들러
  const handleTriggerCrawl = async () => {
    if (isCrawling) return;
    setIsCrawling(true);
    showToast('뉴스 크롤링 작업을 시작했습니다. 잠시만 기다려주세요...', 'info');

    try {
      await triggerManualCrawl();

      // 크롤링 완료 폴링 (2초 간격)
      const checkInterval = setInterval(async () => {
        try {
          const status = await fetchCrawlStatus();
          setCrawlStatus(status);
          if (!status.is_running) {
            clearInterval(checkInterval);
            setIsCrawling(false);
            showToast('뉴스 크롤링 및 DB 저장이 완료되었습니다! 페이지를 새로고침합니다.', 'success');
            setTimeout(() => {
              window.location.reload();
            }, 1000);
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

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
        {/* 토스트 알림 */}
        {toast && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-slate-900 text-white text-xs font-semibold rounded-2xl shadow-2xl animate-in slide-in-from-bottom-5">
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

        {/* 상단 네비게이션 헤더 (홈 '/' vs 전체피드 '/feed' 탭) */}
        <Navbar
          crawlStatus={crawlStatus}
          onTriggerCrawl={handleTriggerCrawl}
          isCrawling={isCrawling}
          onOpenStatusModal={() => setShowStatusModal(true)}
          onOpenBookmarks={() => setShowBookmarksModal(true)}
          bookmarkCount={bookmarks.length}
        />

        {/* 메인 라우트 분기 */}
        <div className="flex-1">
          <Routes>
            {/* 새 추천 메인페이지: / */}
            <Route
              path="/"
              element={
                <Home
                  onSelectNews={(n) => setSelectedNews(n)}
                  onToggleBookmark={handleToggleBookmark}
                  bookmarkedIds={bookmarkedIds}
                  crawlStatus={crawlStatus}
                />
              }
            />

            {/* 전체 기사 피드 및 카테고리 필터 페이지: /feed */}
            <Route
              path="/feed"
              element={
                <FeedPage
                  onSelectNews={(n) => setSelectedNews(n)}
                  onTriggerCrawl={handleTriggerCrawl}
                  isCrawling={isCrawling}
                  crawlStatus={crawlStatus}
                />
              }
            />

            {/* 기존 /frontend 접속 시 /feed 로 자동 리다이렉트 */}
            <Route path="/frontend" element={<Navigate to="/feed" replace />} />

            {/* 기타 경로는 홈으로 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* 푸터 */}
        <footer className="bg-white border-t border-slate-200 py-10 text-xs text-slate-400 text-center mt-12">
          <div className="max-w-7xl mx-auto px-4 space-y-3">
            <div className="flex items-center justify-center gap-4 text-slate-600 font-semibold text-xs">
              <a href="/" className="hover:text-blue-600">추천 홈 (Magazine)</a>
              <span>·</span>
              <a href="/feed" className="hover:text-blue-600">전체 기사 피드 (/feed)</a>
              <span>·</span>
              <button onClick={() => setShowBookmarksModal(true)} className="hover:text-blue-600">
                내 스크랩 ({bookmarks.length})
              </button>
              <span>·</span>
              <button onClick={() => setShowStatusModal(true)} className="hover:text-blue-600">스케줄러 상태</button>
            </div>
            <p className="font-semibold text-slate-500">
              FastNews — 빅카인즈(BigKinds) 54개 언론사 & 카테고리별 RSS 실시간 크롤링 플랫폼
            </p>
            <p>
              정치 · 경제 · 문화 · 사회 · 국제 · 지역 · 스포츠 · IT과학 (APScheduler 15분 주기 자동 크롤링)
            </p>
            <p className="text-[11px] text-slate-400">
              본 사이트에서 제공하는 뉴스는 한국언론진흥재단 빅카인즈 및 주요 언론사 RSS 피드를 통해 수집된 것으로 저작권은 각 언론사에 있습니다.
            </p>
          </div>
        </footer>

        {/* 기사 상세 모달 */}
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

        {/* 내 스크랩 서재 모달 */}
        {showBookmarksModal && (
          <BookmarksModal
            bookmarks={bookmarks}
            onClose={() => setShowBookmarksModal(false)}
            onSelectNews={(n) => setSelectedNews(n)}
            onRemoveBookmark={handleToggleBookmark}
          />
        )}
      </div>
    </BrowserRouter>
  );
}
