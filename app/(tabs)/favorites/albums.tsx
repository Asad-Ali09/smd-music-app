import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FAVORITE_ALBUMS } from '@/lib/favorite-albums';

export default function FavoriteAlbumsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Albums</Text>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={FAVORITE_ALBUMS}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              activeOpacity={0.78}
              onPress={() =>
                router.push({
                  pathname: '/album/[id]',
                  params: { id: item.id },
                })
              }
            >
              <View style={[styles.artwork, { backgroundColor: item.color }]} />

              <View style={styles.rowContent}>
                <Text style={styles.albumTitle} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.artist} numberOfLines={1}>
                  {item.artist}
                </Text>
                <Text style={styles.year}>{item.year}</Text>
              </View>

              <View style={styles.actions}>
                {item.explicit ? (
                  <View style={styles.explicitBadge}>
                    <Text style={styles.explicitBadgeText}>E</Text>
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