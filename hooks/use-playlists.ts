import { useQuery } from '@tanstack/react-query';

import {
    fetchPlaylistTracks,
    fetchTrendingPlaylists,
    type TrendingPlaylistsParams,
} from '@/lib/audius';
import { queryKeys } from '@/lib/query-keys';

export function useTrendingPlaylists(params: TrendingPlaylistsParams = {}) {
  return useQuery({
    queryKey: queryKeys.playlists.trending(params),
    queryFn: () => fetchTrendingPlaylists(params),
  });
}

export function usePlaylistTracks(playlistId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.playlists.tracks(playlistId),
    queryFn: () => fetchPlaylistTracks(playlistId!),
    enabled: !!playlistId,
  });
}
