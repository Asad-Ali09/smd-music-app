import { LinearGradient } from 'expo-linear-gradient';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';

const NEW_RELEASES = [
  { id: '1', title: 'Urgent Siege', tag: 'E', color: '#F5A623' },
  { id: '2', title: 'Urgent Siege', tag: null, color: '#4CAF8A' },
  { id: '3', title: 'Night Drive', tag: 'E', color: '#6B4FBB' },
  { id: '4', title: 'Solar Winds', tag: null, color: '#E84C3C' },
  { id: '5', title: 'Echo Chamber', tag: 'E', color: '#3A8FC1' },
];

const FEATURED_PLAYLISTS = [
  { id: '1', title: 'Chill Vibes', tracks: '24 tracks', colors: ['#1DB954', '#157A38'] },
  { id: '2', title: 'Late Night', tracks: '18 tracks', colors: ['#6B4FBB', '#3E2A7A'] },
  { id: '3', title: 'Workout Mix', tracks: '32 tracks', colors: ['#E84C3C', '#9B2020'] },
];

const TOP_CHARTS = [
  { id: '1', rank: 1, title: 'Midnight Rain', artist: 'Luna Ray' },
  { id: '2', rank: 2, title: 'Golden Hour', artist: 'The Sunsets' },
  { id: '3', rank: 3, title: 'Electric Feel', artist: 'Nova Pulse' },
  { id: '4', rank: 4, title: 'Starfall', artist: 'Cosmo & The Wave' },
  { id: '5', rank: 5, title: 'Blue Horizon', artist: 'Drift' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero header */}
      <LinearGradient
        colors={['#1A5C55', '#0D2B28', '#0A0A0A']}
        style={styles.hero}
      >
        {/* Avatar */}
        <View style={styles.avatarWrapper}>
          <View style={styles.avatar} />
        </View>

        <View style={styles.heroContent}>
          <ThemedText style={styles.heroTitle}>
            Listen to music{'\n'}without restrictions
          </ThemedText>

          <TouchableOpacity style={styles.trialButton} activeOpacity={0.85}>
            <ThemedText style={styles.trialButtonText}>Trial version</ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.trialMeta}>
            Free for 3 months, then $12 a month
          </ThemedText>
        </View>
      </LinearGradient>

      {/* New releases */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>New releases</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={NEW_RELEASES}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.releaseCard, { backgroundColor: item.color }]}
              activeOpacity={0.85}
            >
              <View style={styles.releaseCardBottom}>
                <ThemedText style={styles.releaseTitle}>{item.title}</ThemedText>
                {item.tag && (
                  <View style={styles.tagBadge}>
                    <ThemedText style={styles.tagText}>{item.tag}</ThemedText>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Featured playlists */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Featured playlists</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {FEATURED_PLAYLISTS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.playlistRow} activeOpacity={0.85}>
            <LinearGradient
              colors={item.colors as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.playlistThumb}
            />
            <View style={styles.playlistInfo}>
              <ThemedText style={styles.playlistTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.playlistMeta}>{item.tracks}</ThemedText>
            </View>
            <ThemedText style={styles.playlistArrow}>›</ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Top charts */}
      <View style={[styles.section, styles.sectionLast]}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Top charts</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {TOP_CHARTS.map((item) => (
          <TouchableOpacity key={item.id} style={styles.chartRow} activeOpacity={0.85}>
            <ThemedText style={styles.chartRank}>{item.rank}</ThemedText>
            <View style={styles.chartThumb} />
            <View style={styles.chartInfo}>
              <ThemedText style={styles.chartTitle}>{item.title}</ThemedText>
              <ThemedText style={styles.chartArtist}>{item.artist}</ThemedText>
            </View>
            <TouchableOpacity style={styles.chartPlayBtn}>
              <View style={styles.chartPlayTriangle} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },

  /* Hero */
  hero: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    alignItems: 'flex-end',
    marginBottom: 80,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F5A623',
  },
  heroContent: {
    alignItems: 'center',
    gap: 16,
    marginTop: 40,
    paddingTop: 40
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 36,
  },
  trialButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 60,
  },
  trialButtonText: {
    color: '#0A0A0A',
    fontSize: 16,
    fontWeight: '600',
  },
  trialMeta: {
    color: '#8A8A8A',
    fontSize: 13,
    textAlign: 'center',
  },

  /* Section */
  section: {
    paddingTop: 28,
    paddingHorizontal: 20,
  },
  sectionLast: {
    paddingBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewAll: {
    fontSize: 13,
    color: '#FFFFFF',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
  },

  /* New releases */
  horizontalList: {
    gap: 12,
  },
  releaseCard: {
    width: 150,
    height: 180,
    borderRadius: 16,
    justifyContent: 'flex-end',
    padding: 12,
  },
  releaseCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  releaseTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    flexShrink: 1,
  },
  tagBadge: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  /* Featured playlists */
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 14,
  },
  playlistThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
  },
  playlistInfo: {
    flex: 1,
    gap: 4,
  },
  playlistTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  playlistMeta: {
    color: '#8A8A8A',
    fontSize: 13,
  },
  playlistArrow: {
    color: '#8A8A8A',
    fontSize: 24,
    lineHeight: 24,
  },

  /* Top charts */
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2A2A2A',
  },
  chartRank: {
    color: '#8A8A8A',
    fontSize: 15,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  chartThumb: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  chartInfo: {
    flex: 1,
    gap: 3,
  },
  chartTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  chartArtist: {
    color: '#8A8A8A',
    fontSize: 13,
  },
  chartPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartPlayTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: '#FFFFFF',
    marginLeft: 2,
  },
});
