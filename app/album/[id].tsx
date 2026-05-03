import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getFavoriteAlbum, type FavoriteAlbumTrack } from '@/lib/favorite-albums';

function AlbumTrackRow({ track, index }: { track: FavoriteAlbumTrack; index: number }) {
  return (
    <TouchableOpacity style={styles.trackRow} activeOpacity={0.78}>
      <View style={styles.trackNumberWrap}>
        <ThemedText style={styles.trackNumber}>{index + 1}</ThemedText>
      </View>

      <View style={styles.trackInfo}>
        <ThemedText style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </ThemedText>
        <ThemedText style={styles.trackArtist} numberOfLines={1}>
          {track.artist}
        </ThemedText>
      </View>

      <View style={styles.trackActions}>
        {track.explicit ? <ThemedText style={styles.explicitBadge}>E</ThemedText> : null}
        {track.isCurrent ? <ThemedText style={styles.nowLabel}>NOW</ThemedText> : null}
        <TouchableOpacity style={styles.moreButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.65)" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const album = getFavoriteAlbum(id ?? '');

  if (!album) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.missingState}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.missingTitle}>Album not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[album.color, 'rgba(255,255,255,0.18)', '#050505', '#000000']}
        locations={[0, 0.38, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <FlatList
          data={album.tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <AlbumTrackRow track={item} index={index} />}
          ListHeaderComponent={
            <>
              <View style={styles.header}>
                <TouchableOpacity style={styles.headerButton} activeOpacity={0.7} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
                  <Ionicons name="ellipsis-horizontal" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={[styles.artwork, { backgroundColor: album.color }]} />

              <View style={styles.heroText}>
                <ThemedText style={styles.albumName}>{album.title}</ThemedText>
                <ThemedText style={styles.albumMeta}>{album.artist} · {album.year}</ThemedText>
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8}>
                  <Ionicons name="arrow-redo-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.playAction} activeOpacity={0.85}>
                  <Ionicons name="play" size={28} color="#0C63B8" style={styles.playIcon} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8}>
                  <Ionicons name="bookmark-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 22,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
  },
  headerButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artwork: {
    width: 176,
    height: 176,
    borderRadius: 18,
    alignSelf: 'center',
    marginTop: 12,
  },
  heroText: {
    alignItems: 'center',
    marginTop: 18,
  },
  albumName: {
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  albumMeta: {
    marginTop: 4,
    fontSize: 17,
    color: 'rgba(255,255,255,0.82)',
    textAlign: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    marginTop: 24,
    marginBottom: 26,
  },
  secondaryAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playAction: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1493FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 4,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  trackNumberWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  trackNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  trackArtist: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(255,255,255,0.62)',
  },
  trackActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  explicitBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    borderRadius: 4,
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 1,
    marginRight: 10,
  },
  nowLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.52)',
    marginRight: 8,
  },
  moreButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingState: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  missingTitle: {
    marginTop: 32,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});