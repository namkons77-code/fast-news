import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RefreshCw,
  BarChart3,
  Cloud,
  User,
  MapPin,
  Building2,
  Layers,
  Database,
  Landmark,
  TrendingUp,
  Users,
  Palette,
  Globe,
  Trophy,
  Cpu,
} from 'lucide-react';
import { fetchTrendKeywords } from '../api/trendApi';
import WordCloud from '../components/WordCloud';
import TrendRankingTable from '../components/TrendRankingTable';
import RelatedNewsDrawer from '../components/RelatedNewsDrawer';

const CATEGORIES = [
  { name: '전체', icon: Layers },
  { name: '정치', icon: Landmark },
  { name: '경제', icon: TrendingUp },
  { name: '사회', icon: Users },
  { name: '문화', icon: Palette },
  { name: '국제', icon: Globe },
  { name: '지역', icon: MapPin },
  { name: '스포츠', icon: Trophy },
  { name: 'IT과학', icon: Cpu },
];

const ENTITY_TYPES = [
  { code: 'ALL', label: '전체 보기', icon: Layers, color: 'text-slate-700' },
  { code: 'PS', label: '인물 (PS)', icon: User, color: 'text-orange-600', dot: 'bg-orange-500' },
  { code: 'LC', label: '장소 (LC)', icon: MapPin, color: 'text-emerald-600', dot: 'bg-emerald-500' },
  { code: 'OG', label: '기관 (OG)', icon: Building2, color: 'text-blue-600', dot: 'bg-blue-500' },
];

export default function TrendPage({ onSelectNews }) {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedEntityType, setSelectedEntityType] = useState('ALL');
  const [viewMode, setViewMode] = useState('cloud'); // 'cloud' | 'table'

  const [keywords, setKeywords] = useState([]);
  const [newsCount, setNewsCount] = useState(0);
  const [crawledAt, setCrawledAt] = useState(null);
  const [schedulerInfo, setSchedulerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // 클릭한 키워드 (관련 기사 드로어용)
  const [activeKeyword, setActiveKeyword] = useState(null);

  // 키워드 데이터 로드
  const loadKeywords = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchTrendKeywords({
        category: selectedCategory,
        entityType: selectedEntityType,
      });
      setKeywords(res.keywords || []);
      setNewsCount(res.news_count || 0);
      setCrawledAt(res.crawled_at);
      setSchedulerInfo(res.scheduler);
    } catch (err) {
      console.error('키워드 로드 에러:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedEntityType]);

  useEffect(() => {
    loadKeywords();
  }, [loadKeywords]);

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. 상단 히어로 & 헤더 */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5" />
                  빅카인즈 공식 빅데이터 분석
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  3시간 자동 갱신
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                오늘의 키워드 <span className="text-blue-600">워드클라우드</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
                매일 전국 54개 언론사 뉴스에서 빅데이터 AI로 추출한 주요 <strong className="text-slate-700">인물(PS)·기관(OG)·장소(LC)</strong>를 분석하여 3시간 간격(매일 00:30부터 3시간 주기)으로 제공합니다.
              </p>
            </div>

            {/* 우측 분석 대상 뉴스 배지 */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-600 flex items-center gap-2 shadow-xs">
                <Database className="w-4 h-4 text-blue-600" />
                <span>분석 대상 뉴스:</span>
                <strong className="text-slate-900 font-extrabold text-sm">
                  {newsCount.toLocaleString()}
                </strong>
                <span>건</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 카테고리 탭 네비게이션 (FeedPage와 동일한 규격 및 디자인 적용) */}
      <nav className="w-full bg-white border-b border-slate-200 overflow-x-auto no-scrollbar shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1 sm:space-x-2 py-2.5">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              const Icon = cat.icon;
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-600/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* 3. 컨트롤 패널 (개체명 필터 & 뷰 모드) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        {/* 서브 컨트롤 바 (개체명 필터 + 보기 모드 토글 + 범례) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
          {/* 개체명 타입 필터 (전체, 인물, 장소, 기관) */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">유형:</span>
            {ENTITY_TYPES.map((t) => {
              const isActive = selectedEntityType === t.code;
              const IconComp = t.icon;
              return (
                <button
                  key={t.code}
                  onClick={() => setSelectedEntityType(t.code)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* 우측 범례 및 뷰 모드 토글 */}
          <div className="flex items-center gap-4 justify-between md:justify-end">
            {/* 색상 범례 */}
            <div className="hidden lg:flex items-center gap-3 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>인물(PS)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>장소(LC)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>기관(OG)</span>
              </span>
            </div>

            {/* 뷰 모드 (워드클라우드 vs 순위표) */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('cloud')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'cloud'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>워드클라우드</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>순위표 ({keywords.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. 메인 시각화 영역 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center text-slate-400 gap-3 bg-white rounded-3xl border border-slate-200">
            <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
            <p className="text-sm font-semibold">빅카인즈 오늘의 키워드를 시각화하고 있습니다...</p>
          </div>
        ) : viewMode === 'cloud' ? (
          <div>
            <WordCloud
              keywords={keywords}
              onKeywordClick={(kw) => setActiveKeyword(kw)}
            />
            <p className="text-center text-xs text-slate-400 mt-3">
              💡 키워드를 클릭하면 해당 키워드가 언급된 최신 뉴스 기사를 즉시 확인할 수 있습니다.
            </p>
          </div>
        ) : (
          <TrendRankingTable
            keywords={keywords}
            onKeywordClick={(kw) => setActiveKeyword(kw)}
          />
        )}
      </main>

      {/* 4. 클릭 시 슬라이드오버 관련 기사 검색 드로어 */}
      {activeKeyword && (
        <RelatedNewsDrawer
          keyword={activeKeyword}
          onClose={() => setActiveKeyword(null)}
          onSelectNews={(n) => {
            setActiveKeyword(null);
            onSelectNews && onSelectNews(n);
          }}
        />
      )}
    </div>
  );
}
