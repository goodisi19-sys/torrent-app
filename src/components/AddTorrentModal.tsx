import React, { useState, useRef } from 'react';
import { X, Magnet, Upload, Sparkles, Check, AlertCircle } from 'lucide-react';
import { translations, Language } from '../locales/i18n';
import { DEMO_TORRENTS, DemoTorrent } from '../services/demoTorrents';
import { formatBytes } from '../utils/formatters';

interface AddTorrentModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onAddMagnet: (magnet: string) => void;
  onAddTorrentBytes: (bytes: ArrayBuffer, name?: string) => void;
  onAddDemo: (demo: DemoTorrent) => void;
}

export const AddTorrentModal: React.FC<AddTorrentModalProps> = ({
  isOpen,
  onClose,
  lang,
  onAddMagnet,
  onAddTorrentBytes,
  onAddDemo,
}) => {
  const t = translations[lang];
  const [magnetInput, setMagnetInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleConfirmMagnet = () => {
    const trimmed = magnetInput.trim();
    if (!trimmed) {
      setError(lang === 'ru' ? 'Введите ссылку magnet' : 'Please provide a magnet link');
      return;
    }
    if (!trimmed.toLowerCase().startsWith('magnet:?xt=urn:btih:')) {
      setError(lang === 'ru' ? 'Неверный формат ссылки. Должна начинаться с magnet:?xt=urn:btih:' : 'Invalid format. Must begin with magnet:?xt=urn:btih:');
      return;
    }

    try {
      onAddMagnet(trimmed);
      setMagnetInput('');
      setError(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Error parsing magnet');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processTorrentFile(file);
  };

  const processTorrentFile = (file: File) => {
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        onAddTorrentBytes(reader.result, file.name.replace(/\.torrent$/i, ''));
        onClose();
      }
    };
    reader.onerror = () => {
      setError(lang === 'ru' ? 'Не удалось прочитать файл' : 'Could not read file');
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processTorrentFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Magnet className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-semibold text-slate-100">{t.addTorrent}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Magnet Link Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-300 block">
              {t.magnetLink}
            </label>
            <div className="relative">
              <input
                type="text"
                value={magnetInput}
                onChange={(e) => {
                  setMagnetInput(e.target.value);
                  if (error) setError(null);
                }}
                placeholder={t.magnetPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
              />
            </div>
          </div>

          {/* File Picker / Dropzone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/70'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".torrent,application/x-bittorrent"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="w-6 h-6 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-medium text-slate-200">{t.chooseTorrentFile}</p>
            <p className="text-[11px] text-slate-500 mt-1">{t.dropTorrentFile}</p>
          </div>

          {/* Quick Demo Torrents */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.demoTorrentsTitle}</span>
              <span className="text-[10px] text-slate-500 hidden sm:inline">({t.demoTorrentsDesc})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEMO_TORRENTS.slice(0, 4).map((demo) => (
                <button
                  key={demo.id}
                  onClick={() => {
                    onAddDemo(demo);
                    onClose();
                  }}
                  className="p-2.5 rounded-lg border border-slate-800/80 bg-slate-950/40 hover:bg-slate-800/60 hover:border-slate-700 text-left transition-all group"
                >
                  <p className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400 truncate">
                    {demo.title}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                    {demo.category} · {formatBytes(demo.size, lang)}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleConfirmMagnet}
            disabled={!magnetInput.trim()}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 rounded-lg transition-all shadow-sm"
          >
            {t.download}
          </button>
        </div>

      </div>
    </div>
  );
};
