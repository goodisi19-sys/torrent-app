/**
 * Format bytes per second into human-readable transfer rate.
 * Matches the Kotlin format logic:
 *   mb >= 1.0 -> "%.1f MB/s"
 *   kb >= 1.0 -> "%.0f KB/s"
 *   else -> "$bytes B/s"
 */
export function formatSpeed(bytesPerSec: number, lang: 'en' | 'ru' = 'en'): string {
  if (!bytesPerSec || bytesPerSec <= 0) {
    return lang === 'ru' ? '0 Б/с' : '0 B/s';
  }
  const kb = bytesPerSec / 1024.0;
  const mb = kb / 1024.0;
  const gb = mb / 1024.0;

  if (gb >= 1.0) {
    return `${gb.toFixed(2)} ${lang === 'ru' ? 'ГБ/с' : 'GB/s'}`;
  }
  if (mb >= 1.0) {
    return `${mb.toFixed(1)} ${lang === 'ru' ? 'МБ/с' : 'MB/s'}`;
  }
  if (kb >= 1.0) {
    return `${Math.round(kb)} ${lang === 'ru' ? 'КБ/с' : 'KB/s'}`;
  }
  return `${Math.round(bytesPerSec)} ${lang === 'ru' ? 'Б/с' : 'B/s'}`;
}

export function formatBytes(bytes: number, lang: 'en' | 'ru' = 'en'): string {
  if (!bytes || bytes <= 0) return '0 B';
  const units = lang === 'ru' 
    ? ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'] 
    : ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const clampedIndex = Math.min(i, units.length - 1);
  const value = bytes / Math.pow(1024, clampedIndex);
  return `${clampedIndex === 0 ? Math.round(value) : value.toFixed(1)} ${units[clampedIndex]}`;
}

export function formatEta(seconds: number, lang: 'en' | 'ru' = 'en'): string {
  if (!seconds || seconds <= 0 || !isFinite(seconds)) {
    return lang === 'ru' ? '∞' : '∞';
  }
  if (seconds < 60) {
    return `${Math.round(seconds)} ${lang === 'ru' ? 'с' : 's'}`;
  }
  const mins = Math.floor(seconds / 60);
  const remainingSecs = Math.round(seconds % 60);
  if (mins < 60) {
    return `${mins}${lang === 'ru' ? 'м' : 'm'} ${remainingSecs}${lang === 'ru' ? 'с' : 's'}`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours < 24) {
    return `${hours}${lang === 'ru' ? 'ч' : 'h'} ${remainingMins}${lang === 'ru' ? 'м' : 'm'}`;
  }
  const days = Math.floor(hours / 24);
  return `${days}${lang === 'ru' ? 'д' : 'd'}`;
}

export function getFileType(fileName: string): 'video' | 'audio' | 'image' | 'archive' | 'document' | 'other' {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (['mp4', 'mkv', 'webm', 'avi', 'mov', 'flv', 'wmv', 'm4v'].includes(ext)) {
    return 'video';
  }
  if (['mp3', 'flac', 'ogg', 'wav', 'm4a', 'aac', 'opus', 'wma'].includes(ext)) {
    return 'audio';
  }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'avif'].includes(ext)) {
    return 'image';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'iso', 'bin'].includes(ext)) {
    return 'archive';
  }
  if (['pdf', 'txt', 'nfo', 'srt', 'vtt', 'sub', 'doc', 'docx', 'md'].includes(ext)) {
    return 'document';
  }
  return 'other';
}
