import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import MagazineHero from '../components/MagazineHero';
import NewsCard from '../components/NewsCard';
import { fetchNews, fetchSources } from '../api/newsApi';
import { ArrowRight, RefreshCw, Layers, Sparkles } from 'lucide-react';

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
    let mounted = true;
    async function loadHomeData() {
      setLoading(true);
      try {
        const [newsRes, sourcesRes] = await Promise.all([
          fetchNews({ page: 1, limit: 30 }),
          fetchSources(),
        ]);
        if (mounted) {
          setRecentArticles(newsRes.data || []);
          setSourcesList(sourcesRes || []);
        }
      } catch (err) {
        console.error('홈 데이터 로드 에러:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadHomeData();
    return () => {
      mounted = false;
    };
  }, []);

  // 사진이 있는 기사를 우선 선별하여 1면 헤드라인, 이슈 브리핑, 최신 그리드로 분배 (메모이제이션)
  const { heroArticles, trendingList, latestGrid } = useMemo(() => {
    const hero = [
      ...recentArticles.filter((a) => a.image_url),
      ...recentArticles.filter((a) => !a.image_url),
    ].slice(0, 7);

    const hIds = new Set(hero.map((a) => a.id));

    const trending = recentArticles
      .filter((a) => !hIds.has(a.id))
      .slice(0, 5);

    const usedIds = new Set([...hIds, ...trending.map((a) => a.id)]);

    const grid = recentArticles
      .filter((a) => !usedIds.has(a.id))
      .slice(0, 9);

    return { heroArticles: hero, trendingList: trending, latestGrid: grid };
  }, [recentArticles]);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* 메인 컨테이너 */}
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
            {/* 3. 오늘의 1면 헤드라인 & 이슈 브리핑 (TVING 스타일 파노라마 뷰) */}
            <MagazineHero
              headlineArticles={heroArticles}
              trendingArticles={trendingList}
              onSelectNews={onSelectNews}
              onToggleBookmark={onToggleBookmark}
              bookmarkedIds={bookmarkedIds}
            />

            {/* 4. 실시간 최신 기사 그리드 (전체 너비 3열) */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full inline-block"></span>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    방금 올라온 최신 기사
                  </h3>
                </div>
                <Link
                  to="/feed"
                  className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-800 transition"
                >
                  <span>전체 피드 (/feed) 가기</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                {latestGrid.map((news) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    onClick={onSelectNews}
                  />
                ))}
              </div>

              {/* 대형 전체 기사 피드 & 키워드 트렌드 바로가기 배너 */}
              <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-700 text-white rounded-3xl p-7 sm:p-9 shadow-lg flex flex-col lg:flex-row items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md mb-2">
                    <Layers className="w-3.5 h-3.5" />
                    <span>카테고리 & 빅데이터 AI 분석</span>
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-2">
                    원하는 기사와 핵심 키워드를 정밀 탐색하세요
                  </h4>
                  <p className="text-xs sm:text-sm text-blue-100 max-w-xl">
                    정치·경제·문화·사회·국제·지역·스포츠·IT과학 8대 분야 기사 피드와 빅카인즈 AI 오늘의 키워드 워드클라우드를 제공합니다.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to="/feed"
                    className="px-5 py-3 bg-white text-blue-700 hover:bg-blue-50 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-1.5"
                  >
                    <span>전체 피드 이동</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/trend"
                    className="px-5 py-3 bg-white/15 hover:bg-white/25 text-white border border-white/30 font-extrabold text-xs sm:text-sm rounded-2xl shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-1.5 backdrop-blur-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>오늘의 키워드</span>
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
