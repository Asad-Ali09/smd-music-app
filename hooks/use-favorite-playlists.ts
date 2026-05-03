import { startTransition, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth';
import {
    removeFavoritePlaylist,
    saveFavoritePlaylist,
    subscribeToFavoritePlaylists,
    type FavoritePlaylist,
    type FavoritePlaylistInput,
} from '@/lib/favorite-playlists';

export function useFavoritePlaylists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<FavoritePlaylist[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setPlaylists([]);
      setError(null);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    setError(null);

    return subscribeToFavoritePlaylists(
      user.uid,
      (nextPlaylists) => {
        startTransition(() => {
          setPlaylists(nextPlaylists);
          setIsPending(false);
        });
      },
      (nextError) => {
        setError(nextError);
        setIsPending(false);
      }
    );
  }, [user]);

  const favoriteIds = new Set(playlists.map((playlist) => playlist.id));

  async function toggleFavoritePlaylist(playlist: FavoritePlaylistInput) {
    if (!user) {
      throw new Error('You must be signed in to favorite playlists.');
    }

    setPendingIds((current) => [...current, playlist.id]);

    try {
      if (favoriteIds.has(playlist.id)) {
        await removeFavoritePlaylist(user.uid, playlist.id);
      } else {
        await saveFavoritePlaylist(user.uid, playlist);
      }
    } finally {
      setPendingIds((current) => current.filter((id) => id !== playlist.id));
    }
  }

  function isBookmarkPending(playlistId: string) {
    return pendingIds.includes(playlistId);
  }

  return {
    data: playlists,
    favoriteIds,
    isPending,
    isError: !!error,
    error,
    toggleFavoritePlaylist,
    isBookmarkPending,
  };
}