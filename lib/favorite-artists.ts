export type FavoriteArtist = {
  id: string;
  name: string;
  trackCount: number;
  albumCount: number;
  color: string;
  accent: string;
  releases: FavoriteArtistRelease[];
};

export type FavoriteArtistRelease = {
  id: string;
  title: string;
  artist: string;
  color: string;
  explicit?: boolean;
};

export const FAVORITE_ARTISTS: FavoriteArtist[] = [
  {
    id: '1',
    name: 'Lorn',
    trackCount: 843,
    albumCount: 23,
    color: '#9DC37B',
    accent: '#5D1121',
    releases: [
      { id: '1-1', title: 'Urgent Siege', artist: 'Damned Anthem', color: '#FDBB37', explicit: true },
      { id: '1-2', title: 'Cold Horizon', artist: 'Lorn', color: '#58CF81' },
      { id: '1-3', title: 'Black Ice', artist: 'Lorn', color: '#67A0D9' },
    ],
  },
  {
    id: '2',
    name: 'Danheim',
    trackCount: 843,
    albumCount: 3,
    color: '#E1E6EB',
    accent: '#173245',
    releases: [
      { id: '2-1', title: 'Mannavegr', artist: 'Danheim', color: '#B8C2CF' },
      { id: '2-2', title: 'Skapanir', artist: 'Danheim', color: '#698F56' },
    ],
  },
  {
    id: '3',
    name: 'Brand X Music',
    trackCount: 843,
    albumCount: 35,
    color: '#04505E',
    accent: '#291525',
    releases: [
      { id: '3-1', title: 'Afterlight', artist: 'Brand X Music', color: '#04839B' },
      { id: '3-2', title: 'Vast Machine', artist: 'Brand X Music', color: '#8F5FE8' },
    ],
  },
  {
    id: '4',
    name: 'Damned Anthem',
    trackCount: 843,
    albumCount: 1,
    color: '#FFE9C7',
    accent: '#533035',
    releases: [
      { id: '4-1', title: 'Urgent Siege', artist: 'Damned Anthem', color: '#FCB93C' },
      { id: '4-2', title: 'No Return', artist: 'Damned Anthem', color: '#CC6D4C' },
    ],
  },
  {
    id: '5',
    name: 'BONES',
    trackCount: 843,
    albumCount: 5,
    color: '#11191C',
    accent: '#311019',
    releases: [
      { id: '5-1', title: 'DeadEnd', artist: 'BONES', color: '#48535A' },
      { id: '5-2', title: 'Buried', artist: 'BONES', color: '#7B7B7B', explicit: true },
    ],
  },
  {
    id: '6',
    name: 'Epic North',
    trackCount: 843,
    albumCount: 17,
    color: '#836F49',
    accent: '#3B1522',
    releases: [
      { id: '6-1', title: 'Beyond Ruin', artist: 'Epic North', color: '#8A7342' },
      { id: '6-2', title: 'Signal Fire', artist: 'Epic North', color: '#E39A56' },
    ],
  },
  {
    id: '7',
    name: 'Ruelle',
    trackCount: 843,
    albumCount: 12,
    color: '#B66D52',
    accent: '#4A1020',
    releases: [
      { id: '7-1', title: 'Abyss', artist: 'Ruelle', color: '#BE7656' },
      { id: '7-2', title: 'Madness', artist: 'Ruelle', color: '#DFB58A' },
    ],
  },
];

export function getFavoriteArtist(id: string) {
  return FAVORITE_ARTISTS.find((artist) => artist.id === id) ?? null;
}