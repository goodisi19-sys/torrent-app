/**
 * Resilient client-side Bencode decoder & parser for .torrent files.
 * Supports strings, integers, lists, dictionaries, binary byte chunks,
 * and computing infoHash via Web Crypto SHA-1.
 */

export interface ParsedTorrentData {
  name: string;
  infoHash: string;
  totalLength: number;
  pieceLength: number;
  piecesCount: number;
  announce?: string;
  announceList?: string[];
  files: Array<{
    name: string;
    path: string;
    length: number;
  }>;
  createdDate?: Date;
  comment?: string;
}

export class BencodeDecoder {
  private buffer: Uint8Array;
  private pos = 0;

  constructor(data: Uint8Array | ArrayBuffer) {
    this.buffer = data instanceof Uint8Array ? data : new Uint8Array(data);
  }

  public decode(): any {
    this.pos = 0;
    return this.next();
  }

  private next(): any {
    if (this.pos >= this.buffer.length) {
      throw new Error('Unexpected end of bencode buffer');
    }
    const byte = this.buffer[this.pos];

    if (byte === 0x69) { // 'i' -> integer
      return this.decodeInt();
    } else if (byte === 0x6c) { // 'l' -> list
      return this.decodeList();
    } else if (byte === 0x64) { // 'd' -> dictionary
      return this.decodeDict();
    } else if (byte >= 0x30 && byte <= 0x39) { // '0'-'9' -> string
      return this.decodeString();
    } else {
      throw new Error(`Unexpected token 0x${byte.toString(16)} at position ${this.pos}`);
    }
  }

  private decodeInt(): number {
    this.pos++; // skip 'i'
    let end = this.pos;
    while (end < this.buffer.length && this.buffer[end] !== 0x65) { // 'e'
      end++;
    }
    const str = new TextDecoder('ascii').decode(this.buffer.subarray(this.pos, end));
    this.pos = end + 1; // skip 'e'
    return parseInt(str, 10);
  }

  private decodeString(): Uint8Array {
    let colonPos = this.pos;
    while (colonPos < this.buffer.length && this.buffer[colonPos] !== 0x3a) { // ':'
      colonPos++;
    }
    const lenStr = new TextDecoder('ascii').decode(this.buffer.subarray(this.pos, colonPos));
    const len = parseInt(lenStr, 10);
    this.pos = colonPos + 1; // skip ':'
    const result = this.buffer.subarray(this.pos, this.pos + len);
    this.pos += len;
    return result;
  }

  private decodeList(): any[] {
    this.pos++; // skip 'l'
    const list: any[] = [];
    while (this.pos < this.buffer.length && this.buffer[this.pos] !== 0x65) { // 'e'
      list.push(this.next());
    }
    this.pos++; // skip 'e'
    return list;
  }

  private decodeDict(): Record<string, any> {
    this.pos++; // skip 'd'
    const dict: Record<string, any> = {};
    while (this.pos < this.buffer.length && this.buffer[this.pos] !== 0x65) { // 'e'
      const keyBytes = this.decodeString();
      const key = new TextDecoder('utf-8').decode(keyBytes);
      const val = this.next();
      dict[key] = val;
    }
    this.pos++; // skip 'e'
    return dict;
  }
}

/**
 * Extracts raw slice of the "info" dictionary for exact SHA-1 computation
 */
function extractInfoSlice(buffer: Uint8Array): Uint8Array | null {
  const infoKey = new TextEncoder().encode('4:info');
  let index = -1;
  for (let i = 0; i <= buffer.length - infoKey.length; i++) {
    let match = true;
    for (let j = 0; j < infoKey.length; j++) {
      if (buffer[i + j] !== infoKey[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      index = i + infoKey.length;
      break;
    }
  }

  if (index === -1) return null;

  // Now scan the info bencode dictionary until its matching 'e'
  let depth = 0;
  let p = index;
  while (p < buffer.length) {
    const b = buffer[p];
    if (b === 0x64 || b === 0x6c) { // 'd' or 'l'
      depth++;
      p++;
    } else if (b === 0x69) { // 'i'
      p++;
      while (p < buffer.length && buffer[p] !== 0x65) p++;
      p++; // skip 'e'
    } else if (b >= 0x30 && b <= 0x39) { // string
      let colon = p;
      while (colon < buffer.length && buffer[colon] !== 0x3a) colon++;
      const lenStr = new TextDecoder('ascii').decode(buffer.subarray(p, colon));
      const len = parseInt(lenStr, 10);
      p = colon + 1 + len;
    } else if (b === 0x65) { // 'e'
      depth--;
      p++;
      if (depth === 0) {
        return buffer.subarray(index, p);
      }
    } else {
      p++;
    }
  }
  return null;
}

export async function parseTorrentFile(arrayBuffer: ArrayBuffer): Promise<ParsedTorrentData> {
  const uint8 = new Uint8Array(arrayBuffer);
  const decoder = new BencodeDecoder(uint8);
  const decoded = decoder.decode();

  const info = decoded.info;
  if (!info) {
    throw new Error('Invalid .torrent file: missing "info" section');
  }

  // Convert raw strings/bytes
  const utf8 = (val: any): string => {
    if (val instanceof Uint8Array) return new TextDecoder('utf-8').decode(val);
    return String(val || '');
  };

  const name = utf8(info['name.utf-8'] || info.name) || 'Unnamed Torrent';
  const pieceLength = info['piece length'] || 262144;
  const piecesBytes = info.pieces instanceof Uint8Array ? info.pieces : new Uint8Array(0);
  const piecesCount = Math.floor(piecesBytes.length / 20) || 1;

  let totalLength = 0;
  const files: Array<{ name: string; path: string; length: number }> = [];

  if (info.files && Array.isArray(info.files)) {
    // Multi-file torrent
    for (const f of info.files) {
      const fLength = f.length || 0;
      totalLength += fLength;
      const pathParts = (f['path.utf-8'] || f.path || []).map((p: any) => utf8(p));
      const fPath = pathParts.join('/');
      const fName = pathParts[pathParts.length - 1] || 'file';
      files.push({
        name: fName,
        path: fPath,
        length: fLength,
      });
    }
  } else {
    // Single-file torrent
    totalLength = info.length || 0;
    files.push({
      name,
      path: name,
      length: totalLength,
    });
  }

  // Compute infoHash
  let infoHash = '';
  try {
    const rawInfoSlice = extractInfoSlice(uint8);
    if (rawInfoSlice && crypto.subtle) {
      const copy = new ArrayBuffer(rawInfoSlice.byteLength);
      new Uint8Array(copy).set(rawInfoSlice);
      const hashBuffer = await crypto.subtle.digest('SHA-1', copy);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      infoHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('Failed to compute crypto SHA-1 infoHash', err);
  }

  if (!infoHash) {
    // Fallback pseudo hash
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = ((hash << 5) - hash) + name.charCodeAt(i);
      hash |= 0;
    }
    infoHash = Math.abs(hash).toString(16).padStart(40, 'a');
  }

  const announce = utf8(decoded.announce);
  const announceList: string[] = [];
  if (announce) announceList.push(announce);
  if (Array.isArray(decoded['announce-list'])) {
    for (const sub of decoded['announce-list']) {
      if (Array.isArray(sub)) {
        for (const url of sub) {
          const str = utf8(url);
          if (str && !announceList.includes(str)) announceList.push(str);
        }
      }
    }
  }

  return {
    name,
    infoHash: infoHash.toLowerCase(),
    totalLength,
    pieceLength,
    piecesCount,
    announce: announceList[0],
    announceList,
    files,
    createdDate: decoded['creation date'] ? new Date(decoded['creation date'] * 1000) : undefined,
    comment: utf8(decoded.comment),
  };
}

export function parseMagnetUri(magnet: string): { infoHash: string; name: string; trackers: string[] } {
  let infoHash = '';
  let name = 'Downloading metadata...';
  const trackers: string[] = [];

  const trimmed = magnet.trim();
  if (!trimmed.startsWith('magnet:?')) {
    throw new Error('Invalid magnet link: must start with magnet:?');
  }

  const params = new URLSearchParams(trimmed.slice(8));
  const xt = params.get('xt');
  if (xt && xt.startsWith('urn:btih:')) {
    infoHash = xt.substring(9).toLowerCase();
  }

  const dn = params.get('dn');
  if (dn) {
    name = decodeURIComponent(dn);
  }

  const trs = params.getAll('tr');
  for (const tr of trs) {
    trackers.push(decodeURIComponent(tr));
  }

  if (!infoHash) {
    // Check if whole xt was given
    throw new Error('Magnet link missing valid urn:btih parameter');
  }

  return {
    infoHash,
    name,
    trackers,
  };
}
