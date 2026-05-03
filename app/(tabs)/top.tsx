import { router } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlaylistCard } from '@/components/playlist-card';
import { ThemedText } from '@/components/themed-text';
import { useFavoritePlaylists } from '@/hooks/use-favorite-playlists';
import { useTrendingPlaylists } from '@/hooks/use-playlists';
import { type AudiusPlaylist } from '@/lib/audius';
import { buildFavoritePlaylistMeta, createFavoritePlaylistInput } from '@/lib/favorite-playlists';

// Rotating palette for cards since the API doesn't provide color data
const CARD_COLORS: [string, string][] = [
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

export default function TopScreen() {
  const { data, isPending, isError } = useTrendingPlaylists({ time: 'week', limit: 20 });
  const { favoriteIds, isBookmarkPending, toggleFavoritePlaylist } = useFavoritePlaylists();

  async function handleToggleFavorite(index: number, playlist: AudiusPlaylist) {
    const favoritePlaylist = createFavoritePlaylistInput(playlist, getCardColors(index));

    try {
      await toggleFavoritePlaylist(favoritePlaylist);
    } catch {
      Alert.alert('Bookmark failed', 'Unable to update this playlist bookmark right now.');
    }
  }

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
          const favoritePlaylist = createFavoritePlaylistInput(playlist, getCardColors(index));
          return (
            <PlaylistCard
              key={playlist.id}
              name={favoritePlaylist.playlistName}
              meta={buildFavoritePlaylistMeta(playlist)}
              colors={[favoritePlaylist.color]}
              accent={favoritePlaylist.accent}
              isBookmarked={favoriteIds.has(playlist.id)}
              bookmarkDisabled={isBookmarkPending(playlist.id)}
              onToggleBookmark={() => void handleToggleFavorite(index, playlist)}
              onPress={() =>
                router.push({
                  pathname: '/playlist/[id]',
                  params: {
                    id: playlist.id,
                    name: favoritePlaylist.playlistName,
                    color: favoritePlaylist.color,
                    accent: favoritePlaylist.accent,
                    artworkUrl: favoritePlaylist.artworkUrl,
                    trackCount: favoritePlaylist.trackCount,
                    totalPlayCount: favoritePlaylist.totalPlayCount,
                    description: favoritePlaylist.description,
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
