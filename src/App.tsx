/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Download, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TorrentItem, TorrentFileItem, EngineSettings } from './types/torrent';
import { torrentEngine } from './services/torrentEngine';
import { DEMO_TORRENTS, DemoTorrent } from './services/demoTorrents';
import { translations, Language } from './locales/i18n';
import { TopBar } from './components/TopBar';
import { ServiceNotificationBanner } from './components/ServiceNotificationBanner';
import { StatsOverview } from './components/StatsOverview';
import { TorrentRow } from './components/TorrentRow';
import { AddTorrentModal } from './components/AddTorrentModal';
import { MediaPreviewModal } from './components/MediaPreviewModal';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [torrents, setTorrents] = useState<TorrentItem[]>([]);
  const [lang, setLang] = useState<Language>('en');
  const [filter, setFilter] = useState<'all' | 'downloading' | 'seeding' | 'completed' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ file: TorrentFileItem; torrent: TorrentItem } | null>(null);
  const [torrentToDelete, setTorrentToDelete] = useState<TorrentItem | null>(null);
  
  // Settings
  const [settings, setSettings] = useState<EngineSettings>(torrentEngine.settings);

  // Subscribe to torrentEngine (matching Kotlin TorrentViewModel.bindService)
  useEffect(() => {
    const unsubscribe = torrentEngine.subscribe((updatedList) => {
      setTorrents(updatedList);
    });
    return () => unsubscribe();
  }, []);

  // Sync language with engine
  const toggleLanguage = () => {
    const nextLang: Language = lang === 'en' ? 'ru' : 'en';
    setLang(nextLang);
    torrentEngine.settings.language = nextLang;
  };

  const handleUpdateSettings = (newSettings: Partial<EngineSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    torrentEngine.settings = updated;
  };

  // Handlers matching Kotlin methods
  const handleTogglePause = (infoHash: string) => {
    torrentEngine.togglePause(infoHash);
  };

  const handleRemove = (infoHash: string) => {
    torrentEngine.removeTorrent(infoHash);
    setTorrentToDelete(null);
  };

  const handleAddMagnet = (magnet: string) => {
    torrentEngine.downloadMagnet(magnet);
  };

  const handleAddTorrentBytes = (bytes: ArrayBuffer, name?: string) => {
    torrentEngine.downloadTorrentFile(bytes, name);
  };

  const handleAddDemo = (demo: DemoTorrent) => {
    torrentEngine.addDemoTorrent(demo);
  };

  // Trigger browser file download for a specific torrent file
  const handleDownloadFile = async (file: TorrentFileItem, item: TorrentItem) => {
    try {
      const blob = await torrentEngine.getFileBlob(item.infoHash, file.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export file blob:', err);
    }
  };

  // Aggregated metrics
  const totalDownSpeed = useMemo(() => {
    return torrents.reduce((acc, t) => acc + (t.isPaused ? 0 : t.downloadSpeed), 0);
  }, [torrents]);

  const totalUpSpeed = useMemo(() => {
    return torrents.reduce((acc, t) => acc + (t.isPaused ? 0 : t.uploadSpeed), 0);
  }, [torrents]);

  const totalDownloaded = useMemo(() => {
    return torrents.reduce((acc, t) => acc + t.downloadedBytes, 0);
  }, [torrents]);

  const counts = useMemo(() => {
    return {
      all: torrents.length,
      downloading: torrents.filter(t => !t.isPaused && t.status === 'downloading').length,
      seeding: torrents.filter(t => !t.isPaused && (t.status === 'seeding' || t.progress >= 1)).length,
      completed: torrents.filter(t => t.progress >= 1).length,
      paused: torrents.filter(t => t.isPaused).length,
    };
  }, [torrents]);

  // Filtered & searched torrents list
  const filteredTorrents = useMemo(() => {
    return torrents.filter((item) => {
      // Filter tab check
      if (filter === 'downloading' && (item.isPaused || item.progress >= 1)) return false;
      if (filter === 'seeding' && (item.isPaused || item.progress < 1)) return false;
      if (filter === 'completed' && item.progress < 1) return false;
      if (filter === 'paused' && !item.isPaused) return false;

      // Search query check
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesHash = item.infoHash.toLowerCase().includes(query);
        const matchesFile = item.files.some(f => f.name.toLowerCase().includes(query));
        return matchesName || matchesHash || matchesFile;
      }

      return true;
    });
  }, [torrents, filter, searchQuery]);

  const t = translations[lang];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Bar with brand, transfer rates, actions */}
      <TopBar
        lang={lang}
        onToggleLang={toggleLanguage}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        totalDownSpeed={totalDownSpeed}
        totalUpSpeed={totalUpSpeed}
        activeCount={counts.downloading}
      />

      {/* Android Foreground Service notification banner */}
      <ServiceNotificationBanner
        lang={lang}
        activeCount={counts.downloading}
        totalDownSpeed={totalDownSpeed}
        totalUpSpeed={totalUpSpeed}
        totalDownloaded={totalDownloaded}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        
        {/* Global Statistics & Filters */}
        <StatsOverview
          lang={lang}
          totalDownSpeed={totalDownSpeed}
          totalUpSpeed={totalUpSpeed}
          totalDownloaded={totalDownloaded}
          activeCount={counts.downloading}
          seedingCount={counts.seeding}
          filter={filter}
          onFilterChange={setFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          counts={counts}
          onQuickAddDemo={() => handleAddDemo(DEMO_TORRENTS[0])}
        />

        {/* Torrents List */}
        {filteredTorrents.length === 0 ? (
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[320px]">
            <div className="w-14 h-14 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mb-4">
              <Download className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">
              {t.noTorrents}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mt-1.5 mb-5">
              {lang === 'ru'
                ? 'Добавьте magnet-ссылку, загрузите файл .torrent или запустите открытый демонстрационный торрент.'
                : 'Add a magnet link, upload a .torrent file, or load one of the open demo swarms to get started.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>{t.addTorrent}</span>
              </button>
              <button
                onClick={() => handleAddDemo(DEMO_TORRENTS[1])}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Load Big Buck Bunny
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5">
            {filteredTorrents.map((item) => (
              <TorrentRow
                key={item.infoHash}
                item={item}
                lang={lang}
                onTogglePause={() => handleTogglePause(item.infoHash)}
                onRemove={() => setTorrentToDelete(item)}
                onPreviewFile={(file, currentItem) => setPreviewMedia({ file, torrent: currentItem })}
                onDownloadFile={handleDownloadFile}
              />
            ))}
          </div>
        )}

      </main>

      {/* Floating Action Button (matching Android Compose FloatingActionButton) */}
      <button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-400 hover:bg-cyan-300 active:scale-95 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30 transition-all z-20"
        title={t.addTorrent}
        aria-label={t.addTorrent}
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Delete Confirmation Modal */}
      {torrentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400 mb-3">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-semibold text-slate-100">{t.remove}</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {t.confirmDelete}
            </p>
            <p className="text-xs font-mono text-slate-400 mt-2 p-2 bg-slate-950 rounded border border-slate-800/80 truncate">
              {torrentToDelete.name}
            </p>
            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setTorrentToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleRemove(torrentToDelete.infoHash)}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors shadow-sm"
              >
                {t.remove}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Torrent Modal */}
      <AddTorrentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        lang={lang}
        onAddMagnet={handleAddMagnet}
        onAddTorrentBytes={handleAddTorrentBytes}
        onAddDemo={handleAddDemo}
      />

      {/* Media Preview Modal */}
      <MediaPreviewModal
        isOpen={Boolean(previewMedia)}
        onClose={() => setPreviewMedia(null)}
        file={previewMedia?.file || null}
        torrent={previewMedia?.torrent || null}
        lang={lang}
        onDownloadFile={handleDownloadFile}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        lang={lang}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500 font-mono">
        <p>Torrent Downloader · WebTorrent P2P Engine & Android Kotlin Client Architecture</p>
      </footer>

    </div>
  );
}
