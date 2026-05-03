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

import { db } from '@/lib/firebase';

export type FavoriteAlbumSource = 'audius' | 'local';

export type FavoriteAlbum = {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  description: string;
  color: string;
  accent: string;
  meta: string;
  trackCount: number;
  totalPlayCount: number;
  explicit: boolean;
  source: FavoriteAlbumSource;
  bookmarkedAt: number;
};

export type FavoriteAlbumInput = Omit<FavoriteAlbum, 'bookmarkedAt'>;

function favoriteAlbumsCollection(userId: string) {
  return collection(db, 'users', userId, 'favoriteAlbums');
}

export function buildFavoriteAlbumMeta({
  trackCount,
  totalPlayCount,
  year,
}: {
  trackCount?: number;
  totalPlayCount?: number;
  year?: string;
}) {
  const parts: string[] = [];

  if (year) {
    parts.push(year);
  }

  if (trackCount) {
    parts.push(`${trackCount} tracks`);
  }

  if (totalPlayCount) {
    const plays =
      totalPlayCount >= 1000
        ? `${(totalPlayCount / 1000).toFixed(1)}k plays`
        : `${totalPlayCount} plays`;
    parts.push(plays);
  }

  return parts.join(' • ');
}

export async function saveFavoriteAlbum(userId: string, album: FavoriteAlbumInput) {
  await setDoc(doc(favoriteAlbumsCollection(userId), album.id), {
    ...album,
    bookmarkedAt: Date.now(),
  });
}

export async function removeFavoriteAlbum(userId: string, albumId: string) {
  await deleteDoc(doc(favoriteAlbumsCollection(userId), albumId));
}

export function subscribeToFavoriteAlbums(
  userId: string,
  onChange: (albums: FavoriteAlbum[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const favoriteAlbumsQuery = query(
    favoriteAlbumsCollection(userId),
    orderBy('bookmarkedAt', 'desc')
  );

  return onSnapshot(
    favoriteAlbumsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((documentSnapshot) => {
          const data = documentSnapshot.data() as FavoriteAlbum;

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