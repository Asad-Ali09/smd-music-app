export type FavoriteAlbumTrack = {
  id: string;
  title: string;
  artist: string;
  explicit?: boolean;
  isCurrent?: boolean;
};

export type FavoriteAlbum = {
  id: string;
  title: string;
  artist: string;
  year: string;
  color: string;
  explicit?: boolean;
  tracks: FavoriteAlbumTrack[];
};

export const FAVORITE_ALBUMS: FavoriteAlbum[] = [
  {
    id: '1',
    title: 'Flower Power',
    artist: 'Ray Charles',
    year: '2018',
    color: '#5D9290',
    tracks: [
      { id: '1-1', title: 'Blue River', artist: 'Ray Charles' },
      { id: '1-2', title: 'Wild Honey', artist: 'Ray Charles', isCurrent: true },
      { id: '1-3', title: 'Run Back Home', artist: 'Ray Charles' },
      { id: '1-4', title: 'Late Window', artist: 'Ray Charles' },
    ],
  },
  {
    id: '2',
    title: 'This Is Not A Test',
    artist: 'TobyMac',
    year: '2018',
    color: '#B8672D',
    explicit: true,
    tracks: [
      { id: '2-1', title: 'Beyond Me', artist: 'TobyMac' },
      { id: '2-2', title: 'Love Feels Like', artist: 'TobyMac', explicit: true },
      { id: '2-3', title: 'Move', artist: 'TobyMac' },
      { id: '2-4', title: 'The First Time', artist: 'TobyMac' },
    ],
  },
  {
    id: '3',
    title: 'SHE IS COMING',
    artist: 'Miley Cyrus',
    year: '2018',
    color: '#BE3600',
    tracks: [
      { id: '3-1', title: 'Mother’s Daughter', artist: 'Miley Cyrus', explicit: true },
      { id: '3-2', title: 'Unholy', artist: 'Miley Cyrus' },
      { id: '3-3', title: 'Cattitude', artist: 'Miley Cyrus', explicit: true },
      { id: '3-4', title: 'The Most', artist: 'Miley Cyrus' },
    ],
  },
  {
    id: '4',
    title: 'Danheim',
    artist: 'Podval Capella',
    year: '2018',
    color: '#498C00',
    tracks: [
      { id: '4-1', title: 'Nordhjem', artist: 'Podval Capella' },
      { id: '4-2', title: 'Skapanir', artist: 'Podval Capella' },
      { id: '4-3', title: 'Berserkir', artist: 'Podval Capella' },
      { id: '4-4', title: 'Mannavegr', artist: 'Podval Capella', isCurrent: true },
    ],
  },
  {
    id: '5',
    title: 'Wunder King',
    artist: 'Элджей',
    year: '2018',
    color: '#D97EBE',
    tracks: [
      { id: '5-1', title: 'Burning', artist: 'Podval Capella', explicit: true },
      { id: '5-2', title: 'Flashbacks', artist: 'Emika' },
      { id: '5-3', title: 'Renaissance', artist: 'Podval Capella', isCurrent: true },
      { id: '5-4', title: 'Ivår’s Revenge', artist: 'Danheim' },
      { id: '5-5', title: 'Urgent Siege', artist: 'Damned Anthem' },
    ],
  },
  {
    id: '6',
    title: 'VELVET: Side A',
    artist: 'Adam Lambert',
    year: '2018',
    color: '#BEB4AA',
    explicit: true,
    tracks: [
      { id: '6-1', title: 'The Light', artist: 'Adam Lambert' },
      { id: '6-2', title: 'Velvet', artist: 'Adam Lambert' },
      { id: '6-3', title: 'Superpower', artist: 'Adam Lambert', explicit: true },
      { id: '6-4', title: 'Closer to You', artist: 'Adam Lambert' },
    ],
  },
  {
    id: '7',
    title: 'Urgent Siege',
    artist: 'Damned Anthem',
    year: '2018',
    color: '#A23554',
    tracks: [
      { id: '7-1', title: 'Urgent Siege', artist: 'Damned Anthem', isCurrent: true },
      { id: '7-2', title: 'Cold Corridor', artist: 'Damned Anthem' },
      { id: '7-3', title: 'Ash Room', artist: 'Damned Anthem' },
      { id: '7-4', title: 'No Return', artist: 'Damned Anthem' },
    ],
  },
];

export function getFavoriteAlbum(id: string) {
  return FAVORITE_ALBUMS.find((album) => album.id === id) ?? null;
}