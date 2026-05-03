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
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  twitter_handle?: string | null;
  instagram_handle?: string | null;
  tiktok_handle?: string | null;
  follower_count?: number;
  followee_count?: number;
  track_count?: number;
  playlist_count?: number;
  album_count?: number;
  is_verified?: boolean;
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
  genre?: string;
  release_date?: string | null;
  created_at?: string | null;
  duration: number;
  play_count: number;
  repost_count: number;
  favorite_count: number;
  is_streamable: boolean;
  is_downloadable?: boolean;
  parental_warning_type?: string | null;
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

export type TrendingTracksResponse = {
  data: AudiusTrack[];
};

export type TrendingPlaylistsParams = {
  type?: 'playlist' | 'album';
  time?: 'week' | 'month' | 'year' | 'allTime';
  limit?: number;
  offset?: number;
};

export type TrendingTracksParams = {
  time?: 'week' | 'month' | 'year' | 'allTime';
  limit?: number;
  offset?: number;
};

export type SearchParams = {
  query: string;
  limit?: number;
  offset?: number;
};

export type UserTracksParams = {
  limit?: number;
  offset?: number;
};

export type UserPlaylistsParams = {
  limit?: number;
  offset?: number;
};

type AudiusListResponse<T> = {
  data: T[];
};

type AudiusItemResponse<T> = {
  data: T;
};

export async function fetchPlaylistTracks(playlistId: string): Promise<AudiusTrack[]> {
  const { data } = await axios.get<PlaylistTracksResponse>(
    `${BASE_URL}/playlists/${playlistId}/tracks`,
    {
      params: {
        app_name: 'MusicApp',
      },
    }
  );
  return data.data;
}

export function getTrackStreamUrl(trackId: string): string {
  return `${BASE_URL}/tracks/${trackId}/stream?app_name=MusicApp`;
}

export async function fetchTrendingPlaylists(
  params: TrendingPlaylistsParams = {}
): Promise<AudiusPlaylist[]> {
  const { data } = await axios.get<TrendingPlaylistsResponse>(
    `${BASE_URL}/playlists/trending`,
    {
      params: {
        app_name: 'MusicApp',
        type: params.type ?? 'playlist',
        limit: params.limit ?? 20,
        ...(params.time && { time: params.time }),
        ...(params.offset !== undefined && { offset: params.offset }),
      },
    }
  );
  return data.data;
}

export async function fetchTrendingTracks(
  params: TrendingTracksParams = {}
): Promise<AudiusTrack[]> {
  const { data } = await axios.get<TrendingTracksResponse>(
    `${BASE_URL}/tracks/trending`,
    {
      params: {
        app_name: 'MusicApp',
        limit: params.limit ?? 20,
        ...(params.time && { time: params.time }),
        ...(params.offset !== undefined && { offset: params.offset }),
      },
    }
  );
  return data.data;
}

export async function searchTracks(params: SearchParams): Promise<AudiusTrack[]> {
  const { data } = await axios.get<AudiusListResponse<AudiusTrack>>(`${BASE_URL}/tracks/search`, {
    params: {
      app_name: 'MusicApp',
      limit: params.limit ?? 10,
      query: params.query,
      ...(params.offset !== undefined && { offset: params.offset }),
    },
  });

  return data.data;
}

export async function searchPlaylists(params: SearchParams): Promise<AudiusPlaylist[]> {
  const { data } = await axios.get<AudiusListResponse<AudiusPlaylist>>(
    `${BASE_URL}/playlists/search`,
    {
      params: {
        app_name: 'MusicApp',
        limit: params.limit ?? 12,
        query: params.query,
        ...(params.offset !== undefined && { offset: params.offset }),
      },
    }
  );

  return data.data;
}

export async function searchUsers(params: SearchParams): Promise<AudiusUser[]> {
  const { data } = await axios.get<AudiusListResponse<AudiusUser>>(`${BASE_URL}/users/search`, {
    params: {
      app_name: 'MusicApp',
      limit: params.limit ?? 8,
      query: params.query,
      ...(params.offset !== undefined && { offset: params.offset }),
    },
  });

  return data.data;
}

export async function fetchUser(userId: string): Promise<AudiusUser> {
  const { data } = await axios.get<AudiusItemResponse<AudiusUser>>(`${BASE_URL}/users/${userId}`, {
    params: {
      app_name: 'MusicApp',
    },
  });

  return data.data;
}

export async function fetchUserTracks(
  userId: string,
  params: UserTracksParams = {}
): Promise<AudiusTrack[]> {
  const { data } = await axios.get<AudiusListResponse<AudiusTrack>>(
    `${BASE_URL}/users/${userId}/tracks`,
    {
      params: {
        app_name: 'MusicApp',
        limit: params.limit ?? 10,
        ...(params.offset !== undefined && { offset: params.offset }),
      },
    }
  );

  return data.data;
}

export async function fetchUserPlaylists(
  userId: string,
  params: UserPlaylistsParams = {}
): Promise<AudiusPlaylist[]> {
  const { data } = await axios.get<AudiusListResponse<AudiusPlaylist>>(
    `${BASE_URL}/users/${userId}/playlists`,
    {
      params: {
        app_name: 'MusicApp',
        limit: params.limit ?? 10,
        ...(params.offset !== undefined && { offset: params.offset }),
      },
    }
  );

  return data.data;
}
