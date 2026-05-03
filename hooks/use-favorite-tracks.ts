import { startTransition, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth';
import {
    removeFavoriteTrack,
    saveFavoriteTrack,
    subscribeToFavoriteTracks,
    type FavoriteTrack,
    type FavoriteTrackInput,
} from '@/lib/favorite-tracks-store';

export function useFavoriteTracks() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<FavoriteTrack[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setTracks([]);
      setError(null);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    setError(null);

    return subscribeToFavoriteTracks(
      user.uid,
      (nextTracks) => {
        startTransition(() => {
          setTracks(nextTracks);
          setIsPending(false);
        });
      },
      (nextError) => {
        setError(nextError);
        setIsPending(false);
      }
    );
  }, [user]);

  const favoriteIds = new Set(tracks.map((track) => track.id));

  async function toggleFavoriteTrack(track: FavoriteTrackInput) {
    if (!user) {
      throw new Error('You must be signed in to favorite tracks.');
    }

    setPendingIds((current) => [...current, track.id]);

    try {
      if (favoriteIds.has(track.id)) {
        await removeFavoriteTrack(user.uid, track.id);
      } else {
        await saveFavoriteTrack(user.uid, track);
      }
    } finally {
      setPendingIds((current) => current.filter((id) => id !== track.id));
    }
  }

  function isFavoritePending(trackId: string) {
    return pendingIds.includes(trackId);
  }

  return {
    data: tracks,
    favoriteIds,
    isPending,
    isError: !!error,
    error,
    toggleFavoriteTrack,
    isFavoritePending,
  };
}