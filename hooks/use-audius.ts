import { useQuery } from '@tanstack/react-query';

import {
    fetchUser,
    fetchUserPlaylists,
    fetchUserTracks,
    searchPlaylists,
    searchTracks,
    searchUsers,
    type SearchParams,
    type UserPlaylistsParams,
    type UserTracksParams,
} from '@/lib/audius';
import { queryKeys } from '@/lib/query-keys';

function normalizeQuery(query: string | undefined): string {
  return query?.trim() ?? '';
}

export function useTrackSearch(query: string | undefined, params: Omit<SearchParams, 'query'> = {}) {
  const normalizedQuery = normalizeQuery(query);

  return useQuery({
    queryKey: queryKeys.tracks.search({ query: normalizedQuery, ...params }),
    queryFn: () => searchTracks({ query: normalizedQuery, ...params }),
    enabled: normalizedQuery.length > 0,
  });
}

export function usePlaylistSearch(query: string | undefined, params: Omit<SearchParams, 'query'> = {}) {
  const normalizedQuery = normalizeQuery(query);

  return useQuery({
    queryKey: queryKeys.playlists.search({ query: normalizedQuery, ...params }),
    queryFn: () => searchPlaylists({ query: normalizedQuery, ...params }),
    enabled: normalizedQuery.length > 0,
  });
}

export function useUserSearch(query: string | undefined, params: Omit<SearchParams, 'query'> = {}) {
  const normalizedQuery = normalizeQuery(query);

  return useQuery({
    queryKey: queryKeys.users.search({ query: normalizedQuery, ...params }),
    queryFn: () => searchUsers({ query: normalizedQuery, ...params }),
    enabled: normalizedQuery.length > 0,
  });
}

export function useAudiusUser(userId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.users.detail(userId),
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
  });
}

export function useAudiusUserTracks(userId: string | undefined, params: UserTracksParams = {}) {
  return useQuery({
    queryKey: queryKeys.tracks.byUser(userId, params),
    queryFn: () => fetchUserTracks(userId!, params),
    enabled: !!userId,
  });
}

export function useAudiusUserPlaylists(
  userId: string | undefined,
  params: UserPlaylistsParams = {}
) {
  return useQuery({
    queryKey: queryKeys.playlists.byUser(userId, params),
    queryFn: () => fetchUserPlaylists(userId!, params),
    enabled: !!userId,
  });
}