import React from 'react';
import {
  Layers,
  Landmark,
  TrendingUp,
  Users,
  Palette,
  Globe,
  MapPin,
  Trophy,
  Cpu,
} from 'lucide-react';
import { getCategoryTheme } from '../utils/formatters';

const CATEGORY_ICONS = {
  all: Layers,
  politics: Landmark,
  economy: TrendingUp,
  society: Users,
  culture: Palette,
  international: Globe,
  regional: MapPin,
  sports: Trophy,
  it_science: Cpu,
};

export default function CategoryNav({
  categories = [],
  selectedCategory = 'all',
  onSelectCategory,
  totalCount = 0,
}) {
  const allTabs = [
    { code: 'all', name: '전체', count: totalCount },
    ...categories,
  ];

  return (
    <nav className="w-full bg-white border-b border-slate-200 overflow-x-auto no-scrollbar shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 py-2.5">
          {allTabs.map((cat) => {
            const isSelected = selectedCategory === cat.code;
            const Icon = CATEGORY_ICONS[cat.code] || Layers;
            const theme = getCategoryTheme(cat.code);

            return (
              <button
                key={cat.code}
                onClick={() => onSelectCategory(cat.code)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25 ring-2 ring-blue-600/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isSelected ? 'text-white' : theme.iconColor || 'text-slate-400'
                  }`}
                />
                <span>{cat.name}</span>
                {cat.count !== undefined && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-medium ${
                      isSelected
                        ? 'bg-blue-700/80 text-blue-100'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {typeof cat.count === 'number' ? cat.count.toLocaleString() : cat.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
