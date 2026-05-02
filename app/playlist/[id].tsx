import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { usePlaylistTracks } from '@/hooks/use-playlists';
import { type AudiusTrack } from '@/lib/audius';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTotalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} hr ${minutes > 0 ? `${minutes} min` : ''}`.trim();
  return `${minutes} min`;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = Math.min(SCREEN_HEIGHT * 0.65, 500);
const PEEK_HEIGHT = 52;

type TrackItemProps = {
  track: AudiusTrack;
  index: number;
  onPress: () => void;
};

function TrackItem({ track, index, onPress }: TrackItemProps) {
  return (
    <TouchableOpacity style={styles.trackRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.trackIndex}>
        <ThemedText style={styles.trackIndexText}>{index + 1}</ThemedText>
      </View>
      <View style={styles.trackInfo}>
        <ThemedText style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </ThemedText>
        <ThemedText style={styles.trackArtist} numberOfLines={1}>
          {track.user?.name ?? 'Unknown Artist'}
        </ThemedText>
      </View>
      <View style={styles.trackRight}>
        <ThemedText style={styles.trackDuration}>
          {formatDuration(track.duration)}
        </ThemedText>
        <TouchableOpacity style={styles.trackMore} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function PlaylistDetailScreen() {
  const { id, name, color, artworkUrl, trackCount, description } = useLocalSearchParams<{
    id: string;
    name: string;
    color: string;
    artworkUrl: string;
    trackCount: string;
    description: string;
  }>();

  const gradientTop = color ?? '#8B0000';
  const gradientBottom = '#000000';

  const { data: tracks, isPending, isError } = usePlaylistTracks(id);

  const displayTrackCount = tracks?.length ?? Number(trackCount ?? 0);
  const totalSeconds = tracks?.reduce((sum, t) => sum + t.duration, 0) ?? 0;
  const metaLabel = displayTrackCount > 0
    ? `${displayTrackCount} tracks${totalSeconds > 0 ? ` • ${formatTotalDuration(totalSeconds)}` : ''}`
    : 'Loading…';

  // Bottom sheet
  const translateY = useSharedValue(SHEET_HEIGHT - PEEK_HEIGHT);
  const startY = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = Math.max(
        0,
        Math.min(SHEET_HEIGHT - PEEK_HEIGHT, startY.value + e.translationY),
      );
    })
    .onEnd((e) => {
      const midpoint = (SHEET_HEIGHT - PEEK_HEIGHT) / 2;
      if (e.velocityY < -500 || translateY.value < midpoint) {
        translateY.value = withSpring(0, { damping: 50 });
      } else {
        translateY.value = withSpring(SHEET_HEIGHT - PEEK_HEIGHT, { damping: 50 });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const progress = 1 - translateY.value / (SHEET_HEIGHT - PEEK_HEIGHT);
    return { opacity: Math.max(0, Math.min(0.55, progress * 0.55)) };
  });

  return (
    <View style={styles.root}>
      {/* Gradient background */}
      <LinearGradient
        colors={[gradientTop, gradientBottom]}
        locations={[0, 0.55]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Artwork */}
        <View style={styles.artworkWrapper}>
          {artworkUrl ? (
            <Image
              source={{ uri: artworkUrl }}
              style={styles.artwork}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]}>
              <Ionicons name="musical-notes" size={64} color="rgba(255,255,255,0.4)" />
            </View>
          )}
        </View>

        {/* Playlist info */}
        <ThemedText style={styles.playlistName}>{name}</ThemedText>
        <ThemedText style={styles.playlistMeta}>{metaLabel}</ThemedText>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="arrow-redo-outline" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn}>
            <Ionicons name="play" size={30} color="#000" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="bookmark-outline" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Track list */}
      {isPending && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>Failed to load tracks.</ThemedText>
        </View>
      )}

      {tracks && (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TrackItem
              track={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: '/player',
                  params: {
                    trackTitle: item.title,
                    trackArtist: item.user?.name ?? 'Unknown Artist',
                    trackDuration: String(item.duration),
                    artworkUrl: item.artwork?.['480x480'] ?? artworkUrl ?? '',
                    playlistName: name ?? '',
                    color: gradientTop,
                  },
                })
              }
            />
          )}
          contentContainerStyle={styles.trackList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Backdrop */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.backdrop, backdropStyle]}
        pointerEvents="none"
      />

      {/* Bottom sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, { height: SHEET_HEIGHT }, sheetStyle]}>
          {/* Drag handle */}
          <View style={styles.sheetHandle} />

          {/* Header row: bookmark | artwork | share */}
          <View style={styles.sheetHeaderRow}>
            <TouchableOpacity style={styles.sheetIconBtn}>
              <Ionicons name="bookmark-outline" size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.sheetArtworkWrapper}>
              {artworkUrl ? (
                <Image
                  source={{ uri: artworkUrl }}
                  style={styles.sheetArtwork}
                  contentFit="cover"
                />
              ) : (
                <View style={[styles.sheetArtwork, { backgroundColor: gradientTop, alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.5)" />
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.sheetIconBtn}>
              <Ionicons name="arrow-redo-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Playlist name & meta */}
          <ThemedText style={styles.sheetName}>{name}</ThemedText>
          <ThemedText style={styles.sheetMeta}>{metaLabel}</ThemedText>

          {/* Description */}
          <ScrollView
            style={styles.sheetDescScroll}
            showsVerticalScrollIndicator={false}
            scrollEnabled
          >
            <ThemedText style={description ? styles.sheetDescription : styles.sheetDescriptionEmpty}>
              {description || 'No description available.'}
            </ThemedText>
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const ARTWORK_SIZE = 160;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 18,
  },
  artworkWrapper: {
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: ARTWORK_SIZE / 2,
  },
  artworkPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  playlistMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  trackIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  trackIndexText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  trackInfo: {
    flex: 1,
    marginRight: 8,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  trackArtist: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  trackRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  trackDuration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  trackMore: {
    padding: 2,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 15,
    textAlign: 'center',
  },
  // ── Bottom sheet ──────────────────────────────────────────
  backdrop: {
    backgroundColor: '#000',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 10
  },
  sheetIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetArtworkWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetArtwork: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  sheetName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  sheetMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  sheetDescScroll: {
    flex: 1,
  },
  sheetDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
    textAlign: 'center',
  },
  sheetDescriptionEmpty: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
