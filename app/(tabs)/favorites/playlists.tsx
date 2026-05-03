import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoritesCategoryPlaceholder } from '@/components/favorites-category-placeholder';
import { PlaylistCard } from '@/components/playlist-card';
import { ThemedText } from '@/components/themed-text';
import { useFavoritePlaylists } from '@/hooks/use-favorite-playlists';

export default function FavoritePlaylistsScreen() {
  const { data, isPending, isError, toggleFavoritePlaylist, favoriteIds, isBookmarkPending } =
    useFavoritePlaylists();

  async function handleToggleFavorite(playlist: (typeof data)[number]) {
    try {
      await toggleFavoritePlaylist(playlist);
    } catch {
      Alert.alert('Bookmark failed', 'Unable to update this playlist bookmark right now.');
    }
  }

  if (!isPending && !isError && data.length === 0) {
    return (
      <FavoritesCategoryPlaceholder
        title="Playlists"
        message="Bookmark playlists from the Top tab to keep them here for quick access."
        icon="queue-music"
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>Playlists</ThemedText>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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

        {data.map((playlist) => {
          return (
            <PlaylistCard
              key={playlist.id}
              name={playlist.playlistName}
              meta={playlist.meta}
              colors={[playlist.color]}
              accent={playlist.accent}
              isBookmarked={favoriteIds.has(playlist.id)}
              bookmarkDisabled={isBookmarkPending(playlist.id)}
              onToggleBookmark={() => void handleToggleFavorite(playlist)}
              onPress={() =>
                router.push({
                  pathname: '/playlist/[id]',
                  params: {
                    id: playlist.id,
                    name: playlist.playlistName,
                    color: playlist.color,
                    accent: playlist.accent,
                    artworkUrl: playlist.artworkUrl,
                    trackCount: playlist.trackCount,
                    totalPlayCount: playlist.totalPlayCount,
                    description: playlist.description,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFFFFF',
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