import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { usePlaylistTracks } from '@/hooks/use-playlists';
import { type AudiusTrack } from '@/lib/audius';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type TrackItemProps = {
  track: AudiusTrack;
  index: number;
};

function TrackItem({ track, index }: TrackItemProps) {
  return (
    <View style={styles.trackRow}>
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
    </View>
  );
}

export default function PlaylistDetailScreen() {
  const { id, name, color, artworkUrl, trackCount } = useLocalSearchParams<{
    id: string;
    name: string;
    color: string;
    artworkUrl: string;
    trackCount: string;
  }>();

  const gradientTop = color ?? '#8B0000';
  const gradientBottom = '#000000';

  const { data: tracks, isPending, isError } = usePlaylistTracks(id);

  const displayTrackCount = tracks?.length ?? Number(trackCount ?? 0);

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
        <ThemedText style={styles.playlistMeta}>
          {displayTrackCount > 0 ? `${displayTrackCount} tracks` : 'Loading…'}
        </ThemedText>

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
          renderItem={({ item, index }) => <TrackItem track={item} index={index} />}
          contentContainerStyle={styles.trackList}
          showsVerticalScrollIndicator={false}
        />
      )}
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
});
