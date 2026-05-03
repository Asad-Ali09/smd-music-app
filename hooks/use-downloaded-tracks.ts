import { startTransition, useEffect, useState } from 'react';

import {
    downloadTrackToDevice,
    subscribeToDownloadedTracks,
    type DownloadedTrack,
    type DownloadedTrackSource,
} from '@/lib/downloaded-tracks-store';

export function useDownloadedTracks() {
  const [tracks, setTracks] = useState<DownloadedTrack[]>([]);
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pendingIds, setPendingIds] = useState<string[]>([]);

  useEffect(() => {
    setIsPending(true);
    setError(null);

    return subscribeToDownloadedTracks(
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
  }, []);

  const downloadedIds = new Set(tracks.map((track) => track.id));

  async function downloadTrack(track: DownloadedTrackSource) {
    setPendingIds((current) => [...current, track.id]);

    try {
      return await downloadTrackToDevice(track);
    } finally {
      setPendingIds((current) => current.filter((id) => id !== track.id));
    }
  }

  function isDownloadPending(trackId: string) {
    return pendingIds.includes(trackId);
  }

  return {
    data: tracks,
    downloadedIds,
    isPending,
    isError: !!error,
    error,
    downloadTrack,
    isDownloadPending,
  };
}