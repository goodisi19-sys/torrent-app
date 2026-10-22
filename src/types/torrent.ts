export type TorrentStatusType = 'downloading' | 'seeding' | 'paused' | 'metadata' | 'completed' | 'queued' | 'error';

export interface TorrentFileItem {
  id: string;
  name: string;
  path: string;
  length: number;
  progress: number; // 0..1
  downloaded: number;
  type: 'video' | 'audio' | 'image' | 'archive' | 'document' | 'other';
  mimeType?: string;
  blob?: Blob;
  url?: string;
}

export interface TorrentPeer {
  id: string;
  ip: string;
  port: number;
  client: string;
  downloadSpeed: number;
  uploadSpeed: number;
  progress: number;
  country: string;
}

export interface TorrentTracker {
  url: string;
  status: 'working' | 'updating' | 'error';
  peers: number;
  seeds: number;
  lastAnnounce?: string;
}

export interface TorrentItem {
  infoHash: string;
  name: string;
  progress: number; // 0..1
  downloadSpeed: number; // bytes/sec
  uploadSpeed: number; // bytes/sec
  totalBytes: number;
  downloadedBytes: number;
  uploadedBytes: number;
  seeds: number;
  peers: number;
  isPaused: boolean;
  status: TorrentStatusType;
  eta: number; // seconds remaining
  ratio: number;
  addedAt: number;
  magnetUri?: string;
  files: TorrentFileItem[];
  pieces: boolean[]; // true = downloaded
  pieceLength: number;
  numPieces: number;
  peerList: TorrentPeer[];
  trackers: TorrentTracker[];
  isRealEngine?: boolean;
}

export interface EngineSettings {
  maxDownloadSpeed: number; // 0 for unlimited
  maxUploadSpeed: number; // 0 for unlimited
  maxActiveDownloads: number;
  enableNotifications: boolean;
  autoPlayMedia: boolean;
  language: 'ru' | 'en';
}
