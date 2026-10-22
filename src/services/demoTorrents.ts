export interface DemoTorrent {
  id: string;
  title: string;
  category: 'Movie' | 'Linux' | 'Music' | 'Blender';
  size: number;
  description: string;
  magnet: string;
  files: Array<{
    name: string;
    path: string;
    length: number;
    type: 'video' | 'audio' | 'image' | 'archive' | 'document' | 'other';
    sampleUrl?: string;
  }>;
}

export const DEMO_TORRENTS: DemoTorrent[] = [
  {
    id: 'sintel',
    title: 'Sintel — 4K Open Movie (Durian Project)',
    category: 'Movie',
    size: 650 * 1024 * 1024, // 650 MB
    description: 'Blender Foundation open animation movie directed by Colin Levy.',
    magnet: 'magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
    files: [
      {
        name: 'sintel_trailer.mp4',
        path: 'Sintel/sintel_trailer.mp4',
        length: 420 * 1024 * 1024,
        type: 'video',
        sampleUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      },
      {
        name: 'poster_artwork.jpg',
        path: 'Sintel/poster_artwork.jpg',
        length: 2 * 1024 * 1024,
        type: 'image',
      },
      {
        name: 'subtitles_en.srt',
        path: 'Sintel/subtitles_en.srt',
        length: 45 * 1024,
        type: 'document',
      },
      {
        name: 'creative_commons_license.txt',
        path: 'Sintel/creative_commons_license.txt',
        length: 12 * 1024,
        type: 'document',
      }
    ]
  },
  {
    id: 'big-buck-bunny',
    title: 'Big Buck Bunny (1080p 60fps Peach Project)',
    category: 'Blender',
    size: 276 * 1024 * 1024, // 276 MB
    description: 'Famous Peach Open Movie project comedy short animation.',
    magnet: 'magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
    files: [
      {
        name: 'big_buck_bunny_1080p.mp4',
        path: 'Big_Buck_Bunny/big_buck_bunny_1080p.mp4',
        length: 275 * 1024 * 1024,
        type: 'video',
        sampleUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      },
      {
        name: 'production_notes.nfo',
        path: 'Big_Buck_Bunny/production_notes.nfo',
        length: 18 * 1024,
        type: 'document',
      }
    ]
  },
  {
    id: 'tears-of-steel',
    title: 'Tears of Steel (4K Sci-Fi Mango Project)',
    category: 'Movie',
    size: 890 * 1024 * 1024,
    description: 'Open visual effects sci-fi project set in a dystopian future Amsterdam.',
    magnet: 'magnet:?xt=urn:btih:2b124f9f000b170427847e198f820ceb450ff574&dn=Tears+of+Steel&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&tr=wss%3A%2F%2Ftracker.btorrent.xyz',
    files: [
      {
        name: 'tears_of_steel_1080p.mp4',
        path: 'Tears_of_Steel/tears_of_steel_1080p.mp4',
        length: 880 * 1024 * 1024,
        type: 'video',
        sampleUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      },
      {
        name: 'vfx_breakdown.pdf',
        path: 'Tears_of_Steel/vfx_breakdown.pdf',
        length: 10 * 1024 * 1024,
        type: 'document',
      }
    ]
  },
  {
    id: 'ubuntu-iso',
    title: 'Ubuntu 24.04 LTS Desktop (64-bit ISO)',
    category: 'Linux',
    size: 4200 * 1024 * 1024, // 4.2 GB
    description: 'Official Canonical Ubuntu Linux 24.04 LTS (Noble Numbat).',
    magnet: 'magnet:?xt=urn:btih:19d67562095f5904d9c0f99479cb206b747fe0aa&dn=ubuntu-24.04-desktop-amd64.iso&tr=https%3A%2F%2Ftorrent.ubuntu.com%2Fannounce',
    files: [
      {
        name: 'ubuntu-24.04-desktop-amd64.iso',
        path: 'ubuntu-24.04-desktop-amd64.iso',
        length: 4190 * 1024 * 1024,
        type: 'archive',
      },
      {
        name: 'SHA256SUMS',
        path: 'SHA256SUMS',
        length: 180,
        type: 'document',
      },
      {
        name: 'SHA256SUMS.gpg',
        path: 'SHA256SUMS.gpg',
        length: 833,
        type: 'document',
      }
    ]
  },
  {
    id: 'fma-synthwave',
    title: 'Neon Odyssey — Synthwave OST Album (FLAC + MP3)',
    category: 'Music',
    size: 145 * 1024 * 1024,
    description: 'High-energy retro 80s synthwave music released under Creative Commons CC-BY-SA.',
    magnet: 'magnet:?xt=urn:btih:6a9759bffd5c0af65319979fb7832189f4f3c35d&dn=Neon+Odyssey+OST&tr=wss%3A%2F%2Ftracker.openwebtorrent.com',
    files: [
      {
        name: '01_cyber_highway.mp3',
        path: 'Neon_Odyssey/01_cyber_highway.mp3',
        length: 22 * 1024 * 1024,
        type: 'audio',
      },
      {
        name: '02_neon_nightfall.mp3',
        path: 'Neon_Odyssey/02_neon_nightfall.mp3',
        length: 26 * 1024 * 1024,
        type: 'audio',
      },
      {
        name: '03_grid_runner.mp3',
        path: 'Neon_Odyssey/03_grid_runner.mp3',
        length: 31 * 1024 * 1024,
        type: 'audio',
      },
      {
        name: 'album_cover.png',
        path: 'Neon_Odyssey/album_cover.png',
        length: 4 * 1024 * 1024,
        type: 'image',
      }
    ]
  }
];
