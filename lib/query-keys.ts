export const queryKeys = {
  playlists: {
    trending: (params: object = {}) => ['trendingPlaylists', params] as const,
    tracks: (playlistId: string | undefined) => ['playlistTracks', playlistId] as const,
  },
};
