import React from 'react';
import { ArrowDown, ArrowUp, Plus, Settings, Globe, HardDrive } from 'lucide-react';
import { translations, Language } from '../locales/i18n';
import { formatSpeed } from '../utils/formatters';

interface TopBarProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenAddModal: () => void;
  onOpenSettings: () => void;
  totalDownSpeed: number;
  totalUpSpeed: number;
  activeCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  lang,
  onToggleLang,
  onOpenAddModal,
  onOpenSettings,
  totalDownSpeed,
  totalUpSpeed,
}) => {
  const t = translations[lang];

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-sky-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-950/40">
            <ArrowDown className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
              {t.appTitle}
            </span>
          </div>
        </div>

        {/* Global Live Transfer Rates */}
        <div className="hidden sm:flex items-center gap-6 font-mono text-xs tabular-nums text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="font-medium">{formatSpeed(totalDownSpeed, lang)}</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="font-medium">{formatSpeed(totalUpSpeed, lang)}</span>
          </div>
        </div>

        {/* Primary Actions & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-md transition-colors"
            title="Switch Language (EN / RU)"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="uppercase">{lang}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-md transition-colors"
            title={t.settings}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 active:scale-[0.98] rounded-md transition-all shadow-sm shadow-cyan-500/20 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{t.addTorrent}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
