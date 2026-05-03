import { Audio, type AVPlaybackStatus } from 'expo-av';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';

import { getTrackStreamUrl } from '@/lib/audius';

export type PlayerTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  localFileUri?: string;
  duration: number;
  color?: string;
  playlistName?: string;
  playlistId?: string;
};

type PlayerContextType = {
  currentTrack: PlayerTrack | null;
  queue: PlayerTrack[];
  isPlaying: boolean;
  positionSec: number;
  durationSec: number;
  isLoading: boolean;
  playTrack: (track: PlayerTrack, queue?: PlayerTrack[]) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  seek: (seconds: number) => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  stop: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used inside PlayerProvider');
  return ctx;
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [currentTrack, setCurrentTrack] = useState<PlayerTrack | null>(null);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [positionSec, setPositionSec] = useState(0);
  const [durationSec, setDurationSec] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Mutable refs so callbacks are never stale
  const queueRef = useRef<PlayerTrack[]>([]);
  const currentTrackRef = useRef<PlayerTrack | null>(null);
  const playTrackRef = useRef<((track: PlayerTrack) => Promise<void>) | null>(null);
  const playRequestIdRef = useRef(0);

  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  // Configure audio mode once on mount
  useEffect(() => {
    Audio.setAudioModeAsync({
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      playRequestIdRef.current += 1;
      soundRef.current?.unloadAsync();
    };
  }, []);

  const unloadSound = useCallback(async (sound: Audio.Sound | null) => {
    if (!sound) return;

    try {
      await sound.unloadAsync();
    } catch (err) {
      console.error('PlayerContext: failed to unload sound', err);
    }
  }, []);

  const handlePlaybackStatus = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setIsPlaying(status.isPlaying);
    setPositionSec(Math.floor((status.positionMillis ?? 0) / 1000));
    if (status.durationMillis != null) {
      setDurationSec(Math.floor(status.durationMillis / 1000));
    }
    if (status.didJustFinish) {
      const current = currentTrackRef.current;
      const q = queueRef.current;
      if (current && q.length > 0) {
        const idx = q.findIndex((t) => t.id === current.id);
        if (idx >= 0 && idx < q.length - 1) {
          playTrackRef.current?.(q[idx + 1]);
        }
      }
    }
  }, []);

  const playTrack = useCallback(
    async (track: PlayerTrack, newQueue?: PlayerTrack[]) => {
      const requestId = playRequestIdRef.current + 1;
      playRequestIdRef.current = requestId;
      setIsLoading(true);
      try {
        const previousSound = soundRef.current;
        soundRef.current = null;
        await unloadSound(previousSound);

        if (newQueue !== undefined) {
          setQueue(newQueue);
          queueRef.current = newQueue;
        }
        setCurrentTrack(track);
        currentTrackRef.current = track;
        setPositionSec(0);
        setDurationSec(track.duration);

        const audioUri = track.localFileUri ?? getTrackStreamUrl(track.id);
        const { sound } = await Audio.Sound.createAsync(
          { uri: audioUri },
          { shouldPlay: true, progressUpdateIntervalMillis: 500 },
          handlePlaybackStatus,
        );

        if (requestId !== playRequestIdRef.current) {
          await unloadSound(sound);
          return;
        }

        soundRef.current = sound;
        setIsPlaying(true);
      } catch (err) {
        console.error('PlayerContext: failed to play track', err);
      } finally {
        if (requestId === playRequestIdRef.current) {
          setIsLoading(false);
        }
      }
    },
    [handlePlaybackStatus, unloadSound],
  );

  // Keep the ref current so the auto-advance callback can call it
  useEffect(() => {
    playTrackRef.current = playTrack;
  }, [playTrack]);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
  }, []);

  const resume = useCallback(async () => {
    await soundRef.current?.playAsync();
  }, []);

  const seek = useCallback(async (seconds: number) => {
    await soundRef.current?.setPositionAsync(Math.round(seconds * 1000));
  }, []);

  const skipNext = useCallback(async () => {
    const current = currentTrackRef.current;
    const q = queueRef.current;
    if (!current || q.length === 0) return;
    const idx = q.findIndex((t) => t.id === current.id);
    if (idx >= 0 && idx < q.length - 1) {
      await playTrack(q[idx + 1]);
    }
  }, [playTrack]);

  const skipPrevious = useCallback(async () => {
    const current = currentTrackRef.current;
    const q = queueRef.current;
    if (!current) return;
    // If more than 3 s have passed, restart current track
    if (positionSec > 3) {
      await seek(0);
      return;
    }
    if (q.length === 0) return;
    const idx = q.findIndex((t) => t.id === current.id);
    if (idx > 0) {
      await playTrack(q[idx - 1]);
    }
  }, [playTrack, positionSec, seek]);

  const stop = useCallback(async () => {
    playRequestIdRef.current += 1;
    const activeSound = soundRef.current;
    soundRef.current = null;
    await unloadSound(activeSound);
    setCurrentTrack(null);
    setQueue([]);
    queueRef.current = [];
    currentTrackRef.current = null;
    setIsPlaying(false);
    setPositionSec(0);
    setDurationSec(0);
  }, [unloadSound]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        queue,
        isPlaying,
        positionSec,
        durationSec,
        isLoading,
        playTrack,
        pause,
        resume,
        seek,
        skipNext,
        skipPrevious,
        stop,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
