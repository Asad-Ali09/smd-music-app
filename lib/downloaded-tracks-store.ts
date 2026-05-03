import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

import { getTrackStreamUrl } from '@/lib/audius';

const DOWNLOADED_TRACKS_STORAGE_KEY = 'downloadedTracks';
const DOWNLOADS_ROOT_URI = `${FileSystem.documentDirectory ?? ''}downloads/`;
const AUDIO_DOWNLOADS_URI = `${DOWNLOADS_ROOT_URI}audio/`;
const ARTWORK_DOWNLOADS_URI = `${DOWNLOADS_ROOT_URI}artwork/`;

const downloadedTrackListeners = new Set<(tracks: DownloadedTrack[]) => void>();

export type DownloadedTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  artworkFileUri: string;
  audioFileUri: string;
  durationSec: number;
  color: string;
  playlistName: string;
  playlistId: string;
  downloadedAt: number;
};

export type DownloadedTrackSource = {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  duration: number;
  color?: string;
  playlistName?: string;
  playlistId?: string;
};

function sanitizeFileName(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, '_');
}

async function readDownloadedTracks() {
  const rawValue = await AsyncStorage.getItem(DOWNLOADED_TRACKS_STORAGE_KEY);

  if (!rawValue) {
    return [] as DownloadedTrack[];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as DownloadedTrack[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

async function persistDownloadedTracks(tracks: DownloadedTrack[]) {
  await AsyncStorage.setItem(DOWNLOADED_TRACKS_STORAGE_KEY, JSON.stringify(tracks));
  downloadedTrackListeners.forEach((listener) => listener(tracks));
}

async function ensureDownloadDirectories() {
  if (!FileSystem.documentDirectory) {
    throw new Error('Downloads are not supported on this platform.');
  }

  await FileSystem.makeDirectoryAsync(DOWNLOADS_ROOT_URI, { intermediates: true });
  await FileSystem.makeDirectoryAsync(AUDIO_DOWNLOADS_URI, { intermediates: true });
  await FileSystem.makeDirectoryAsync(ARTWORK_DOWNLOADS_URI, { intermediates: true });
}

async function downloadArtworkIfAvailable(trackId: string, artworkUrl: string | undefined) {
  if (!artworkUrl) {
    return '';
  }

  const artworkFileUri = `${ARTWORK_DOWNLOADS_URI}${sanitizeFileName(trackId)}.jpg`;

  try {
    await FileSystem.deleteAsync(artworkFileUri, { idempotent: true });
    await FileSystem.downloadAsync(artworkUrl, artworkFileUri);
    return artworkFileUri;
  } catch {
    return '';
  }
}

export function subscribeToDownloadedTracks(
  onChange: (tracks: DownloadedTrack[]) => void,
  onError?: (error: Error) => void
) {
  let disposed = false;

  readDownloadedTracks()
    .then((tracks) => {
      if (!disposed) {
        onChange(tracks);
      }
    })
    .catch((error) => {
      if (!disposed) {
        onError?.(error as Error);
      }
    });

  const listener = (tracks: DownloadedTrack[]) => onChange(tracks);
  downloadedTrackListeners.add(listener);

  return () => {
    disposed = true;
    downloadedTrackListeners.delete(listener);
  };
}

export async function downloadTrackToDevice(track: DownloadedTrackSource) {
  const existingTracks = await readDownloadedTracks();
  const existingTrack = existingTracks.find((existing) => existing.id === track.id);

  if (existingTrack) {
    const existingFile = await FileSystem.getInfoAsync(existingTrack.audioFileUri);
    if (existingFile.exists) {
      return existingTrack;
    }
  }

  await ensureDownloadDirectories();

  const audioFileUri = `${AUDIO_DOWNLOADS_URI}${sanitizeFileName(track.id)}.mp3`;

  await FileSystem.deleteAsync(audioFileUri, { idempotent: true });
  await FileSystem.downloadAsync(getTrackStreamUrl(track.id), audioFileUri);

  const artworkFileUri = await downloadArtworkIfAvailable(track.id, track.artworkUrl);

  const downloadedTrack: DownloadedTrack = {
    id: track.id,
    title: track.title,
    artist: track.artist,
    artworkUrl: track.artworkUrl ?? '',
    artworkFileUri: artworkFileUri || existingTrack?.artworkFileUri || '',
    audioFileUri,
    durationSec: track.duration,
    color: track.color ?? '#1DB954',
    playlistName: track.playlistName ?? '',
    playlistId: track.playlistId ?? '',
    downloadedAt: existingTrack?.downloadedAt ?? Date.now(),
  };

  await persistDownloadedTracks([
    downloadedTrack,
    ...existingTracks.filter((existing) => existing.id !== track.id),
  ]);

  return downloadedTrack;
}