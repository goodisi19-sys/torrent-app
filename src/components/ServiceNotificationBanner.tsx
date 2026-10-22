import React, { useState } from 'react';
import { Radio, Download, ShieldCheck, ChevronDown, ChevronUp, Bell } from 'lucide-react';
import { translations, Language } from '../locales/i18n';
import { formatSpeed, formatBytes } from '../utils/formatters';

interface ServiceNotificationBannerProps {
  lang: Language;
  activeCount: number;
  totalDownSpeed: number;
  totalUpSpeed: number;
  totalDownloaded: number;
}

export const ServiceNotificationBanner: React.FC<ServiceNotificationBannerProps> = ({
  lang,
  activeCount,
  totalDownSpeed,
  totalUpSpeed,
  totalDownloaded,
}) => {
  const t = translations[lang];
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-slate-800/80 bg-slate-900/60 px-4 py-2.5 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs">
        
        {/* Left: Ongoing Android Service Status Indicator */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400">
            <Radio className="w-3 h-3 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="font-semibold text-slate-100">{t.serviceActive}</span>
            <span className="text-slate-600 hidden md:inline">·</span>
            <span className="text-slate-400 hidden md:inline">{t.serviceDescription}</span>
          </div>
        </div>

        {/* Right: Metrics & Channel info */}
        <div className="flex items-center gap-4 text-slate-400 font-mono tabular-nums">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-sans">{t.activeCount}:</span>
            <span className="text-slate-200 font-medium">{activeCount}</span>
          </div>
          <span className="text-slate-700">·</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-500 text-[11px] font-sans">Total:</span>
            <span className="text-slate-200 font-medium">{formatBytes(totalDownloaded, lang)}</span>
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] font-sans text-slate-400 hover:text-cyan-400 transition-colors ml-1"
          >
            <span>{expanded ? 'Hide Details' : 'Service Info'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-3 pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <Bell className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-200">{t.notificationChannel}</p>
              <p className="text-[11px] text-slate-500">ID: torrent_download_channel (Importance: Low)</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-200">Session Protocol</p>
              <p className="text-[11px] text-slate-500">WebTorrent P2P WebRTC + FrostWire/libtorrent compatibility</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Download className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-slate-200">Storage Destination</p>
              <p className="text-[11px] text-slate-500">In-Browser IndexedDB / Sandbox Memory + Direct Disk Export</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
