export const queryKeys = {
  playlists: {
    trending: (params: object = {}) => ['trendingPlaylists', params] as const,
    search: (params: object = {}) => ['searchPlaylists', params] as const,
    tracks: (playlistId: string | undefined) => ['playlistTracks', playlistId] as const,
    byUser: (userId: string | undefined, params: object = {}) => ['userPlaylists', userId, params] as const,
  },
  tracks: {
    trending: (params: object = {}) => ['trendingTracks', params] as const,
    search: (params: object = {}) => ['searchTracks', params] as const,
    byUser: (userId: string | undefined, params: object = {}) => ['userTracks', userId, params] as const,
  },
  users: {
    search: (params: object = {}) => ['searchUsers', params] as const,
    detail: (userId: string | undefined) => ['userDetail', userId] as const,
  },
};
