import { startTransition, useEffect, useState } from 'react';

import { useAuth } from '@/context/auth';
import {
    removeFavoriteAlbum,
    reorderFavoriteAlbums,
    saveFavoriteAlbum,
    subscribeToFavoriteAlbums,
    type FavoriteAlbum,
    type FavoriteAlbumInput,
} from '@/lib/favorite-albums-store';

export function useFavoriteAlbums() {
  const { user } = useAuth();
  const [albums, setAlbums] = useState<FavoriteAlbum[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setAlbums([]);
      setError(null);
      setIsPending(false);
      return;
    }

    setIsPending(true);
    setError(null);

    return subscribeToFavoriteAlbums(
      user.uid,
      (nextAlbums) => {
        startTransition(() => {
          setAlbums(nextAlbums);
          setIsPending(false);
        });
      },
      (nextError) => {
        setError(nextError);
        setIsPending(false);
      }
    );
  }, [user]);

  const favoriteIds = new Set(albums.map((album) => album.id));

  async function toggleFavoriteAlbum(album: FavoriteAlbumInput) {
    if (!user) {
      throw new Error('You must be signed in to favorite albums.');
    }

    setPendingIds((current) => [...current, album.id]);

    try {
      if (favoriteIds.has(album.id)) {
        await removeFavoriteAlbum(user.uid, album.id);
      } else {
        await saveFavoriteAlbum(user.uid, album);
      }
    } finally {
      setPendingIds((current) => current.filter((id) => id !== album.id));
    }
  }

  async function moveAlbum(fromIndex: number, toIndex: number) {
    if (!user) return;
    const reordered = [...albums];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setAlbums(reordered);
    await reorderFavoriteAlbums(user.uid, reordered);
  }

  function isBookmarkPending(albumId: string) {
    return pendingIds.includes(albumId);
  }

  return {
    data: albums,
    favoriteIds,
    isPending,
    isError: !!error,
    error,
    toggleFavoriteAlbum,
    isBookmarkPending,
    moveAlbum,
  };
}