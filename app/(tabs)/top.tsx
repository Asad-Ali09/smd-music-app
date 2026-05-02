import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaylistCard } from '@/components/playlist-card';
import { ThemedText } from '@/components/themed-text';
import { useTrendingPlaylists } from '@/hooks/use-playlists';
import { type AudiusPlaylist } from '@/lib/audius';

// Rotating palette for cards since the API doesn't provide color data
const CARD_COLORS: Array<[string, string]> = [
  ['#4CAF50', '#1B5E20'],
  ['#E53935', '#B71C1C'],
  ['#1E88E5', '#0D47A1'],
  ['#8E24AA', '#4A148C'],
  ['#F4511E', '#BF360C'],
  ['#00897B', '#004D40'],
  ['#FFB300', '#E65100'],
  ['#546E7A', '#263238'],
];

function getCardColors(index: number): { color: string; accent: string } {
  const [color, accent] = CARD_COLORS[index % CARD_COLORS.length];
  return { color, accent };
}

function buildMeta(playlist: AudiusPlaylist): string {
  const parts: string[] = [];
  if (playlist.track_count) parts.push(`${playlist.track_count} tracks`);
  if (playlist.total_play_count) {
    const plays =
      playlist.total_play_count >= 1000
        ? `${(playlist.total_play_count / 1000).toFixed(1)}k plays`
        : `${playlist.total_play_count} plays`;
    parts.push(plays);
  }
  return parts.join(' • ');
}

export default function TopScreen() {
  const { data, isPending, isError } = useTrendingPlaylists({ time: 'week', limit: 20 });

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <ThemedText style={styles.heading}>Top Playlists</ThemedText>

        {isPending && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {isError && (
          <View style={styles.centered}>
            <ThemedText style={styles.errorText}>Failed to load playlists. Please try again.</ThemedText>
          </View>
        )}

        {data?.map((playlist, index) => {
          const { color, accent } = getCardColors(index);
          return (
            <PlaylistCard
              key={playlist.id}
              name={playlist.playlist_name}
              meta={buildMeta(playlist)}
              colors={[color]}
              accent={accent}
              onPress={() =>
                router.push({
                  pathname: '/playlist/[id]',
                  params: {
                    id: playlist.id,
                    name: playlist.playlist_name,
                    color,
                    artworkUrl: playlist.artwork?.['480x480'] ?? '',
                    trackCount: playlist.track_count,
                  },
                })
              }
            />
          );
        })}
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
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 15,
    textAlign: 'center',
  },
});
