import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FAVORITE_ARTISTS } from '@/lib/favorite-artists';

function formatArtistMeta(trackCount: number, albumCount: number) {
  const albumLabel = albumCount === 1 ? 'album' : 'albums';
  return `${trackCount} tracks · ${albumCount} ${albumLabel}`;
}

export default function FavoriteArtistsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Artists</Text>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={FAVORITE_ARTISTS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.78}
              onPress={() =>
                router.push({
                  pathname: '/artist/[id]',
                  params: { id: item.id },
                })
              }
            >
              <View style={[styles.avatar, { backgroundColor: item.color }]} />

              <View style={styles.rowContent}>
                <Text style={styles.artistName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.artistMeta} numberOfLines={1}>
                  {formatArtistMeta(item.trackCount, item.albumCount)}
                </Text>
              </View>

              <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                <MaterialIcons name="more-horiz" size={20} color="rgba(255,255,255,0.62)" />
              </TouchableOpacity>
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