import { useQuery } from '@tanstack/react-query';

import {
    fetchPlaylistTracks,
    fetchTrendingPlaylists,
    fetchTrendingTracks,
    type TrendingPlaylistsParams,
    type TrendingTracksParams,
} from '@/lib/audius';
import { queryKeys } from '@/lib/query-keys';

export function useTrendingPlaylists(params: TrendingPlaylistsParams = {}) {
  return useQuery({
    queryKey: queryKeys.playlists.trending(params),
    queryFn: () => fetchTrendingPlaylists(params),
  });
}

export function useTrendingTracks(params: TrendingTracksParams = {}) {
  return useQuery({
    queryKey: queryKeys.tracks.trending(params),
    queryFn: () => fetchTrendingTracks(params),
  });
}

export function usePlaylistTracks(playlistId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.playlists.tracks(playlistId),
    queryFn: () => fetchPlaylistTracks(playlistId!),
    enabled: !!playlistId,
  });
}
