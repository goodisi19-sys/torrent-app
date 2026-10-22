import React from 'react';
import { formatBytes } from '../utils/formatters';

interface TorrentPieceMapProps {
  pieces: boolean[];
  numPieces: number;
  pieceLength: number;
  progress: number;
  infoHash: string;
}

export const TorrentPieceMap: React.FC<TorrentPieceMapProps> = ({
  pieces,
  numPieces,
  pieceLength,
  progress,
}) => {
  const verifiedCount = pieces.filter(Boolean).length;
  const currentChunkIndex = Math.min(numPieces - 1, Math.floor(progress * numPieces));

  return (
    <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800">
      <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-200">Piece Distribution</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono tabular-nums text-emerald-400">
            {verifiedCount} / {numPieces} ({Math.round(progress * 100)}%)
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span>
            Verified
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-cyan-400 animate-pulse inline-block"></span>
            Transferring
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-xs bg-slate-800 inline-block"></span>
            Pending
          </span>
        </div>
      </div>

      {/* Grid of pieces */}
      <div className="grid grid-cols-16 sm:grid-cols-24 md:grid-cols-32 lg:grid-cols-48 gap-1 p-2 bg-slate-900/60 rounded border border-slate-800/60 max-h-36 overflow-y-auto">
        {Array.from({ length: numPieces }).map((_, idx) => {
          const isDone = pieces[idx];
          const isCurrent = !isDone && idx === currentChunkIndex;

          return (
            <div
              key={idx}
              title={`Piece #${idx + 1} (${formatBytes(pieceLength)}): ${isDone ? 'Verified' : isCurrent ? 'Downloading' : 'Pending'}`}
              className={`h-3 rounded-xs transition-colors duration-150 ${
                isDone
                  ? 'bg-emerald-500/90 hover:bg-emerald-400'
                  : isCurrent
                  ? 'bg-cyan-400 animate-pulse hover:bg-cyan-300'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Piece Size: {formatBytes(pieceLength)}</span>
        <span>SHA-1 piece verification active</span>
      </div>
    </div>
  );
};
