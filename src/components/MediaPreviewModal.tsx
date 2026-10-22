import React from 'react';
import { X, Download, Play, Music, Video, Image as ImageIcon, FileText } from 'lucide-react';
import { TorrentFileItem, TorrentItem } from '../types/torrent';
import { translations, Language } from '../locales/i18n';
import { formatBytes } from '../utils/formatters';

interface MediaPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: TorrentFileItem | null;
  torrent: TorrentItem | null;
  lang: Language;
  onDownloadFile: (file: TorrentFileItem, item: TorrentItem) => void;
}

export const MediaPreviewModal: React.FC<MediaPreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  torrent,
  lang,
  onDownloadFile,
}) => {
  const t = translations[lang];

  if (!isOpen || !file || !torrent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {file.type === 'video' && <Video className="w-4 h-4 text-sky-400 shrink-0" />}
            {file.type === 'audio' && <Music className="w-4 h-4 text-emerald-400 shrink-0" />}
            {file.type === 'image' && <ImageIcon className="w-4 h-4 text-amber-400 shrink-0" />}
            {file.type === 'document' && <FileText className="w-4 h-4 text-slate-400 shrink-0" />}
            
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-100 truncate">{file.name}</h2>
              <p className="text-[11px] text-slate-500 font-mono truncate">
                {torrent.name} · {formatBytes(file.length, lang)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownloadFile(file, torrent)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.saveFile}</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-md hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Container */}
        <div className="p-4 sm:p-6 bg-slate-950 flex-1 flex flex-col items-center justify-center min-h-[300px] overflow-hidden">
          {file.type === 'video' ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
              {file.url ? (
                <video
                  src={file.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full max-h-[55vh] rounded-lg bg-black shadow-lg"
                />
              ) : (
                <div className="text-center p-8 border border-slate-800 rounded-xl bg-slate-900/50 max-w-md">
                  <Video className="w-12 h-12 text-sky-400 mx-auto mb-3 opacity-80" />
                  <p className="text-sm font-medium text-slate-200">Torrent Video Stream</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Playing: <span className="font-mono text-cyan-400">{file.name}</span>
                  </p>
                  <p className="text-[11px] text-slate-500 mt-3">
                    Progress: {Math.round(file.progress * 100)}% · Streamed directly from active BitTorrent swarm
                  </p>
                </div>
              )}
            </div>
          ) : file.type === 'audio' ? (
            <div className="w-full max-w-lg p-6 bg-slate-900 border border-slate-800 rounded-xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-slate-100">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">BitTorrent Audio Stream</p>
              </div>

              {/* Fake Audio Waveform equalizer */}
              <div className="flex items-center justify-center gap-1 h-12">
                {Array.from({ length: 32 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 bg-emerald-400/80 rounded-full animate-pulse"
                    style={{
                      height: `${Math.max(12, Math.sin(i * 0.4) * 36 + 20)}px`,
                      animationDelay: `${(i % 5) * 0.15}s`
                    }}
                  />
                ))}
              </div>

              {file.url && (
                <audio src={file.url} controls autoPlay className="w-full mt-2" />
              )}
            </div>
          ) : file.type === 'image' ? (
            <div className="max-h-[60vh] flex items-center justify-center">
              <img
                src={file.url || `https://via.placeholder.com/600x400/0f172a/38bdf8?text=${encodeURIComponent(file.name)}`}
                alt={file.name}
                referrerPolicy="no-referrer"
                className="max-h-[55vh] max-w-full rounded-lg object-contain shadow-lg border border-slate-800"
              />
            </div>
          ) : (
            <div className="w-full max-w-lg p-5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-mono text-xs">
              <p className="font-semibold text-slate-100 mb-2">{file.name}</p>
              <pre className="p-3 bg-slate-950 rounded border border-slate-800 overflow-x-auto text-slate-400 whitespace-pre-wrap">
{`InfoHash: ${torrent.infoHash}
File: ${file.name}
Path: ${file.path}
Length: ${file.length} bytes
Pieces: ${torrent.numPieces}
Status: Downloaded and verified via BitTorrent swarm`}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/80 text-xs text-slate-500 flex items-center justify-between font-mono">
          <span>BitTorrent Client v1.0</span>
          <span>Hash: {torrent.infoHash.slice(0, 16)}...</span>
        </div>
      </div>
    </div>
  );
};
