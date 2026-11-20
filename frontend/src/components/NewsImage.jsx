import React, { useState, useEffect } from 'react';
import { Newspaper } from 'lucide-react';
import { getCategoryTheme } from '../utils/formatters';

export default function NewsImage({
  src,
  alt = '',
  categoryCode = 'politics',
  categoryName = '뉴스',
  className = 'w-full h-full object-cover object-top',
  fallbackType = 'card', // 'card' | 'hero' | 'thumbnail' | 'modal'
}) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [hasError, setHasError] = useState(!src);
  const theme = getCategoryTheme(categoryCode);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(!src);
  }, [src]);

  const handleError = () => {
    if (!currentSrc) {
      setHasError(true);
      return;
    }

    // 빅카인즈 이미지 확장자 자동 복구 (.jpg -> .png -> .jpeg)
    if (currentSrc.includes('bigkinds.or.kr')) {
      if (currentSrc.endsWith('.jpg')) {
        setCurrentSrc(currentSrc.replace(/\.jpg$/, '.png'));
        return;
      }
      if (currentSrc.endsWith('.png')) {
        setCurrentSrc(currentSrc.replace(/\.png$/, '.jpeg'));
        return;
      }
    }

    setHasError(true);
  };

  if (!hasError && currentSrc) {
    return (
      <img
        src={currentSrc}
        alt={alt}
        onError={handleError}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        className={className}
      />
    );
  }

  // 1. 헤어로(Hero) 슬라이드 폴백
  if (fallbackType === 'hero') {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex flex-col items-center justify-center text-white`}>
        <Newspaper className="w-16 h-16 opacity-40 mb-3" />
        <span className="text-base font-black opacity-90 tracking-wide">
          {categoryName} 헤드라인 포커스
        </span>
      </div>
    );
  }

  // 2. 카테고리 펄스 서브 기사 소형 썸네일 폴백
  if (fallbackType === 'thumbnail') {
    return (
      <div className={`w-full h-full bg-gradient-to-br ${theme.gradient} flex items-center justify-center text-white`}>
        <Newspaper className="w-6 h-6 opacity-60" />
      </div>
    );
  }

  // 3. 기사 상세 모달 폴백 (모달에서는 깨진 박스 숨김)
  if (fallbackType === 'modal') {
    return null;
  }

  // 4. 기본 피드/매거진 카드 폴백
  return (
    <div
      className={`w-full h-full bg-gradient-to-br ${theme.gradient} opacity-90 flex flex-col items-center justify-center p-6 text-white`}
    >
      <Newspaper className="w-10 h-10 opacity-70 mb-2" />
      <span className="text-xs font-semibold tracking-wide uppercase opacity-90">
        {categoryName} 뉴스
      </span>
    </div>
  );
}
