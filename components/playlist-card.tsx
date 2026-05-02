import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export type PlaylistCardProps = {
  name: string;
  meta: string;
  /** One color = solid background. Two colors = linear gradient. */
  colors: [string, ...string[]];
  /** Decorative blob color. When provided a blob and bookmark icon are shown. */
  accent?: string;
  onPress?: () => void;
};

export function PlaylistCard({ name, meta, colors, accent, onPress }: PlaylistCardProps) {
  const hasGradient = colors.length > 1;

  const inner = (
    <>
      {/* Decorative blob + bookmark — only when accent is provided */}
      {accent && (
        <>
          <View style={[styles.blob, { backgroundColor: accent }]} />
          <View style={styles.bookmarkContainer}>
            <Image
              source={require('@/assets/icons/bookmark.svg')}
              style={styles.bookmarkImage}
              contentFit="contain"
            />
          </View>
        </>
      )}

      {/* Text */}
      <View style={styles.cardContent}>
        <ThemedText style={styles.name}>{name}</ThemedText>
        <ThemedText style={styles.meta}>{meta}</ThemedText>
      </View>

      {/* Play button */}
      <TouchableOpacity style={styles.playButton} activeOpacity={0.8} onPress={onPress}>
        <View style={styles.playTriangle} />
      </TouchableOpacity>
    </>
  );

  if (hasGradient) {
    return (
      <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onPress}>
        <LinearGradient
          colors={colors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fill}
        >
          {inner}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      style={[styles.card, { backgroundColor: colors[0] }]}
      onPress={onPress}
    >
      {inner}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    height: 150,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'flex-end',
  },
  blob: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    top: -40,
    right: -20,
  },
  bookmarkContainer: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 10,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkImage: {
    width: 20,
    height: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  meta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  playButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 10,
    borderBottomWidth: 10,
    borderLeftWidth: 17,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#333',
    marginLeft: 4,
  },
});
