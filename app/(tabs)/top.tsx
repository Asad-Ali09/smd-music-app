import { Image } from 'expo-image';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';

const PLAYLISTS = [
  { id: '1', name: 'Renaissance', tracks: 843, hours: 23, color: '#4CAF50', accent: '#5D3A2A' },
  { id: '2', name: 'Renaissance', tracks: 843, hours: 23, color: '#4CAF50', accent: '#5D3A2A' },
  { id: '3', name: 'Urgent Siege', tracks: 843, hours: 23, color: '#E53935', accent: '#B71C1C' },
  { id: '4', name: 'Night Drive', tracks: 512, hours: 14, color: '#1E88E5', accent: '#0D47A1' },
  { id: '5', name: 'Chill Vibes', tracks: 320, hours: 9, color: '#8E24AA', accent: '#4A148C' },
];

function PlaylistCard({
  name,
  tracks,
  hours,
  color,
  accent,
}: {
  name: string;
  tracks: number;
  hours: number;
  color: string;
  accent: string;
}) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      {/* Decorative blob */}
      <View style={[styles.blob, { backgroundColor: accent }]} />

      {/* Bookmark icon */}
      <View style={styles.bookmarkContainer}>
        <Image
          source={require('@/assets/icons/bookmark.svg')}
          style={styles.bookmarkImage}
          contentFit="contain"
        />
      </View>

      {/* Text info */}
      <View style={styles.cardContent}>
        <ThemedText style={styles.playlistName}>{name}</ThemedText>
        <ThemedText style={styles.playlistMeta}>
          {tracks} tracks • {hours} hours
        </ThemedText>
      </View>

      {/* Play button */}
      <TouchableOpacity style={styles.playButton} activeOpacity={0.8}>
        <View style={styles.playTriangle} />
      </TouchableOpacity>
    </View>
  );
}

export default function TopScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedText style={styles.heading}>Top Playlists</ThemedText>
        {PLAYLISTS.map((playlist) => (
          <PlaylistCard key={playlist.id} {...playlist} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    paddingVertical: 28,
    marginBottom: 16,
  },
  card: {
    borderRadius: 16,
    height: 150,
    marginBottom: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 16,
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
  playlistName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  playlistMeta: {
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
