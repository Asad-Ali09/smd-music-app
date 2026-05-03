import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FAVORITE_TRACKS } from '@/lib/favorite-tracks';

export default function FavoriteTracksScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Tracks</Text>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={FAVORITE_TRACKS}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <View style={styles.row}>
              <View style={styles.leftGroup}>
                <View style={styles.indexWrap}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>

                <View style={[styles.artwork, { backgroundColor: item.color }]} />

                <View style={styles.rowContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.explicit ? (
                      <View style={styles.explicitBadge}>
                        <Text style={styles.explicitText}>E</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={styles.artist} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <Text style={styles.duration}>{item.duration}</Text>
                <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
                  <MaterialIcons name="more-horiz" size={20} color="rgba(255,255,255,0.62)" />
                </TouchableOpacity>
              </View>
            </View>
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
    paddingTop: 8,
    paddingBottom: 220,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  leftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  indexWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  indexText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 14,
  },
  rowContent: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackTitle: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  explicitBadge: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  explicitText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  artist: {
    marginTop: 3,
    fontSize: 14,
    color: 'rgba(255,255,255,0.52)',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  duration: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginRight: 10,
  },
  moreButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});