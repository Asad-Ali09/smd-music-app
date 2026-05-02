import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaylistCard } from '@/components/playlist-card';
import { ThemedText } from '@/components/themed-text';

const PLAYLISTS = [
  { id: '1', name: 'Renaissance', tracks: 843, hours: 23, color: '#4CAF50', accent: '#5D3A2A' },
  { id: '2', name: 'Renaissance', tracks: 843, hours: 23, color: '#4CAF50', accent: '#5D3A2A' },
  { id: '3', name: 'Urgent Siege', tracks: 843, hours: 23, color: '#E53935', accent: '#B71C1C' },
  { id: '4', name: 'Night Drive', tracks: 512, hours: 14, color: '#1E88E5', accent: '#0D47A1' },
  { id: '5', name: 'Chill Vibes', tracks: 320, hours: 9, color: '#8E24AA', accent: '#4A148C' },
];

export default function TopScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedText style={styles.heading}>Top Playlists</ThemedText>
        {PLAYLISTS.map((playlist) => (
          <PlaylistCard
            key={playlist.id}
            name={playlist.name}
            meta={`${playlist.tracks} tracks • ${playlist.hours} hours`}
            colors={[playlist.color]}
            accent={playlist.accent}
          />
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
});
