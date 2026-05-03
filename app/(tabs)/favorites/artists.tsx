import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
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
  const { data, isPending, isError, toggleFavoriteArtist } = useFavoriteArtists();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onScrollBeginDrag={() => setOpenMenuId(null)}
          renderItem={({ item }) => {
            const staticArtist = getFavoriteArtist(item.id);

            return (
              <TouchableOpacity
                style={[styles.row, openMenuId === item.id && styles.rowMenuOpen]}
                activeOpacity={0.78}
                onPress={() => {
                  setOpenMenuId(null);
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
                  });
                }}
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

                <View style={styles.trackRight}>
                  <TouchableOpacity
                    style={styles.moreButton}
                    activeOpacity={0.7}
                    hitSlop={8}
                    onPress={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((cur) => (cur === item.id ? null : item.id));
                    }}
                  >
                    <MaterialIcons name="more-horiz" size={20} color="rgba(255,255,255,0.62)" />
                  </TouchableOpacity>

                  {openMenuId === item.id && (
                    <Pressable style={styles.trackMenu} onPress={() => {}}>
                      <TouchableOpacity
                        style={styles.trackMenuItem}
                        activeOpacity={0.75}
                        onPress={() => {
                          const artist = item;
                          setOpenMenuId(null);
                          toggleFavoriteArtist(artist);
                        }}
                      >
                        <ThemedText style={styles.trackMenuText}>Remove from favorites</ThemedText>
                      </TouchableOpacity>
                    </Pressable>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />
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
  rowMenuOpen: {
    zIndex: 10,
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
  trackRight: {
    position: 'relative',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  moreButton: {
    padding: 2,
  },
  trackMenu: {
    position: 'absolute',
    top: 26,
    right: -6,
    minWidth: 154,
    borderRadius: 14,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  trackMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trackMenuText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});