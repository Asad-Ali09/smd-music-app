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

import { type AudiusUser } from '@/lib/audius';
import { db } from '@/lib/firebase';

export type FavoriteArtist = {
  id: string;
  name: string;
  handle: string;
  description: string;
  avatarUrl: string;
  coverUrl: string;
  color: string;
  accent: string;
  followerCount: number;
  trackCount: number;
  albumCount: number;
  playlistCount: number;
  verified: boolean;
  location: string;
  website: string;
  bookmarkedAt: number;
};

export type FavoriteArtistInput = Omit<FavoriteArtist, 'bookmarkedAt'>;

type FavoriteArtistAppearance = Pick<FavoriteArtistInput, 'color' | 'accent'>;

const ARTIST_APPEARANCES: FavoriteArtistAppearance[] = [
  { color: '#1B6056', accent: '#0E3936' },
  { color: '#8E4E2B', accent: '#4E2614' },
  { color: '#4568B1', accent: '#1D315A' },
  { color: '#6C4BA7', accent: '#2F1E4E' },
  { color: '#9C8A2E', accent: '#544A14' },
];

function favoriteArtistsCollection(userId: string) {
  return collection(db, 'users', userId, 'favoriteArtists');
}

function hashSeed(seed: string) {
  let hash = 0;

  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) >>> 0;
  }

  return hash;
}

export function getFavoriteArtistAppearance(seed: string) {
  return ARTIST_APPEARANCES[hashSeed(seed) % ARTIST_APPEARANCES.length];
}

export function createFavoriteArtistInput(
  artist: AudiusUser,
  appearance = getFavoriteArtistAppearance(artist.id || artist.handle || artist.name)
): FavoriteArtistInput {
  return {
    id: artist.id,
    name: artist.name,
    handle: artist.handle ?? '',
    description: artist.bio ?? '',
    avatarUrl: artist.profile_picture?.['480x480'] ?? artist.profile_picture?.['150x150'] ?? '',
    coverUrl: artist.cover_photo?.['640x'] ?? artist.cover_photo?.['2000x'] ?? '',
    color: appearance.color,
    accent: appearance.accent,
    followerCount: artist.follower_count ?? 0,
    trackCount: artist.track_count ?? 0,
    albumCount: artist.album_count ?? 0,
    playlistCount: artist.playlist_count ?? 0,
    verified: !!artist.is_verified,
    location: artist.location ?? '',
    website: artist.website ?? '',
  };
}

export async function saveFavoriteArtist(userId: string, artist: FavoriteArtistInput) {
  await setDoc(doc(favoriteArtistsCollection(userId), artist.id), {
    ...artist,
    bookmarkedAt: Date.now(),
  });
}

export async function removeFavoriteArtist(userId: string, artistId: string) {
  await deleteDoc(doc(favoriteArtistsCollection(userId), artistId));
}

export function subscribeToFavoriteArtists(
  userId: string,
  onChange: (artists: FavoriteArtist[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const favoriteArtistsQuery = query(
    favoriteArtistsCollection(userId),
    orderBy('bookmarkedAt', 'desc')
  );

  return onSnapshot(
    favoriteArtistsQuery,
    (snapshot) => {
      onChange(
        snapshot.docs.map((documentSnapshot) => {
          const data = documentSnapshot.data() as FavoriteArtist;

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