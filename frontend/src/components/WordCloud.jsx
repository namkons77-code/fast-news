import React, { useMemo, useState } from 'react';
import { User, MapPin, Building2, Sparkles, ExternalLink } from 'lucide-react';

const ENTITY_CONFIG = {
  PS: {
    label: '인물',
    color: '#ea580c', // orange-600
    hoverColor: '#c2410c',
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: User,
  },
  LC: {
    label: '장소',
    color: '#059669', // emerald-600
    hoverColor: '#047857',
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: MapPin,
  },
  OG: {
    label: '기관',
    color: '#2563eb', // blue-600
    hoverColor: '#1d4ed8',
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: Building2,
  },
};

export default function WordCloud({ keywords = [], onKeywordClick }) {
  const [hoveredWord, setHoveredWord] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 1. 워드클라우드 레이아웃 연산 (중심 기준 아르키메데스 나선 배치 알고리즘)
  const placedWords = useMemo(() => {
    if (!keywords || keywords.length === 0) return [];

    const width = 960;
    const height = 540;
    const cx = width / 2;
    const cy = height / 2;

    const maxCount = Math.max(...keywords.map((k) => k.count || 1), 1);
    const minCount = Math.min(...keywords.map((k) => k.count || 1), 1);

    // 폰트 크기 계산 (15px ~ 48px)
    const getFontSize = (count) => {
      if (maxCount === minCount) return 24;
      const norm = (count - minCount) / (maxCount - minCount);
      return Math.round(15 + Math.pow(norm, 0.6) * 33);
    };

    const placed = [];
    const occupiedBoxes = [];

    // 사각형 충돌 감지 함수 (여백 포함)
    const checkCollision = (box) => {
      for (const b of occupiedBoxes) {
        if (
          box.x < b.x + b.w &&
          box.x + box.w > b.x &&
          box.y < b.y + b.h &&
          box.y + box.h > b.y
        ) {
          return true;
        }
      }
      return false;
    };

    // 중요도(count) 내림차순으로 중심부터 배치
    const sorted = [...keywords].sort((a, b) => (b.count || 0) - (a.count || 0));

    sorted.forEach((item, index) => {
      const fontSize = getFontSize(item.count || 1);
      // 한글 글자당 대략적 너비 및 높이 근사치
      const textLen = (item.entity_name || '').length;
      const w = textLen * (fontSize * 0.95) + 14;
      const h = fontSize + 8;

      let placedSuccessfully = false;
      let angle = (index * 0.7) % (2 * Math.PI);
      let radius = 0;
      const stepRadius = 3.5;
      const stepAngle = 0.35;
      const maxRadius = Math.min(width, height) * 0.48;

      while (radius < maxRadius) {
        const x = cx + radius * Math.cos(angle) - w / 2;
        const y = cy + radius * Math.sin(angle) * 0.85 - h / 2;

        const box = { x, y, w, h };

        // 캔버스 경계 내부 및 충돌 없음 확인
        if (
          x >= 20 &&
          x + w <= width - 20 &&
          y >= 20 &&
          y + h <= height - 20 &&
          !checkCollision(box)
        ) {
          occupiedBoxes.push(box);
          placed.push({
            ...item,
            x: Math.round(x + w / 2),
            y: Math.round(y + h / 2 + fontSize * 0.35),
            fontSize,
            box,
            rank: index + 1,
          });
          placedSuccessfully = true;
          break;
        }

        angle += stepAngle;
        radius += stepRadius * 0.08;
      }

      // 배치 공간 부족 시 그리드 여백 폴백
      if (!placedSuccessfully) {
        // 여백이 부족하면 스킵하거나 작은 크기로 외곽에 배치
      }
    });

    return placed;
  }, [keywords]);

  const handleMouseEnter = (item, e) => {
    setHoveredWord(item);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleMouseLeave = () => {
    setHoveredWord(null);
  };

  if (!keywords || keywords.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-white rounded-3xl border border-slate-100 p-8 shadow-xs">
        <Sparkles className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
        <p className="text-base font-semibold text-slate-600">표시할 키워드 데이터가 없습니다.</p>
        <p className="text-xs text-slate-400 mt-1">상단의 수동 갱신 버튼을 눌러 최신 키워드를 수집해보세요.</p>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-gradient-to-b from-white via-slate-50/50 to-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden select-none">
      {/* 배경 장식 방사형 그리드 */}
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* SVG 워드클라우드 캔버스 */}
      <svg
        viewBox="0 0 960 540"
        className="w-full h-auto max-h-[620px] mx-auto block"
        style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.03))' }}
      >
        <defs>
          <radialGradient id="cloudCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 중심부 은은한 글로우 */}
        <circle cx="480" cy="270" r="280" fill="url(#cloudCenterGlow)" />

        {placedWords.map((item) => {
          const cfg = ENTITY_CONFIG[item.entity_type] || {
            color: '#475569',
            hoverColor: '#1e293b',
          };
          const isHovered = hoveredWord?.entity_name === item.entity_name;

          return (
            <g
              key={`${item.category_name}-${item.entity_name}-${item.rank}`}
              className="cursor-pointer transition-transform duration-200"
              style={{
                transformOrigin: `${item.x}px ${item.y}px`,
                transform: isHovered ? 'scale(1.12)' : 'scale(1)',
              }}
              onClick={() => onKeywordClick && onKeywordClick(item.entity_name)}
              onMouseEnter={(e) => handleMouseEnter(item, e)}
              onMouseLeave={handleMouseLeave}
            >
              {/* 호버 시 둥근 배경 캡슐 */}
              {isHovered && (
                <rect
                  x={item.box.x - 6}
                  y={item.box.y - 4}
                  width={item.box.w + 12}
                  height={item.box.h + 8}
                  rx="12"
                  fill="#ffffff"
                  stroke={cfg.color}
                  strokeWidth="2"
                  className="filter drop-shadow-md"
                />
              )}

              {/* 텍스트 요소 */}
              <text
                x={item.x}
                y={item.y}
                textAnchor="middle"
                fontSize={item.fontSize}
                fontWeight={item.fontSize > 26 ? '800' : item.fontSize > 20 ? '700' : '600'}
                fill={isHovered ? cfg.hoverColor : cfg.color}
                letterSpacing="-0.02em"
                className="transition-colors duration-150"
                style={{
                  fontFamily: '"Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                }}
              >
                {item.entity_name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 툴팁 팝오버 */}
      {hoveredWord && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 px-3.5 py-2.5 rounded-2xl bg-slate-900/95 backdrop-blur text-white text-xs shadow-xl border border-slate-700/50 flex flex-col gap-1 min-w-[170px]"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1.5">
            <span className="font-extrabold text-sm text-white tracking-tight">
              {hoveredWord.entity_name}
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                ENTITY_CONFIG[hoveredWord.entity_type]?.bg || 'bg-slate-700 text-slate-200'
              }`}
            >
              {ENTITY_CONFIG[hoveredWord.entity_type]?.label || hoveredWord.entity_type}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-300 pt-0.5">
            <span>언급 빈도</span>
            <span className="font-bold text-amber-400">{hoveredWord.count.toLocaleString()}회</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>순위</span>
            <span className="font-semibold text-slate-200">{hoveredWord.rank}위</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span>카테고리</span>
            <span className="font-semibold text-blue-400">{hoveredWord.category_name}</span>
          </div>

          <div className="text-[10px] text-blue-300 pt-1 flex items-center gap-1 font-medium">
            <ExternalLink className="w-3 h-3" />
            <span>클릭 시 관련 뉴스 기사 검색</span>
          </div>
        </div>
      )}
    </div>
  );
}
