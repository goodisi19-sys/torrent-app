import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Video, 
  Music, 
  Image as ImageIcon, 
  Archive, 
  Download, 
  Copy, 
  Check, 
  Layers, 
  Users, 
  Radio, 
  FolderArchive,
  ExternalLink
} from 'lucide-react';
import { TorrentItem, TorrentFileItem } from '../types/torrent';
import { translations, Language } from '../locales/i18n';
import { formatSpeed, formatBytes, formatEta } from '../utils/formatters';
import { TorrentPieceMap } from './TorrentPieceMap';
import JSZip from 'jszip';

interface TorrentRowProps {
  item: TorrentItem;
  lang: Language;
  onTogglePause: () => void;
  onRemove: () => void;
  onPreviewFile: (file: TorrentFileItem, item: TorrentItem) => void;
  onDownloadFile: (file: TorrentFileItem, item: TorrentItem) => void;
}

export const TorrentRow: React.FC<TorrentRowProps> = ({
  item,
  lang,
  onTogglePause,
  onRemove,
  onPreviewFile,
  onDownloadFile,
}) => {
  const t = translations[lang];
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'pieces' | 'peers' | 'trackers'>('files');
  const [copiedHash, setCopiedHash] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  const percent = Math.min(100, Math.max(0, Math.round(item.progress * 100)));
  const formattedSpeed = formatSpeed(item.downloadSpeed, lang);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(item.infoHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownloadAllZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      
      for (const file of item.files) {
        // create dummy or real content for file
        const content = `Torrent File: ${file.name}\nSize: ${file.length} bytes\nInfoHash: ${item.infoHash}\nDownloaded via Torrent Downloader`;
        zip.file(file.name, content);
      }
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name.replace(/[^a-zA-Z0-9_-]/g, '_')}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating zip:', e);
    } finally {
      setIsZipping(false);
    }
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4 text-sky-400" />;
      case 'audio': return <Music className="w-4 h-4 text-emerald-400" />;
      case 'image': return <ImageIcon className="w-4 h-4 text-amber-400" />;
      case 'archive': return <Archive className="w-4 h-4 text-purple-400" />;
      default: return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700/80 transition-all shadow-sm">
      {/* Primary Card Content matching Android Layout */}
      <div className="p-4 sm:p-5">
        
        {/* Title & InfoHash */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-semibold text-slate-100 truncate" title={item.name}>
              {item.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-mono">
              <span className="truncate max-w-[180px] sm:max-w-xs">{item.infoHash}</span>
              <button
                onClick={handleCopyHash}
                className="hover:text-slate-300 transition-colors inline-flex items-center gap-1"
                title={t.copyHash}
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Status Label (Clean unboxed typography) */}
          <div className="text-right shrink-0">
            <span className={`text-xs font-medium ${
              item.isPaused
                ? 'text-amber-400'
                : item.progress >= 1
                ? 'text-emerald-400'
                : 'text-cyan-400'
            }`}>
              {item.isPaused
                ? t.paused
                : item.progress >= 1
                ? t.seeding
                : t.downloading}
            </span>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 rounded-full ${
              item.isPaused
                ? 'bg-amber-500/80'
                : item.progress >= 1
                ? 'bg-emerald-500'
                : 'bg-cyan-400'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        {/* Telemetry Row (matching Android row layout: percent% • speed and Seeds | Peers) */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-400 font-mono tabular-nums">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-200">{percent}%</span>
            <span className="text-slate-600">·</span>
            <span>{formattedSpeed}</span>
            <span className="text-slate-600 hidden sm:inline">·</span>
            <span className="text-slate-500 hidden sm:inline">
              {formatBytes(item.downloadedBytes, lang)} / {formatBytes(item.totalBytes, lang)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {item.eta > 0 && !item.isPaused && (
              <span className="text-slate-500 hidden md:inline">
                {t.eta}: {formatEta(item.eta, lang)}
              </span>
            )}
            <span className="text-slate-300">
              {lang === 'ru' ? 'Пиры:' : 'Peers:'} {item.peers} | {lang === 'ru' ? 'Сиды:' : 'Seeds:'} {item.seeds}
            </span>
          </div>
        </div>

        {/* Bottom Actions Row matching Android: Pause/Resume + Remove + Details toggle */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span>{expanded ? 'Hide Details' : `${t.files} (${item.files.length})`}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <div className="flex items-center gap-2">
            {/* Pause / Resume Button */}
            <button
              onClick={onTogglePause}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                item.isPaused
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
              }`}
            >
              {item.isPaused ? (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{t.resume}</span>
                </>
              ) : (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>{t.pause}</span>
                </>
              )}
            </button>

            {/* Remove Button */}
            <button
              onClick={onRemove}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-rose-900/40 rounded-md transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.remove}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Expanded Drawer: Files, Piece Map, Swarm, Trackers */}
      {expanded && (
        <div className="border-t border-slate-800 bg-slate-950/50 p-4 sm:p-5">
          {/* Sub-tabs */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('files')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'files'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t.files} ({item.files.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('pieces')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'pieces'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t.pieces}</span>
              </button>

              <button
                onClick={() => setActiveTab('peers')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'peers'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>{t.swarm} ({item.peerList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('trackers')}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === 'trackers'
                    ? 'bg-slate-800 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>{t.trackers} ({item.trackers.length})</span>
              </button>
            </div>

            {/* Download all as zip */}
            {item.files.length > 1 && (
              <button
                onClick={handleDownloadAllZip}
                disabled={isZipping}
                className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-cyan-400 transition-colors"
              >
                <FolderArchive className="w-3.5 h-3.5" />
                <span>{isZipping ? 'Archiving...' : t.saveAllZip}</span>
              </button>
            )}
          </div>

          {/* Files Tab Content */}
          {activeTab === 'files' && (
            <div className="space-y-2">
              <div className="divide-y divide-slate-800/80 rounded-lg border border-slate-800/80 bg-slate-900/40 overflow-hidden">
                {item.files.map((file) => {
                  const filePercent = Math.round(file.progress * 100);
                  const isPlayable = ['video', 'audio', 'image'].includes(file.type);

                  return (
                    <div
                      key={file.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {getFileIcon(file.type)}
                        <div className="min-w-0">
                          <p className="font-medium text-slate-200 truncate">{file.name}</p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {formatBytes(file.length, lang)} · {filePercent}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Stream / Play preview button if media */}
                        {isPlayable && (
                          <button
                            onClick={() => onPreviewFile(file, item)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 font-medium transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>{t.previewFile}</span>
                          </button>
                        )}

                        {/* Save file to disk */}
                        <button
                          onClick={() => onDownloadFile(file, item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium transition-colors"
                          title={t.saveFile}
                        >
                          <Download className="w-3 h-3" />
                          <span>{t.saveFile}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Piece Map Tab */}
          {activeTab === 'pieces' && (
            <TorrentPieceMap
              pieces={item.pieces}
              numPieces={item.numPieces}
              pieceLength={item.pieceLength}
              progress={item.progress}
              infoHash={item.infoHash}
            />
          )}

          {/* Swarm / Peers Tab */}
          {activeTab === 'peers' && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 overflow-hidden">
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 uppercase font-mono tracking-wider sticky top-0">
                    <tr>
                      <th className="py-2 px-3">IP / Port</th>
                      <th className="py-2 px-3">Client</th>
                      <th className="py-2 px-3">Country</th>
                      <th className="py-2 px-3 text-right">Down Speed</th>
                      <th className="py-2 px-3 text-right">Progress</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-300 tabular-nums">
                    {item.peerList.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-1.5 px-3">{p.ip}:{p.port}</td>
                        <td className="py-1.5 px-3 font-sans text-slate-400">{p.client}</td>
                        <td className="py-1.5 px-3 font-sans">{p.country}</td>
                        <td className="py-1.5 px-3 text-right text-emerald-400">{formatSpeed(p.downloadSpeed, lang)}</td>
                        <td className="py-1.5 px-3 text-right">{Math.round(p.progress * 100)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trackers Tab */}
          {activeTab === 'trackers' && (
            <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 space-y-2">
              {item.trackers.map((tr, i) => (
                <div key={i} className="flex items-center justify-between text-xs font-mono p-2 rounded bg-slate-900/60">
                  <span className="truncate text-slate-300 max-w-sm sm:max-w-md">{tr.url}</span>
                  <div className="flex items-center gap-3 shrink-0 text-slate-400">
                    <span className="text-emerald-400">{tr.status}</span>
                    <span>Peers: {tr.peers}</span>
                    <span>Seeds: {tr.seeds}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
};
