import React from 'react';
import { User, MapPin, Building2, Search, ArrowRight } from 'lucide-react';

const ENTITY_CONFIG = {
  PS: {
    label: '인물',
    badge: 'bg-orange-50 text-orange-700 border-orange-200',
    barColor: 'bg-orange-500',
    icon: User,
  },
  LC: {
    label: '장소',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    barColor: 'bg-emerald-500',
    icon: MapPin,
  },
  OG: {
    label: '기관',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
    barColor: 'bg-blue-500',
    icon: Building2,
  },
};

export default function TrendRankingTable({ keywords = [], onKeywordClick }) {
  const maxCount = Math.max(...keywords.map((k) => k.count || 1), 1);

  if (!keywords || keywords.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        조회된 키워드가 없습니다.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
              <th className="py-3.5 px-4 text-center w-16">순위</th>
              <th className="py-3.5 px-4">키워드</th>
              <th className="py-3.5 px-4 text-center w-24">유형</th>
              <th className="py-3.5 px-4 w-64">언급 빈도 (기사 건수)</th>
              <th className="py-3.5 px-4 text-center w-28">분석 단계</th>
              <th className="py-3.5 px-4 text-center w-28">관련 기사</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {keywords.map((item, idx) => {
              const cfg = ENTITY_CONFIG[item.entity_type] || {
                label: item.entity_type,
                badge: 'bg-slate-100 text-slate-700 border-slate-200',
                barColor: 'bg-slate-500',
                icon: Building2,
              };
              const IconComp = cfg.icon;
              const percent = Math.min(100, Math.round(((item.count || 0) / maxCount) * 100));

              return (
                <tr
                  key={`${item.category_name}-${item.entity_name}-${idx}`}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* 순위 */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs ${
                        idx === 0
                          ? 'bg-amber-100 text-amber-800 font-extrabold'
                          : idx === 1
                          ? 'bg-slate-200 text-slate-800'
                          : idx === 2
                          ? 'bg-orange-100 text-orange-800'
                          : 'text-slate-500'
                      }`}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  {/* 키워드명 */}
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onKeywordClick && onKeywordClick(item.entity_name)}
                      className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-left flex items-center gap-1.5"
                    >
                      <span>{item.entity_name}</span>
                      <Search className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                    </button>
                  </td>

                  {/* 개체명 유형 */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-bold ${cfg.badge}`}
                    >
                      <IconComp className="w-3 h-3" />
                      <span>{cfg.label}</span>
                    </span>
                  </td>

                  {/* 언급 빈도 및 비주얼 바 */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${cfg.barColor}`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="font-extrabold text-slate-800 text-xs w-14 text-right">
                        {(item.count || 0).toLocaleString()}회
                      </span>
                    </div>
                  </td>

                  {/* 분석 단계 */}
                  <td className="py-3 px-4 text-center">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase px-2 py-0.5 bg-slate-100 rounded">
                      {item.step || 'step1'}
                    </span>
                  </td>

                  {/* 기사 검색 버튼 */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => onKeywordClick && onKeywordClick(item.entity_name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 active:scale-95 transition"
                    >
                      <span>뉴스 보기</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
