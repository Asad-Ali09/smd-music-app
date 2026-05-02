import axios from 'axios';

const BASE_URL = 'https://api.audius.co/v1';

export type AudiusArtwork = {
  '150x150': string;
  '480x480': string;
  '1000x1000': string;
  mirrors?: string[];
} | null;

export type AudiusResourceUrls = {
  url: string;
  mirrors?: string[];
};

export type AudiusUser = {
  id: string;
  name: string;
  handle: string;
  profile_picture?: AudiusArtwork;
  cover_photo?: {
    '640x': string;
    '2000x': string;
    mirrors?: string[];
  };
};

export type AudiusTrack = {
  id: string;
  title: string;
  duration: number;
  play_count: number;
  repost_count: number;
  favorite_count: number;
  is_streamable: boolean;
  is_downloadable?: boolean;
  artwork: AudiusArtwork;
  cover_art_cids?: AudiusArtwork;
  permalink?: string;
  stream?: AudiusResourceUrls;
  download?: AudiusResourceUrls;
  preview?: AudiusResourceUrls;
  user: AudiusUser | null;
};

export type AudiusPlaylist = {
  id: string;
  playlist_name: string;
  description: string;
  artwork: AudiusArtwork;
  cover_art?: string;
  cover_art_sizes?: string;
  cover_art_cids?: AudiusArtwork;
  track_count: number;
  repost_count: number;
  favorite_count: number;
  total_play_count: number;
  is_album: boolean;
  permalink: string;
  user: AudiusUser | null;
  tracks?: AudiusTrack[];
};

export type TrendingPlaylistsResponse = {
  data: AudiusPlaylist[];
};

export type PlaylistTracksResponse = {
  data: AudiusTrack[];
};

export type TrendingPlaylistsParams = {
  time?: 'week' | 'month' | 'year' | 'allTime';
  limit?: number;
  offset?: number;
};

export async function fetchPlaylistTracks(playlistId: string): Promise<AudiusTrack[]> {
  const { data } = await axios.get<PlaylistTracksResponse>(
    `${BASE_URL}/playlists/${playlistId}/tracks`
  );
  return data.data;
}

export async function fetchTrendingPlaylists(
  params: TrendingPlaylistsParams = {}
): Promise<AudiusPlaylist[]> {
  const { data } = await axios.get<TrendingPlaylistsResponse>(
    `${BASE_URL}/playlists/trending`,
    {
      params: {
        type: 'playlist',
        limit: params.limit ?? 20,
        ...(params.time && { time: params.time }),
        ...(params.offset !== undefined && { offset: params.offset }),
      },
    }
  );
  return data.data;
}
