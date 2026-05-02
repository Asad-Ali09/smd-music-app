import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetScrollView,
  type BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { usePlaylistTracks } from '@/hooks/use-playlists';
import { type AudiusTrack } from '@/lib/audius';

const SHEET_COLLAPSED_HEIGHT = 52;
const SHEET_MID_HEIGHT = 430;
const SHEET_HANDLE_CLOSED_WIDTH = 52;
const SHEET_HANDLE_OPEN_WIDTH = 40;
const SHEET_HANDLE_TOP_SPACING = 10;
const SHEET_TOP_GAP = 24;
const QUEUE_ACCENT_COLORS = ['#d50000', '#29b6f6', '#a1887f', '#b39ddb', '#ff5c68', '#ffe0c7'];

const PLAYER_ACTIONS = [
  { icon: 'add-circle-outline' as const, label: 'Add to Playlist' },
  { icon: 'person-outline' as const, label: 'Artist' },
  { icon: 'albums-outline' as const, label: 'Album' },
  { icon: 'thumbs-down-outline' as const, label: "I don’t like it" },
  { icon: 'document-text-outline' as const, label: 'Song lyrics' },
  { icon: 'download-outline' as const, label: 'Download' },
];

type PlayerSheetMode = 'actions' | 'queue';

type QueueTrack = {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string;
  accentColor: string;
  isCurrent: boolean;
};

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function buildFallbackQueueTracks(
  currentTitle: string,
  currentArtist: string,
  currentArtworkUrl: string | undefined,
  accentColor: string,
): QueueTrack[] {
  const suggestions = [
    { title: currentTitle || 'Burning', artist: currentArtist || 'Podval Cappella', artworkUrl: currentArtworkUrl },
    { title: 'Flashbacks', artist: 'Emika' },
    { title: 'Ivår’s Revenge', artist: 'Danheim' },
    { title: 'Urgent Siege', artist: 'Damned Anthem' },
    { title: 'Surtr', artist: 'David Garcia Diaz, Andy LaPlegua' },
    { title: 'Entangled', artist: 'Lorn' },
    { title: 'The Cycle Continues', artist: 'Mac Quayle' },
  ];

  return suggestions.map((track, index) => ({
    id: `suggested-${index}`,
    title: track.title,
    artist: track.artist,
    artworkUrl: track.artworkUrl,
    accentColor: index === 0 ? accentColor : QUEUE_ACCENT_COLORS[index % QUEUE_ACCENT_COLORS.length],
    isCurrent: index === 0,
  }));
}

function mapQueueTracks(
  tracks: AudiusTrack[],
  currentTrackId: string | undefined,
  currentTitle: string,
  currentArtist: string,
  accentColor: string,
): QueueTrack[] {
  return tracks.map((track, index) => {
    const isCurrent = currentTrackId
      ? track.id === currentTrackId
      : track.title === currentTitle && (track.user?.name ?? 'Unknown Artist') === currentArtist;

    return {
      id: track.id,
      title: track.title,
      artist: track.user?.name ?? 'Unknown Artist',
      artworkUrl: track.artwork?.['150x150'] ?? track.artwork?.['480x480'] ?? undefined,
      accentColor: isCurrent ? '#1db954' : QUEUE_ACCENT_COLORS[index % QUEUE_ACCENT_COLORS.length],
      isCurrent,
    };
  });
}

function QueueTrackItem({ track }: { track: QueueTrack }) {
  return (
    <TouchableOpacity style={styles.queueRow} activeOpacity={0.82}>
      <View style={[styles.queueArtworkShell, { backgroundColor: track.accentColor }]}> 
        {track.isCurrent ? (
          <Ionicons name="play" size={22} color="#fff" style={styles.queuePlayIcon} />
        ) : track.artworkUrl ? (
          <Image source={{ uri: track.artworkUrl }} style={styles.queueArtwork} resizeMode="cover" />
        ) : null}
      </View>

      <View style={styles.queueInfo}>
        <ThemedText style={styles.queueTitle} numberOfLines={1}>
          {track.title}
        </ThemedText>
        <ThemedText style={styles.queueArtist} numberOfLines={1}>
          {track.artist}
        </ThemedText>
      </View>

      <View style={styles.queueRight}>
        {track.isCurrent && <ThemedText style={styles.queueNow}>NOW</ThemedText>}
        <TouchableOpacity hitSlop={10} style={styles.queueMoreBtn}>
          <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function PlayerSheetHandle({ animatedIndex }: BottomSheetHandleProps) {
  const handleContainerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(
      animatedIndex?.value ?? 0,
      [0, 1],
      [0, SHEET_HANDLE_TOP_SPACING],
      Extrapolation.CLAMP,
    ),
  }));

  const handleIndicatorStyle = useAnimatedStyle(() => ({
    width: interpolate(
      animatedIndex?.value ?? 0,
      [0, 1],
      [SHEET_HANDLE_CLOSED_WIDTH, SHEET_HANDLE_OPEN_WIDTH],
      Extrapolation.CLAMP,
    ),
    backgroundColor: interpolateColor(
      animatedIndex?.value ?? 0,
      [0, 1],
      ['rgba(255,255,255,0.48)', 'rgba(255,255,255,0.3)'],
    ),
  }));

  return (
    <Animated.View style={[styles.sheetHandleContainer, handleContainerStyle]}>
      <Animated.View style={[styles.sheetHandle, handleIndicatorStyle]} />
    </Animated.View>
  );
}

export default function PlayerScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const { top: topInset, bottom: bottomInset } = useSafeAreaInsets();
  const {
    trackTitle,
    trackArtist,
    trackDuration,
    artworkUrl,
    playlistName,
    color,
    playlistId,
    trackId,
  } =
    useLocalSearchParams<{
      trackTitle: string;
      trackArtist: string;
      trackDuration: string;
      artworkUrl: string;
      playlistName: string;
      color: string;
      playlistId: string;
      trackId: string;
    }>();

  const [isPlaying, setIsPlaying] = useState(true);
  const [sheetMode, setSheetMode] = useState<PlayerSheetMode>('actions');
  const [sheetIndex, setSheetIndex] = useState(0);
  const total = Number(trackDuration ?? 0) || 163;
  const progress = 0.22;
  const elapsed = Math.round(total * progress);
  const bgColor = color ?? '#8B5A2B';
  const { data: playlistTracks, isPending: isQueuePending } = usePlaylistTracks(playlistId);
  const maxSheetHeight = Math.max(
    SHEET_MID_HEIGHT + 120,
    windowHeight - topInset - SHEET_TOP_GAP,
  );
  const snapPoints = useMemo(
    () => [SHEET_COLLAPSED_HEIGHT, SHEET_MID_HEIGHT, maxSheetHeight],
    [maxSheetHeight],
  );
  const queueTracks = useMemo(() => {
    if (playlistTracks?.length) {
      return mapQueueTracks(
        playlistTracks,
        trackId,
        trackTitle ?? 'Unknown Track',
        trackArtist ?? 'Unknown Artist',
        bgColor,
      );
    }

    return buildFallbackQueueTracks(
      trackTitle ?? 'Unknown Track',
      trackArtist ?? 'Unknown Artist',
      artworkUrl,
      bgColor,
    );
  }, [bgColor, artworkUrl, playlistTracks, trackArtist, trackId, trackTitle]);

  function openSheet(mode: PlayerSheetMode, nextIndex = 1) {
    setSheetMode(mode);
    setSheetIndex(nextIndex);
  }

  return (
    <View style={styles.root}>
      {/* Blurred artwork background */}
      {artworkUrl ? (
        <Image
          source={{ uri: artworkUrl }}
          style={StyleSheet.absoluteFill}
          blurRadius={25}
          resizeMode="cover"
        />
      ) : (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
      )}

      {/* Dark overlay for readability */}
      <LinearGradient
        colors={['rgba(0,0,0,0.12)', 'rgba(0,0,0,0.42)', 'rgba(0,0,0,0.28)']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* Drag handle / back tap target */}
        <TouchableOpacity onPress={() => router.back()} style={styles.handleArea} hitSlop={16}>
          <View style={styles.handle} />
        </TouchableOpacity>

        {/* Now playing label */}
        <ThemedText style={styles.nowPlaying}>
          Play Now: Playlist «{playlistName ?? ''}»
        </ThemedText>

        {/* Spacer — pushes controls into the lower half */}
        <View style={{ flex: 1 }} />

        {/* Main content */}
        <View style={styles.mainContent}>
          {/* Song artwork */}
          <View style={styles.artworkWrapper}>
            {artworkUrl ? (
              <Image
                source={{ uri: artworkUrl }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.artwork, styles.artworkPlaceholder, { backgroundColor: bgColor }]}>
                <Ionicons name="musical-notes" size={52} color="rgba(255,255,255,0.45)" />
              </View>
            )}
          </View>

          <ThemedText style={styles.trackTitle} numberOfLines={2}>
            {trackTitle ?? 'Unknown Track'}
          </ThemedText>
          <ThemedText style={styles.trackArtist} numberOfLines={1}>
            {trackArtist ?? 'Unknown Artist'}
          </ThemedText>

          {/* Bookmark row above controls */}
          <View style={styles.bookmarkRow}>
            <TouchableOpacity style={styles.bookmarkCircle}>
              <Ionicons name="bookmark" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Playback controls */}
          <View style={styles.controls}>
            <TouchableOpacity hitSlop={12} onPress={() => openSheet('actions', 1)}>
              <Ionicons name="options-outline" size={22} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={12}>
              <Ionicons name="play-skip-back" size={26} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.playPauseBtn}
              onPress={() => setIsPlaying((p) => !p)}
              activeOpacity={0.85}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={28}
                color="#000"
                style={!isPlaying ? { marginLeft: 3 } : undefined}
              />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={12}>
              <Ionicons name="play-skip-forward" size={26} color="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
            <TouchableOpacity hitSlop={12} onPress={() => openSheet('actions', 1)}>
              <Ionicons name="ellipsis-horizontal" size={22} color="rgba(255,255,255,0.75)" />
            </TouchableOpacity>
          </View>

          {/* Seek bar */}
          <View style={styles.seekContainer}>
            <View style={styles.seekBar}>
              <View style={styles.seekTrackBg} />
              <View style={[styles.seekFill, { width: `${progress * 100}%` }]} />
              <View style={[styles.seekThumb, { left: `${progress * 100}%` }]} />
            </View>
            <View style={styles.seekTimes}>
              <ThemedText style={styles.seekTime}>{fmt(elapsed)}</ThemedText>
              <ThemedText style={styles.seekTime}>{fmt(total)}</ThemedText>
            </View>
          </View>
        </View>

        {/* Music List button */}
        <TouchableOpacity
          style={styles.musicListBtn}
          onPress={() => openSheet('queue', 1)}
          activeOpacity={0.85}
        >
          <ThemedText style={styles.musicListText}>Music List</ThemedText>
          <Ionicons name="chevron-up" size={16} color="#000" />
        </TouchableOpacity>
      </SafeAreaView>

      <BottomSheet
        index={sheetIndex}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        handleComponent={PlayerSheetHandle}
        backgroundStyle={styles.sheetBackground}
        onChange={setSheetIndex}
      >
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.sheetContent,
            { paddingBottom: bottomInset > 0 ? bottomInset + 20 : 28 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {sheetMode === 'queue' ? (
            <View>
              <View style={styles.queueHeader}>
                <ThemedText style={styles.queueEyebrow}>
                  {playlistTracks?.length ? 'Playlist tracks' : 'Suggested tracks'}
                </ThemedText>
                <ThemedText style={styles.queueHeaderTitle} numberOfLines={1}>
                  {playlistName ?? 'Up Next'}
                </ThemedText>
                <ThemedText style={styles.queueHeaderMeta} numberOfLines={1}>
                  {playlistTracks?.length ? `${queueTracks.length} tracks` : 'Picked for this session'}
                </ThemedText>
              </View>

              {isQueuePending && !!playlistId ? (
                <View style={styles.queueLoading}>
                  <ActivityIndicator size="small" color="#fff" />
                </View>
              ) : (
                <View style={styles.queueList}>
                  {queueTracks.map((track) => (
                    <QueueTrackItem key={track.id} track={track} />
                  ))}
                </View>
              )}
            </View>
          ) : (
            <View>
              <View style={styles.sheetHeaderRow}>
                <TouchableOpacity style={styles.sheetIconBtn}>
                  <Ionicons name="bookmark-outline" size={22} color="#fff" />
                </TouchableOpacity>

                {artworkUrl ? (
                  <Image source={{ uri: artworkUrl }} style={styles.sheetArtwork} resizeMode="cover" />
                ) : (
                  <View
                    style={[
                      styles.sheetArtwork,
                      styles.sheetArtworkPlaceholder,
                      { backgroundColor: bgColor },
                    ]}
                  >
                    <Ionicons name="musical-notes" size={26} color="rgba(255,255,255,0.5)" />
                  </View>
                )}

                <TouchableOpacity style={styles.sheetIconBtn}>
                  <Ionicons name="arrow-redo-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>

              <ThemedText style={styles.sheetTrackTitle} numberOfLines={2}>
                {trackTitle ?? 'Unknown Track'}
              </ThemedText>
              <ThemedText style={styles.sheetTrackMeta} numberOfLines={1}>
                {trackArtist ?? 'Unknown Artist'} {' • '} {fmt(total)}
              </ThemedText>

              <View style={styles.sheetActionList}>
                {PLAYER_ACTIONS.map((action) => (
                  <TouchableOpacity key={action.label} style={styles.sheetActionRow} activeOpacity={0.8}>
                    <Ionicons name={action.icon} size={22} color="#fff" />
                    <ThemedText style={styles.sheetActionLabel}>{action.label}</ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>

      {bottomInset > 0 && (
        <View
          pointerEvents="none"
          style={[styles.systemNavigationScrim, { height: bottomInset }]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    flex: 1,
  },
  handleArea: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 4,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  nowPlaying: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 40,
    marginBottom: 4,
  },
  mainContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 48,
    marginTop: 24,
  },
  artworkWrapper: {
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 14,
  },
  artwork: {
    width: 220,
    height: 220,
    borderRadius: 16,
  },
  artworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  trackArtist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginBottom: 18,
  },
  bookmarkRow: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
    paddingRight: 4,
  },
  bookmarkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 28,
    marginTop: 8,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  seekContainer: {
    width: '100%',
  },
  seekBar: {
    position: 'relative',
    height: 20,
    justifyContent: 'center',
  },
  seekTrackBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  seekFill: {
    position: 'absolute',
    left: 0,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  seekThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    top: 4,
    transform: [{ translateX: -6 }],
  },
  seekTimes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  seekTime: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  musicListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 28,
  },
  musicListText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  sheetBackground: {
    backgroundColor: '#000',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  sheetHandle: {
    width: SHEET_HANDLE_OPEN_WIDTH,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
  sheetContent: {
    paddingHorizontal: 14,
    paddingTop: 8,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetArtwork: {
    width: 56,
    height: 56,
    borderRadius: 10,
  },
  sheetArtworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetTrackTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  sheetTrackMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  sheetActionList: {
    gap: 10,
  },
  sheetActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#242424',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sheetActionLabel: {
    fontSize: 16,
    color: '#fff',
  },
  queueHeader: {
    paddingTop: 4,
    paddingBottom: 10,
  },
  queueEyebrow: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  queueHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  queueHeaderMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 4,
  },
  queueLoading: {
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  queueList: {
    marginTop: 4,
  },
  queueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  queueArtworkShell: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  queueArtwork: {
    width: '100%',
    height: '100%',
  },
  queuePlayIcon: {
    marginLeft: 3,
  },
  queueInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  queueTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  queueArtist: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 3,
  },
  queueRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  queueNow: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
  },
  queueMoreBtn: {
    padding: 4,
  },
  systemNavigationScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
});
