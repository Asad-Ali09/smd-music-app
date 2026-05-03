export type FavoriteTrack = {
  id: string;
  title: string;
  artist: string;
  duration: string;
  color: string;
  explicit?: boolean;
};

export const FAVORITE_TRACKS: FavoriteTrack[] = [
  { id: '1', title: 'Burning', artist: 'Podval Capella', duration: '3:24', color: '#8B4A17', explicit: true },
  { id: '2', title: 'Flashbacks', artist: 'Emika', duration: '4:12', color: '#3E5F80' },
  { id: '3', title: 'Renaissance', artist: 'Podval Capella', duration: '3:58', color: '#571A2C' },
  { id: '4', title: 'Ivår’s Revenge', artist: 'Danheim', duration: '2:47', color: '#4A6C2A' },
  { id: '5', title: 'Urgent Siege', artist: 'Damned Anthem', duration: '3:16', color: '#C78A2C' },
  { id: '6', title: 'Entangled', artist: 'Lorn', duration: '4:03', color: '#1E4954' },
  { id: '7', title: 'The Cycle Continues', artist: 'Mac Quayle', duration: '3:42', color: '#7B7C88' },
  { id: '8', title: 'Mother’s Daughter', artist: 'Miley Cyrus', duration: '3:39', color: '#A53D2B', explicit: true },
];