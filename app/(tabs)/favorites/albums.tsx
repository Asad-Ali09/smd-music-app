import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoritesCategoryPlaceholder } from '@/components/favorites-category-placeholder';
import { ThemedText } from '@/components/themed-text';
import { useFavoriteAlbums } from '@/hooks/use-favorite-albums';

export default function FavoriteAlbumsScreen() {
  const { data, isPending, isError } = useFavoriteAlbums();

  if (!isPending && !isError && data.length === 0) {
    return (
      <FavoritesCategoryPlaceholder
        title="Albums"
        message="Bookmark albums from their detail screen to keep them here for quick access."
        icon="album"
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

          <ThemedText style={styles.headerTitle}>Albums</ThemedText>

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
            <ThemedText style={styles.errorText}>Failed to load albums. Please try again.</ThemedText>
          </View>
        )}

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.78}
              onPress={() =>
                router.push({
                  pathname: '/album/[id]',
                  params: {
                    id: item.id,
                    title: item.title,
                    artist: item.artist,
                    artworkUrl: item.artworkUrl,
                    description: item.description,
                    color: item.color,
                    accent: item.accent,
                    trackCount: String(item.trackCount),
                    totalPlayCount: String(item.totalPlayCount),
                    explicit: item.explicit ? '1' : '0',
                    source: item.source,
                  },
                })
              }
            >
              <View style={[styles.artwork, { backgroundColor: item.color }]}> 
                {item.artworkUrl ? (
                  <Image source={{ uri: item.artworkUrl }} style={styles.artworkImage} contentFit="cover" />
                ) : null}
              </View>

              <View style={styles.rowContent}>
                <ThemedText style={styles.albumTitle} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.artist} numberOfLines={1}>
                  {item.artist}
                </ThemedText>
                <ThemedText style={styles.year} numberOfLines={1}>{item.meta}</ThemedText>
              </View>

              <View style={styles.actions}>
                {item.explicit ? (
                  <View style={styles.explicitBadge}>
                    <ThemedText style={styles.explicitBadgeText}>E</ThemedText>
                  </View>
                ) : null}
                <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                  <MaterialIcons name="more-horiz" size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
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
    paddingTop: 8,
    paddingBottom: 220,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  artwork: {
    width: 54,
    height: 54,
    borderRadius: 6,
    marginRight: 14,
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  albumTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  artist: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 2,
  },
  year: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.62)',
    marginTop: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  explicitBadge: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  explicitBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  moreButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});