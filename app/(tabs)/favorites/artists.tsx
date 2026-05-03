import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoritesCategoryPlaceholder } from '@/components/favorites-category-placeholder';
import { ThemedText } from '@/components/themed-text';
import { useFavoriteArtists } from '@/hooks/use-favorite-artists';
import { getFavoriteArtist } from '@/lib/favorite-artists';

function formatArtistMeta(trackCount: number, albumCount: number) {
  const albumLabel = albumCount === 1 ? 'album' : 'albums';
  return `${trackCount} tracks · ${albumCount} ${albumLabel}`;
}

export default function FavoriteArtistsScreen() {
  const { data, isPending, isError } = useFavoriteArtists();

  if (!isPending && !isError && data.length === 0) {
    return (
      <FavoritesCategoryPlaceholder
        title="Artists"
        message="Add artists from their detail screen to keep them here for quick access."
        icon="person"
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <ThemedText style={styles.headerTitle}>Artists</ThemedText>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {isPending && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {isError && (
          <View style={styles.centered}>
            <ThemedText style={styles.errorText}>Failed to load artists. Please try again.</ThemedText>
          </View>
        )}

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {data.map((item) => {
            const staticArtist = getFavoriteArtist(item.id);

            return (
              <TouchableOpacity
                key={item.id}
                style={styles.row}
                activeOpacity={0.78}
                onPress={() =>
                  router.push({
                    pathname: '/artist/[id]',
                    params: {
                      id: item.id,
                      name: item.name,
                      handle: item.handle,
                      bio: item.description,
                      avatarUrl: item.avatarUrl,
                      coverUrl: item.coverUrl,
                      followerCount: String(item.followerCount),
                      trackCount: String(item.trackCount),
                      albumCount: String(item.albumCount),
                      playlistCount: String(item.playlistCount),
                      verified: item.verified ? '1' : '0',
                      location: item.location,
                      website: item.website,
                    },
                  })
                }
              >
                <View style={[styles.avatar, { backgroundColor: item.color }]}> 
                  {item.avatarUrl ? (
                    <Image source={{ uri: item.avatarUrl }} style={styles.avatarImage} contentFit="cover" />
                  ) : staticArtist ? (
                    <View style={styles.avatarFallbackInner} />
                  ) : null}
                </View>

                <View style={styles.rowContent}>
                  <ThemedText style={styles.artistName} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={styles.artistMeta} numberOfLines={1}>
                    {formatArtistMeta(item.trackCount, item.albumCount)}
                  </ThemedText>
                </View>

                <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                  <MaterialIcons name="more-horiz" size={20} color="rgba(255,255,255,0.62)" />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 18,
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
  listContent: {
    paddingTop: 10,
    paddingBottom: 220,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginRight: 14,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarFallbackInner: {
    flex: 1,
    margin: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  artistName: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  artistMeta: {
    marginTop: 4,
    fontSize: 14,
    color: 'rgba(255,255,255,0.52)',
  },
  moreButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});