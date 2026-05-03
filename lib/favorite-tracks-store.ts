import {
    collection,
    deleteDoc,
    doc,
    onSnapshot,
    orderBy,
    query,
    setDoc,
    writeBatch,
    type Unsubscribe,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

export type FavoriteTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  durationSec: number;
  color: string;
  playlistName: string;
  playlistId: string;
  bookmarkedAt: number;
};

export type FavoriteTrackInput = Omit<FavoriteTrack, 'bookmarkedAt'>;

type FavoriteTrackSource = {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  duration: number;
  color?: string;
  playlistName?: string;
  playlistId?: string;
};

function favoriteTracksCollection(userId: string) {
  return collection(db, 'users', userId, 'favoriteTracks');
}

export function createFavoriteTrackInput(track: FavoriteTrackSource): FavoriteTrackInput {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    artworkUrl: track.artworkUrl ?? '',
    durationSec: track.duration,
    color: track.color ?? '#1DB954',
    playlistName: track.playlistName ?? '',
    playlistId: track.playlistId ?? '',
  };
}

export async function saveFavoriteTrack(userId: string, track: FavoriteTrackInput) {
  await setDoc(doc(favoriteTracksCollection(userId), track.id), {
    ...track,
    bookmarkedAt: Date.now(),
  });
}

export async function removeFavoriteTrack(userId: string, trackId: string) {
  await deleteDoc(doc(favoriteTracksCollection(userId), trackId));
}

export async function reorderFavoriteTracks(userId: string, tracks: FavoriteTrack[]) {
  const batch = writeBatch(db);
  const now = Date.now();
  tracks.forEach((track, index) => {
    batch.update(doc(favoriteTracksCollection(userId), track.id), {
      bookmarkedAt: now - index,
    });
  });
  await batch.commit();
}

export function subscribeToFavoriteTracks(
  userId: string,
  onChange: (tracks: FavoriteTrack[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const favoriteTracksQuery = query(
    favoriteTracksCollection(userId),
    orderBy('bookmarkedAt', 'desc')
  );

  return onSnapshot(
    favoriteTracksQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((documentSnapshot) => {
          const data = documentSnapshot.data() as FavoriteTrack;

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