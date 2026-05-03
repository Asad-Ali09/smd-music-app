import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { usePlayer } from '@/context/player';

export function MiniPlayer() {
  const { width: windowWidth } = useWindowDimensions();
  const { currentTrack, isPlaying, isLoading, pause, resume, skipNext, stop } = usePlayer();
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const dismissThreshold = Math.min(windowWidth * 0.3, 140);
  const currentTrackId = currentTrack?.id ?? null;

  useEffect(() => {
    if (!currentTrackId) return;

    translateX.value = 0;
    opacity.value = 1;
  }, [currentTrackId, opacity, translateX]);

  const dismissPlayer = useCallback(() => {
    void stop();
  }, [stop]);

  function handlePlayPause() {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }

  function handleOpen() {
    if (!currentTrack) return;

    router.push({
      pathname: '/player',
      params: {
        trackId: currentTrack.id,
        trackTitle: currentTrack.title,
        trackArtist: currentTrack.artist,
        trackDuration: String(currentTrack.duration),
        artworkUrl: currentTrack.artworkUrl ?? '',
        localFileUri: currentTrack.localFileUri ?? '',
        playlistName: currentTrack.playlistName ?? '',
        color: currentTrack.color ?? '#1a1a1a',
        playlistId: currentTrack.playlistId ?? '',
      },
    });
  }

  const panGesture = Gesture.Pan()
    .activeOffsetX([-12, 12])
    .failOffsetY([-16, 16])
    .onUpdate((event) => {
      const nextTranslateX = event.translationX;
      translateX.value = nextTranslateX;
      opacity.value = 1 - Math.min(Math.abs(nextTranslateX) / dismissThreshold, 1) * 0.45;
    })
    .onEnd((event) => {
      const shouldDismiss = Math.abs(event.translationX) >= dismissThreshold || Math.abs(event.velocityX) >= 900;

      if (shouldDismiss) {
        const direction = event.translationX === 0 ? Math.sign(event.velocityX) || 1 : Math.sign(event.translationX);

        translateX.value = withTiming(direction * windowWidth, { duration: 180 });
        opacity.value = withTiming(0, { duration: 180 }, (finished) => {
          if (finished) {
            runOnJS(dismissPlayer)();
          }
        });
        return;
      }

      translateX.value = withSpring(0, {
        damping: 18,
        stiffness: 180,
      });
      opacity.value = withSpring(1, {
        damping: 18,
        stiffness: 180,
      });
    });

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  if (!currentTrack) return null;

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <TouchableOpacity style={styles.content} onPress={handleOpen} activeOpacity={0.92}>
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

          <View style={styles.info}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {currentTrack.title}
            </ThemedText>
            <ThemedText style={styles.artist} numberOfLines={1}>
              {currentTrack.artist}
            </ThemedText>
          </View>
        </TouchableOpacity>

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

        <TouchableOpacity
          onPress={skipNext}
          hitSlop={12}
          style={styles.skipBtn}
        >
          <Ionicons name="play-skip-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>
      </Animated.View>
    </GestureDetector>
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
