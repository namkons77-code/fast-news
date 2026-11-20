import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Clock,
  Bookmark,
  ArrowUpRight,
  Flame,
  Newspaper,
  Tag
} from 'lucide-react';
import { formatTimeAgo, getCategoryTheme } from '../utils/formatters';

const POPULAR_KEYWORDS = [
  '인공지능',
  '금리',
  '반도체',
  '대통령',
  '국회',
  '부동산',
  '수능',
  '미국',
  '우주',
  '축구',
];

export default function MagazineHero({
  headlineArticles = [],
  topArticle,
  subArticles = [],
  trendingArticles = [],
  onSelectNews,
  onToggleBookmark,
  bookmarkedIds = new Set(),
}) {
  const navigate = useNavigate();

  // 슬라이드 대상 기사 목록 조합 (headlineArticles 우선, fallback으로 topArticle + subArticles)
  const items = React.useMemo(() => {
    if (headlineArticles && headlineArticles.length > 0) {
      return headlineArticles;
    }
    const combined = [topArticle, ...(subArticles || [])].filter(Boolean);
    return combined;
  }, [headlineArticles, topArticle, subArticles]);

  const N = items.length;

  // 무한 롤링을 위해 3세트 복제
  const extendedSlides = React.useMemo(() => {
    if (N === 0) return [];
    if (N === 1) return [items[0]];
    return [...items, ...items, ...items];
  }, [items, N]);

  // 시작 인덱스는 중간 세트의 첫 번째 (index = N)
  const [trackIndex, setTrackIndex] = useState(N > 1 ? N : 0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // N 변경 시 인덱스 동기화
  useEffect(() => {
    if (N > 1) {
      setTrackIndex(N);
      setIsTransitioning(true);
    }
  }, [N]);

  // 터치 스와이프 제어
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  const handleNext = () => {
    if (N <= 1) return;
    setIsTransitioning(true);
    setTrackIndex((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (N <= 1) return;
    setIsTransitioning(true);
    setTrackIndex((prev) => prev - 1);
  };

  // 트랜지션 완료 시 무한 루프 인덱스 보정 (깜빡임 없이 위치 리셋)
  const handleTransitionEnd = () => {
    if (N <= 1) return;
    if (trackIndex >= 2 * N) {
      setIsTransitioning(false);
      setTrackIndex(trackIndex - N);
    } else if (trackIndex < N) {
      setIsTransitioning(false);
      setTrackIndex(trackIndex + N);
    }
  };

  // 트랜지션 해제 후 다음 프레임에서 재활성화
  useEffect(() => {
    if (!isTransitioning) {
      const timer = setTimeout(() => {
        setIsTransitioning(true);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isTransitioning]);

  // 4.5초 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlaying || isHovered || N <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 4500);
    return () => clearInterval(timer);
  }, [isAutoPlaying, isHovered, trackIndex, N]);

  // 하단 닷 인디케이터 점프
  const handleJumpTo = (targetIdx) => {
    if (N <= 1) return;
    const currentMod = trackIndex % N;
    const diff = targetIdx - currentMod;
    setIsTransitioning(true);
    setTrackIndex(trackIndex + diff);
  };

  if (!items || items.length === 0) return null;

  // 활성 기사의 인덱스 (0 ~ N-1)
  const activeDotIndex = N > 0 ? (trackIndex % N) : 0;
  const activeArticle = items[activeDotIndex] || items[0];

  // 슬라이드 레이아웃 파라미터 (TVING 스타일: 메인 카드 86%, 양쪽 피크 7%씩)
  const slideWidthPercent = 86;
  const peekPercent = (100 - slideWidthPercent) / 2; // 7%
  const gapPx = 16;

  return (
    <section className="mb-12">
      {/* 1. 상단 섹션 타이틀 & 티빙 스타일 뱃지 */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            오늘의 1면 헤드라인 & 이슈 브리핑
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
          <span className="hidden md:inline">마우스를 올리면 자동 넘김이 정지됩니다</span>
          <div className="flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>실시간 큐레이션</span>
          </div>
        </div>
      </div>

      {/* 2. TVING 스타일 파노라마 히어로 캐러셀 (블랙 스테이지) */}
      <div
        className="relative w-full bg-slate-950 rounded-2xl sm:rounded-3xl p-2.5 sm:p-5 shadow-2xl overflow-hidden select-none border border-slate-900"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 슬라이더 트랙 컨테이너 */}
        <div className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl">
          <div
            className={`flex items-stretch ${
              isTransitioning
                ? 'transition-transform duration-600 ease-out'
                : 'transition-none'
            }`}
            style={{
              transform: `translateX(calc(${peekPercent}% - ${
                trackIndex * slideWidthPercent
              }% - ${trackIndex * gapPx}px))`,
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {extendedSlides.map((slide, idx) => {
              const isCurrent = idx === trackIndex;
              const isBookmarked = bookmarkedIds.has(slide.id);
              const theme = getCategoryTheme(slide.category_code);

              return (
                <div
                  key={`${slide.id}-${idx}`}
                  style={{
                    flex: `0 0 ${slideWidthPercent}%`,
                    maxWidth: `${slideWidthPercent}%`,
                    marginRight: `${gapPx}px`,
                  }}
                  onClick={() => {
                    if (isCurrent) {
                      onSelectNews(slide);
                    } else if (idx < trackIndex) {
                      handlePrev();
                    } else {
                      handleNext();
                    }
                  }}
                  className={`relative group rounded-xl sm:rounded-2xl lg:rounded-[24px] overflow-hidden transition-all duration-500 cursor-pointer ${
                    isCurrent
                      ? 'scale-100 opacity-100 shadow-2xl z-20 ring-1 ring-white/10'
                      : 'scale-[0.96] opacity-45 hover:opacity-75 z-10 brightness-75'
                  }`}
                >
                  {/* 슬라이드 와이드 뷰포트 (높이 약 380px ~ 480px) */}
                  <div className="relative w-full h-[320px] sm:h-[400px] md:h-[460px] lg:h-[500px] bg-slate-900 overflow-hidden">
                    {/* 메인 이미지 */}
                    {slide.image_url ? (
                      <img
                        src={slide.image_url}
                        alt={slide.title}
                        referrerPolicy="no-referrer"
                        className={`w-full h-full object-cover object-center ${
                          isCurrent
                            ? 'group-hover:scale-105 transition-transform duration-700'
                            : ''
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center text-white`}
                      >
                        <Newspaper className="w-16 h-16 opacity-40 mb-3" />
                        <span className="text-base font-black opacity-90 tracking-wide">
                          {slide.category} 헤드라인 포커스
                        </span>
                      </div>
                    )}

                    {/* TVING 시그니처 듀얼 그라디언트 (하단 + 좌측) */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/30 to-transparent"></div>

                    {/* 슬라이드 상단 뱃지 & 북마크 (활성 슬라이드 전용) */}
                    {isCurrent && (
                      <div className="absolute top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 flex items-center justify-between z-10">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-red-600 text-white shadow-lg tracking-wider">
                            HEADLINE 1면
                          </span>
                          <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                            {slide.source}
                          </span>
                          <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/20 backdrop-blur-md text-slate-200 border border-white/10 hidden sm:inline">
                            {slide.category}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(slide);
                          }}
                          className={`p-2.5 rounded-full backdrop-blur-md transition shadow-md ${
                            isBookmarked
                              ? 'bg-amber-500 text-white'
                              : 'bg-black/50 text-white/80 hover:text-white hover:bg-black/80 border border-white/20'
                          }`}
                          title={isBookmarked ? '스크랩 취소' : '기사 스크랩'}
                        >
                          <Bookmark
                            className={`w-4 h-4 ${
                              isBookmarked ? 'fill-white' : ''
                            }`}
                          />
                        </button>
                      </div>
                    )}

                    {/* 슬라이드 하단 텍스트 & 컨트롤 (TVING 스타일: 타이틀 + 2줄 요약) */}
                    {isCurrent && (
                      <div className="absolute bottom-4 sm:bottom-7 left-4 sm:left-7 right-4 sm:right-7 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
                        {/* 좌측: 타이틀 및 2줄 브리핑 */}
                        <div className="max-w-2xl sm:max-w-3xl">
                          {/* 대형 타이틀 */}
                          <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight leading-[1.2] mb-2 sm:mb-3 drop-shadow-md line-clamp-2 break-keep">
                            {slide.title}
                          </h3>

                          {/* 2줄 브리핑 요약문 (TVING 스타일 깔끔한 줄바꿈) */}
                          <p className="text-xs sm:text-sm md:text-[15px] text-slate-200/90 font-medium leading-relaxed drop-shadow line-clamp-2 break-keep mb-3 sm:mb-4">
                            {slide.summary || slide.content}
                          </p>

                          {/* 기사 전문 보기 버튼 + 시간 정보 */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectNews(slide);
                              }}
                              className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-white text-slate-950 font-black text-xs sm:text-sm hover:bg-slate-200 active:scale-95 transition shadow-xl inline-flex items-center gap-2 group/btn"
                            >
                              <span>기사 전문 보기</span>
                              <ArrowUpRight className="w-4 h-4 text-slate-950 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                            </button>

                            <span className="text-xs text-white/80 font-semibold flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                              <Clock className="w-3.5 h-3.5 text-red-400" />
                              {formatTimeAgo(slide.published_at)}
                            </span>
                          </div>
                        </div>

                        {/* 우측 하단: TVING 스타일 닷 인디케이터 & 자동 재생 버튼 */}
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 sm:px-4 py-2 rounded-full border border-white/15 shrink-0 self-end md:self-auto">
                          {items.map((_, dotIdx) => {
                            const isActive = activeDotIndex === dotIdx;
                            return (
                              <button
                                key={dotIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleJumpTo(dotIdx);
                                }}
                                className={`transition-all duration-300 rounded-full ${
                                  isActive
                                    ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-white'
                                    : 'w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white/40 hover:bg-white/80'
                                }`}
                                aria-label={`슬라이드 ${dotIdx + 1}로 이동`}
                              />
                            );
                          })}

                          {/* 재생 / 일시정지 아이콘 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsAutoPlaying(!isAutoPlaying);
                            }}
                            className="ml-1 text-white/70 hover:text-white transition p-0.5"
                            title={isAutoPlaying ? '자동 넘김 일시정지' : '자동 넘김 시작'}
                          >
                            {isAutoPlaying ? (
                              <Pause className="w-3 h-3 fill-current" />
                            ) : (
                              <Play className="w-3 h-3 fill-current" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. 좌우 슬라이드 네비게이션 화살표 (<, > TVING 시그니처 버튼) */}
        {N > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/75 backdrop-blur-xs transition shadow-xl hover:scale-110 active:scale-95"
              aria-label="이전 뉴스"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full text-white/80 hover:text-white bg-black/40 hover:bg-black/75 backdrop-blur-xs transition shadow-xl hover:scale-110 active:scale-95"
              aria-label="다음 뉴스"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </>
        )}
      </div>

      {/* 4. 하단 실시간 이슈 브리핑 TOP 5 퀵 스트립 */}
      {trendingArticles && trendingArticles.length > 0 && (
        <div className="mt-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-900">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <Flame className="w-4 h-4 text-red-500" />
              <span>실시간 이슈 브리핑 TOP 5</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">실시간 주요 이슈 순</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {trendingArticles.slice(0, 5).map((item, idx) => (
              <div
                key={item.id}
                onClick={() => onSelectNews(item)}
                className="group flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition border border-transparent hover:border-slate-200"
              >
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${
                    idx === 0
                      ? 'bg-red-600 text-white'
                      : idx === 1
                      ? 'bg-red-500 text-white'
                      : idx === 2
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 group-hover:text-red-600 truncate leading-snug">
                    {item.title}
                  </p>
                  <span className="text-[11px] text-slate-500 block truncate mt-0.5 font-medium">
                    {item.source} · {item.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. 오늘의 핫 토픽 키워드 (실시간 이슈 브리핑 TOP 5 바로 아래로 이동) */}
      <div className="mt-4 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
              오늘의 핫 토픽 키워드
            </h3>
            <span className="text-xs text-slate-400 hidden sm:inline">
              관심 있는 키워드를 누르면 관련 기사로 바로 이동합니다.
            </span>
          </div>
          <span className="text-[11px] text-blue-600 font-semibold hidden md:inline">
            키워드 클릭 시 검색 피드 연동
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {POPULAR_KEYWORDS.map((kw) => (
            <button
              key={kw}
              onClick={() => navigate(`/feed?search=${encodeURIComponent(kw)}`)}
              className="px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 hover:border-blue-300 transition shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
            >
              #{kw}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
