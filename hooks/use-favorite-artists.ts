import { startTransition, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth';
import {
    removeFavoriteArtist,
    saveFavoriteArtist,
    subscribeToFavoriteArtists,
    type FavoriteArtist,
    type FavoriteArtistInput,
} from '@/lib/favorite-artists-store';

export function useFavoriteArtists() {
  const { user } = useAuth();
  const [artists, setArtists] = useState<FavoriteArtist[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setArtists([]);
      setError(null);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    setError(null);

    return subscribeToFavoriteArtists(
      user.uid,
      (nextArtists) => {
        startTransition(() => {
          setArtists(nextArtists);
          setIsPending(false);
        });
      },
      (nextError) => {
        setError(nextError);
        setIsPending(false);
      }
    );
  }, [user]);

  const favoriteIds = new Set(artists.map((artist) => artist.id));

  async function toggleFavoriteArtist(artist: FavoriteArtistInput) {
    if (!user) {
      throw new Error('You must be signed in to favorite artists.');
    }

    setPendingIds((current) => [...current, artist.id]);

    try {
      if (favoriteIds.has(artist.id)) {
        await removeFavoriteArtist(user.uid, artist.id);
      } else {
        await saveFavoriteArtist(user.uid, artist);
      }
    } finally {
      setPendingIds((current) => current.filter((id) => id !== artist.id));
    }
  }

  function isFavoritePending(artistId: string) {
    return pendingIds.includes(artistId);
  }

  return {
    data: artists,
    favoriteIds,
    isPending,
    isError: !!error,
    error,
    toggleFavoriteArtist,
    isFavoritePending,
  };
}