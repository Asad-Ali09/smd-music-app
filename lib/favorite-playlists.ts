import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    type Unsubscribe,
} from 'firebase/firestore';

import { type AudiusPlaylist } from '@/lib/audius';
import { db } from '@/lib/firebase';

export type FavoritePlaylist = {
  id: string;
  playlistName: string;
  description: string;
  artworkUrl: string;
  color: string;
  accent: string;
  meta: string;
  trackCount: number;
  totalPlayCount: number;
  bookmarkedAt: number;
};

export type FavoritePlaylistAppearance = {
  color: string;
  accent: string;
};

export type FavoritePlaylistInput = Omit<FavoritePlaylist, 'bookmarkedAt'>;

function favoritePlaylistsCollection(userId: string) {
  return collection(db, 'users', userId, 'favoritePlaylists');
}

export function buildFavoritePlaylistMeta(
  playlist: Pick<AudiusPlaylist, 'track_count' | 'total_play_count'>
) {
  const parts: string[] = [];

  if (playlist.track_count) {
    parts.push(`${playlist.track_count} tracks`);
  }

  if (playlist.total_play_count) {
    const plays =
      playlist.total_play_count >= 1000
        ? `${(playlist.total_play_count / 1000).toFixed(1)}k plays`
        : `${playlist.total_play_count} plays`;
    parts.push(plays);
  }

  return parts.join(' • ');
}

export function createFavoritePlaylistInput(
  playlist: AudiusPlaylist,
  appearance: FavoritePlaylistAppearance
): FavoritePlaylistInput {
  return {
    id: playlist.id,
    playlistName: playlist.playlist_name,
    description: playlist.description ?? '',
    artworkUrl: playlist.artwork?.['480x480'] ?? '',
    color: appearance.color,
    accent: appearance.accent,
    meta: buildFavoritePlaylistMeta(playlist),
    trackCount: playlist.track_count ?? 0,
    totalPlayCount: playlist.total_play_count ?? 0,
  };
}

export async function saveFavoritePlaylist(userId: string, playlist: FavoritePlaylistInput) {
  await setDoc(doc(favoritePlaylistsCollection(userId), playlist.id), {
    ...playlist,
    bookmarkedAt: Date.now(),
  });
}

export async function removeFavoritePlaylist(userId: string, playlistId: string) {
  await deleteDoc(doc(favoritePlaylistsCollection(userId), playlistId));
}

export function subscribeToFavoritePlaylists(
  userId: string,
  onChange: (playlists: FavoritePlaylist[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const favoritePlaylistsQuery = query(
    favoritePlaylistsCollection(userId),
    orderBy('bookmarkedAt', 'desc')
  );

  return onSnapshot(
    favoritePlaylistsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((documentSnapshot) => {
          const data = documentSnapshot.data() as FavoritePlaylist;

          return {
            ...data,
            id: documentSnapshot.id,
          };
        })
      );
    },
    (error) => onError?.(error)
  );
}