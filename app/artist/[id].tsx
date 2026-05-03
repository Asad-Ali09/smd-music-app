import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getFavoriteArtist, type FavoriteArtistRelease } from '@/lib/favorite-artists';

function ReleaseCard({ release }: { release: FavoriteArtistRelease }) {
  return (
    <TouchableOpacity style={styles.releaseCard} activeOpacity={0.82}>
      <View style={[styles.releaseArtwork, { backgroundColor: release.color }]} />
      <View style={styles.releaseTextBlock}>
        <View style={styles.releaseTitleRow}>
          <ThemedText style={styles.releaseTitle} numberOfLines={1}>
            {release.title}
          </ThemedText>
          {release.explicit ? <ThemedText style={styles.explicitBadge}>E</ThemedText> : null}
        </View>
        <ThemedText style={styles.releaseArtist} numberOfLines={1}>
          {release.artist}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function ArtistDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const artist = getFavoriteArtist(id ?? '');

  if (!artist) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.missingState}>
          <TouchableOpacity style={styles.headerButton} activeOpacity={0.7} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.missingTitle}>Artist not found</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[artist.accent, '#5B1526', '#080808', '#000000']}
        locations={[0, 0.4, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.heroSpacer} />

          <View style={styles.bookmarkShell}>
            <Ionicons name="bookmark" size={22} color="#101010" />
          </View>

          <View style={styles.titleBlock}>
            <ThemedText style={styles.artistName}>{artist.name}</ThemedText>
            <ThemedText style={styles.artistMeta}>
              {artist.trackCount} tracks . {artist.albumCount} albums
            </ThemedText>
          </View>

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>New releases</ThemedText>
            <TouchableOpacity style={styles.viewAllButton} activeOpacity={0.78}>
              <ThemedText style={styles.viewAllText}>View All</ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.releaseList}
          >
            {artist.releases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </ScrollView>
        </ScrollView>
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
    paddingHorizontal: 18,
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
  heroSpacer: {
    height: 240,
  },
  bookmarkShell: {
    alignSelf: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    alignItems: 'center',
    marginTop: 12,
  },
  artistName: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  artistMeta: {
    marginTop: 4,
    fontSize: 15,
    color: 'rgba(255,255,255,0.64)',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  viewAllButton: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  releaseList: {
    paddingRight: 18,
  },
  releaseCard: {
    width: 156,
    marginRight: 14,
  },
  releaseArtwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 14,
  },
  releaseTextBlock: {
    marginTop: 10,
  },
  releaseTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  releaseTitle: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  explicitBadge: {
    marginLeft: 6,
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  releaseArtist: {
    marginTop: 2,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
  missingState: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 18,
    paddingTop: 6,
  },
  missingTitle: {
    marginTop: 32,
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});