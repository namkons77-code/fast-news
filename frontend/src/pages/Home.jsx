import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import BreakingTicker from '../components/BreakingTicker';
import MagazineHero from '../components/MagazineHero';
import CategoryPulse from '../components/CategoryPulse';
import TrendingSidebar from '../components/TrendingSidebar';
import NewsCard from '../components/NewsCard';
import { fetchNews, fetchSources } from '../api/newsApi';
import { ArrowRight, Sparkles, RefreshCw, Layers } from 'lucide-react';

export default function Home({
  onSelectNews,
  onToggleBookmark,
  bookmarkedIds = new Set(),
  crawlStatus
}) {
  const [recentArticles, setRecentArticles] = useState([]);
  const [sourcesList, setSourcesList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHomeData() {
      setLoading(true);
      try {
        // 최신 뉴스 30건 로드 (헤드라인, 서브, 분야별 큐레이션, 실시간 속보 등에 분배)
        const [newsRes, sourcesRes] = await Promise.all([
          fetchNews({ page: 1, limit: 30 }),
          fetchSources(),
        ]);
        setRecentArticles(newsRes.data || []);
        setSourcesList(sourcesRes || []);
      } catch (err) {
        console.error('홈 데이터 로드 에러:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  // 사진이 있는 기사 중 가장 최근 기사를 메인 톱 헤드라인으로 선정
  const topCover =
    recentArticles.find((a) => a.image_url) || recentArticles[0];

  // 서브 헤드라인 2건 (메인과 중복되지 않도록)
  const subHeadlines = recentArticles
    .filter((a) => a.id !== topCover?.id)
    .slice(0, 2);

  // 실시간 트렌딩 목록 5건
  const trendingList = recentArticles.slice(3, 8);

  // 실시간 종합 최신 기사 6선 (하단 그리드용)
  const latestGrid = recentArticles.slice(8, 14);

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. 실시간 속보 롤링 바 */}
      <BreakingTicker
        articles={recentArticles.slice(0, 10)}
        onSelectNews={onSelectNews}
      />

      {/* 2. 메인 컨테이너 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3">
            <RefreshCw className="w-9 h-9 animate-spin text-blue-600" />
            <p className="text-sm font-semibold">
              오늘의 뉴스를 큐레이션하고 있습니다...
            </p>
          </div>
        ) : (
          <>
            {/* 3. 1면 톱 헤드라인 & 매거진 히어로 섹션 */}
            <MagazineHero
              topArticle={topCover}
              subArticles={subHeadlines}
              trendingArticles={trendingList}
              onSelectNews={onSelectNews}
              onToggleBookmark={onToggleBookmark}
              bookmarkedIds={bookmarkedIds}
            />

            {/* 4. 분야별 심층 큐레이션 (경제, IT과학, 정치, 사회) */}
            <CategoryPulse
              allArticles={recentArticles}
              onSelectNews={onSelectNews}
            />

            {/* 5. 2단 레이아웃: 좌측 실시간 최신 6선 카드 + 우측 트렌딩 사이드바 */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* 좌측 (8칸): 최신 기사 카드 그리드 */}
              <div className="lg:col-span-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-5 bg-blue-600 rounded-full inline-block"></span>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      방금 올라온 최신 기사
                    </h3>
                  </div>
                  <Link
                    to="/feed"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition"
                  >
                    <span>전체 피드 (/feed) 가기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                  {latestGrid.map((news) => (
                    <NewsCard
                      key={news.id}
                      news={news}
                      onClick={onSelectNews}
                    />
                  ))}
                </div>

                {/* 대형 전체 기사 피드 바로가기 배너 */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white rounded-3xl p-7 sm:p-9 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2">
                      <Layers className="w-3.5 h-3.5" />
                      <span>카테고리 & 언론사 상세 필터</span>
                    </div>
                    <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                      원하는 기사를 카테고리별로 정밀 탐색하세요
                    </h4>
                    <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                      정치·경제·문화·사회·국제·지역·스포츠·IT과학 8대 분야와 139개 언론사 필터, 페이지네이션을 /feed 페이지에서 제공합니다.
                    </p>
                  </div>
                  <Link
                    to="/feed"
                    className="shrink-0 px-6 py-3.5 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-sm rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
                  >
                    <span>전체 피드 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* 우측 (4칸): 트렌딩 사이드바 */}
              <div className="lg:col-span-4">
                <TrendingSidebar
                  sourcesList={sourcesList}
                  crawlStatus={crawlStatus}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
