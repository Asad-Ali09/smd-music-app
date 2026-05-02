import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { usePlayer } from '@/context/player';

export function MiniPlayer() {
  const { currentTrack, isPlaying, isLoading, pause, resume, skipNext } = usePlayer();

  if (!currentTrack) return null;

  function handlePlayPause() {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }

  function handleOpen() {
    router.push({
      pathname: '/player',
      params: {
        trackId: currentTrack!.id,
        trackTitle: currentTrack!.title,
        trackArtist: currentTrack!.artist,
        trackDuration: String(currentTrack!.duration),
        artworkUrl: currentTrack!.artworkUrl ?? '',
        playlistName: currentTrack!.playlistName ?? '',
        color: currentTrack!.color ?? '#1a1a1a',
        playlistId: currentTrack!.playlistId ?? '',
      },
    });
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={handleOpen} activeOpacity={0.92}>
        {/* Artwork */}
        {currentTrack.artworkUrl ? (
          <Image
            source={{ uri: currentTrack.artworkUrl }}
            style={styles.artwork}
            resizeMode="cover"
          />
        ) : (
          <View
            style={[styles.artwork, styles.artworkPlaceholder, { backgroundColor: currentTrack.color ?? '#333' }]}
          >
            <Ionicons name="musical-notes" size={18} color="rgba(255,255,255,0.6)" />
          </View>
        )}

        {/* Track info */}
        <View style={styles.info}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </ThemedText>
          <ThemedText style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </ThemedText>
        </View>
      </TouchableOpacity>

      {/* Play/pause */}
      <TouchableOpacity
        onPress={handlePlayPause}
        hitSlop={12}
        style={styles.playBtn}
        disabled={isLoading}
      >
        <Ionicons
          name={isLoading ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
          size={22}
          color="#fff"
        />
      </TouchableOpacity>

      {/* Skip next */}
      <TouchableOpacity
        onPress={skipNext}
        hitSlop={12}
        style={styles.skipBtn}
      >
        <Ionicons name="play-skip-forward" size={20} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  artwork: {
    width: 42,
    height: 42,
    borderRadius: 6,
  },
  artworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  artist: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  playBtn: {
    padding: 4,
  },
  skipBtn: {
    padding: 4,
  },
});
