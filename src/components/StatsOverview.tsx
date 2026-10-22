import React from 'react';
import { ArrowDown, ArrowUp, HardDrive, CheckCircle2, PauseCircle, Search, Sparkles } from 'lucide-react';
import { translations, Language } from '../locales/i18n';
import { formatSpeed, formatBytes } from '../utils/formatters';

interface StatsOverviewProps {
  lang: Language;
  totalDownSpeed: number;
  totalUpSpeed: number;
  totalDownloaded: number;
  activeCount: number;
  seedingCount: number;
  filter: 'all' | 'downloading' | 'seeding' | 'completed' | 'paused';
  onFilterChange: (filter: 'all' | 'downloading' | 'seeding' | 'completed' | 'paused') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  counts: {
    all: number;
    downloading: number;
    seeding: number;
    completed: number;
    paused: number;
  };
  onQuickAddDemo: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  lang,
  totalDownSpeed,
  totalUpSpeed,
  totalDownloaded,
  filter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  counts,
  onQuickAddDemo,
}) => {
  const t = translations[lang];

  return (
    <div className="space-y-4">
      {/* 4-Column Metric Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Down Speed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.totalDownload}</span>
            <ArrowDown className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {formatSpeed(totalDownSpeed, lang)}
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            {counts.downloading} active downloading
          </p>
        </div>

        {/* Up Speed */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{t.totalUpload}</span>
            <ArrowUp className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {formatSpeed(totalUpSpeed, lang)}
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            {counts.seeding} swarms seeding
          </p>
        </div>

        {/* Total Downloaded Data */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Total Transferred</span>
            <HardDrive className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-xl font-bold font-mono tabular-nums text-slate-100">
            {formatBytes(totalDownloaded, lang)}
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-1">
            Aggregated session volume
          </p>
        </div>

        {/* Quick Action / Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Quick Demo Swarm</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-1">
            <button
              onClick={onQuickAddDemo}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 hover:text-cyan-300 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Load Sintel 4K Movie</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-mono mt-1 text-center truncate">
            Instant live download test
          </p>
        </div>

      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Interactive Segmented Filter Tabs (compliant with rule 1.A: functional buttons) */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto text-xs">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'all'
                ? 'bg-slate-800 text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.allTorrents} ({counts.all})
          </button>

          <button
            onClick={() => onFilterChange('downloading')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'downloading'
                ? 'bg-slate-800 text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.downloading} ({counts.downloading})
          </button>

          <button
            onClick={() => onFilterChange('seeding')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'seeding'
                ? 'bg-slate-800 text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.seeding} ({counts.seeding})
          </button>

          <button
            onClick={() => onFilterChange('paused')}
            className={`px-3 py-1.5 font-medium rounded-md transition-colors whitespace-nowrap ${
              filter === 'paused'
                ? 'bg-slate-800 text-cyan-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.paused} ({counts.paused})
          </button>
        </div>

        {/* Search input */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};
