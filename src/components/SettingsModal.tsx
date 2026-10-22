import React from 'react';
import { X, Sliders, Bell, HardDrive, Shield } from 'lucide-react';
import { EngineSettings } from '../types/torrent';
import { translations, Language } from '../locales/i18n';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EngineSettings;
  onUpdateSettings: (newSettings: Partial<EngineSettings>) => void;
  lang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  lang,
}) => {
  const t = translations[lang];

  if (!isOpen) return null;

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const res = await Notification.requestPermission();
      onUpdateSettings({ enableNotifications: res === 'granted' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-slate-100">{t.settings}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          
          {/* Speed limits */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-100 uppercase tracking-wider text-[11px] font-mono text-cyan-400">
              {t.speedLimits}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block mb-1.5 text-slate-400 font-medium">
                  {t.totalDownload} Max
                </label>
                <select
                  value={settings.maxDownloadSpeed}
                  onChange={(e) => onUpdateSettings({ maxDownloadSpeed: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value={0}>{t.unlimited}</option>
                  <option value={1 * 1024 * 1024}>1 MB/s</option>
                  <option value={3 * 1024 * 1024}>3 MB/s</option>
                  <option value={5 * 1024 * 1024}>5 MB/s</option>
                  <option value={10 * 1024 * 1024}>10 MB/s</option>
                  <option value={25 * 1024 * 1024}>25 MB/s</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 text-slate-400 font-medium">
                  {t.totalUpload} Max
                </label>
                <select
                  value={settings.maxUploadSpeed}
                  onChange={(e) => onUpdateSettings({ maxUploadSpeed: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value={0}>{t.unlimited}</option>
                  <option value={250 * 1024}>250 KB/s</option>
                  <option value={500 * 1024}>500 KB/s</option>
                  <option value={1 * 1024 * 1024}>1 MB/s</option>
                  <option value={3 * 1024 * 1024}>3 MB/s</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active downloads */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-200">Max Active Concurrent Torrents</p>
                <p className="text-[11px] text-slate-500">Auto-queue transfers beyond this limit</p>
              </div>
              <input
                type="number"
                min={1}
                max={15}
                value={settings.maxActiveDownloads}
                onChange={(e) => onUpdateSettings({ maxActiveDownloads: Math.max(1, Number(e.target.value)) })}
                className="w-16 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-center text-slate-200 font-mono"
              />
            </div>
          </div>

          {/* Desktop Notifications */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-200">{t.notifications}</p>
                <p className="text-[11px] text-slate-500">
                  Notify when torrent completes (matches Android Notification Channel)
                </p>
              </div>
            </div>
            <button
              onClick={requestNotificationPermission}
              className={`px-3 py-1.5 rounded-lg font-medium text-xs transition-colors ${
                settings.enableNotifications
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {settings.enableNotifications ? 'Enabled' : 'Enable'}
            </button>
          </div>

          {/* Android Compatibility & Architecture Note */}
          <div className="pt-3 border-t border-slate-800 text-slate-500 space-y-1.5 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400 font-medium">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Android Kotlin Architecture Compatibility</span>
            </div>
            <p>
              Emulates FrostWire/jlibtorrent SessionManager and TorrentDownloadService foreground lifecycle. WebRTC WebTorrent tracker handshakes enable P2P transfers directly in modern web browsers.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
