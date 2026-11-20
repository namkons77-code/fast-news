import React, { useEffect, useState } from 'react';
import { X, Newspaper, ExternalLink, Calendar, RefreshCw, Sparkles } from 'lucide-react';
import { fetchNews } from '../api/newsApi';
import { formatTimeAgo } from '../utils/formatters';

export default function RelatedNewsDrawer({ keyword, onClose, onSelectNews }) {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!keyword) return;

    let mounted = true;
    async function searchKeywordNews() {
      setLoading(true);
      try {
        const res = await fetchNews({ search: keyword, limit: 15 });
        if (mounted) {
          setNewsList(res.data || []);
          setTotal(res.total || (res.data ? res.data.length : 0));
        }
      } catch (err) {
        console.error('관련 뉴스 검색 실패:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    searchKeywordNews();
    return () => {
      mounted = false;
    };
  }, [keyword]);

  if (!keyword) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end transition-opacity">
      <div
        className="relative w-full max-w-xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-blue-100 text-blue-700">
                <Sparkles className="w-3 h-3" />
                키워드 심층 탐색
              </span>
              <span className="text-xs text-slate-500">총 {total}건</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              <span className="text-blue-600">‘{keyword}’</span> 관련 최신 뉴스
            </h2>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 기사 목록 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-xs font-semibold">‘{keyword}’ 관련 기사를 검색 중입니다...</p>
            </div>
          ) : newsList.length === 0 ? (
            <div className="py-24 text-center text-slate-400">
              <Newspaper className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">수집된 뉴스 중 관련 기사가 없습니다.</p>
              <p className="text-xs text-slate-400 mt-1">최신 기사 크롤링이 진행되면 추가 기사가 반영됩니다.</p>
            </div>
          ) : (
            newsList.map((item) => (
              <article
                key={item.id}
                onClick={() => {
                  onSelectNews && onSelectNews(item);
                }}
                className="p-4 rounded-2xl border border-slate-200/80 hover:border-blue-400 hover:shadow-md bg-white transition-all cursor-pointer group flex flex-col gap-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{item.source}</span>
                    <span>·</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">
                      {item.category}
                    </span>
                  </div>
                  <span>{formatTimeAgo(item.published_at)}</span>
                </div>

                <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition text-sm leading-snug line-clamp-2">
                  {item.title}
                </h3>

                {item.summary && (
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                )}

                <div className="pt-2 flex items-center justify-between text-xs text-blue-600 font-semibold border-t border-slate-100 mt-1">
                  <span>상세 보기 ➔</span>
                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-blue-600 flex items-center gap-1 text-[11px]"
                    >
                      <span>원문</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
