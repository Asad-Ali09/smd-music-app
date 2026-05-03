import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { usePlaylistSearch, useTrackSearch, useUserSearch } from '@/hooks/use-audius';
import { useTrendingPlaylists, useTrendingTracks } from '@/hooks/use-playlists';
import { type AudiusPlaylist, type AudiusTrack, type AudiusUser } from '@/lib/audius';

const SEARCH_SUGGESTIONS = ['house', 'afrobeats', 'ambient', 'drum & bass'];
const TRACK_ACCENTS = ['#FF7A59', '#32B67A', '#4D7CFE', '#D96AF6', '#F5A623'];
const PLAYLIST_GRADIENTS: [string, string][] = [
  ['#16826A', '#0B3D38'],
  ['#C84D2F', '#651F15'],
  ['#4D60FF', '#1A1F61'],
  ['#E4A92D', '#704E06'],
];
const ALBUM_GRADIENTS: [string, string][] = [
  ['#D65A3C', '#6D2216'],
  ['#8356D8', '#39225B'],
  ['#258A8E', '#113F49'],
  ['#B4972F', '#55420B'],
];
const PLAYLIST_SEARCH_LIMIT = 20;

function formatCompactNumber(value: number | undefined): string {
  if (!value) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getTrackArtwork(track: AudiusTrack): string {
  return track.artwork?.['480x480'] ?? track.artwork?.['150x150'] ?? '';
}

function getPlaylistArtwork(playlist: AudiusPlaylist): string {
  return playlist.artwork?.['480x480'] ?? playlist.artwork?.['150x150'] ?? playlist.cover_art ?? '';
}

function getUserAvatar(user: AudiusUser): string {
  return user.profile_picture?.['480x480'] ?? user.profile_picture?.['150x150'] ?? '';
}

function getUserCover(user: AudiusUser): string {
  return user.cover_photo?.['640x'] ?? user.cover_photo?.['2000x'] ?? '';
}

function buildArtistMeta(user: AudiusUser): string {
  const parts: string[] = [];

  if (user.follower_count) {
    parts.push(`${formatCompactNumber(user.follower_count)} followers`);
  }

  if (user.track_count) {
    parts.push(`${user.track_count} tracks`);
  }

  if (user.album_count) {
    parts.push(`${user.album_count} albums`);
  }

  return parts.join(' • ');
}

function buildCollectionMeta(playlist: AudiusPlaylist): string {
  const parts: string[] = [];

  if (playlist.user?.name) {
    parts.push(playlist.user.name);
  }

  if (playlist.track_count) {
    parts.push(`${playlist.track_count} tracks`);
  }

  if (playlist.total_play_count) {
    parts.push(`${formatCompactNumber(playlist.total_play_count)} plays`);
  }

  return parts.join(' • ');
}

function buildTrackMeta(track: AudiusTrack): string {
  const parts = [track.user?.name ?? 'Unknown Artist'];

  if (track.genre) {
    parts.push(track.genre);
  }

  if (track.play_count) {
    parts.push(`${formatCompactNumber(track.play_count)} plays`);
  }

  return parts.join(' • ');
}

function SectionHeader({
  title,
  actionLabel,
}: {
  title: string;
  actionLabel?: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {!!actionLabel && <ThemedText style={styles.sectionAction}>{actionLabel}</ThemedText>}
    </View>
  );
}

function ArtistResultCard({
  artist,
  onPress,
}: {
  artist: AudiusUser;
  onPress: () => void;
}) {
  const avatarUrl = getUserAvatar(artist);

  return (
    <TouchableOpacity style={styles.artistCard} activeOpacity={0.82} onPress={onPress}>
      <View style={styles.artistAvatarShell}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.artistAvatar} contentFit="cover" />
        ) : (
          <LinearGradient colors={['#274B46', '#10211F']} style={styles.artistAvatar} />
        )}
      </View>
      <ThemedText style={styles.artistName} numberOfLines={1}>
        {artist.name}
      </ThemedText>
      <ThemedText style={styles.artistHandle} numberOfLines={1}>
        @{artist.handle}
      </ThemedText>
    </TouchableOpacity>
  );
}

function CollectionCard({
  collection,
  colors,
  typeLabel,
  onPress,
}: {
  collection: AudiusPlaylist;
  colors: [string, string];
  typeLabel: string;
  onPress: () => void;
}) {
  const artworkUrl = getPlaylistArtwork(collection);

  return (
    <TouchableOpacity style={styles.collectionCard} activeOpacity={0.85} onPress={onPress}>
      {artworkUrl ? (
        <Image source={{ uri: artworkUrl }} style={styles.collectionArtwork} contentFit="cover" />
      ) : (
        <LinearGradient colors={colors} style={styles.collectionArtwork} />
      )}

      <View style={styles.collectionBody}>
        <View style={styles.typeBadge}>
          <ThemedText style={styles.typeBadgeText}>{typeLabel}</ThemedText>
        </View>
        <ThemedText style={styles.collectionTitle} numberOfLines={2}>
          {collection.playlist_name}
        </ThemedText>
        <ThemedText style={styles.collectionMeta} numberOfLines={2}>
          {buildCollectionMeta(collection)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function TrackRow({
  track,
  accent,
  onPress,
}: {
  track: AudiusTrack;
  accent: string;
  onPress: () => void;
}) {
  const artworkUrl = getTrackArtwork(track);

  return (
    <TouchableOpacity style={styles.trackRow} activeOpacity={0.78} onPress={onPress}>
      <View style={[styles.trackArtworkShell, { backgroundColor: accent }]}> 
        {artworkUrl ? (
          <Image source={{ uri: artworkUrl }} style={styles.trackArtwork} contentFit="cover" />
        ) : (
          <Ionicons name="musical-notes" size={18} color="#FFFFFF" />
        )}
      </View>

      <View style={styles.trackInfo}>
        <ThemedText style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </ThemedText>
        <ThemedText style={styles.trackMeta} numberOfLines={2}>
          {buildTrackMeta(track)}
        </ThemedText>
      </View>

      <View style={styles.trackRight}>
        {track.parental_warning_type ? <ThemedText style={styles.explicitBadge}>E</ThemedText> : null}
        <ThemedText style={styles.trackDuration}>{formatDuration(track.duration)}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 320);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const {
    data: artists = [],
    isPending: artistsPending,
    isFetching: artistsFetching,
  } = useUserSearch(debouncedQuery, { limit: 8 });
  const {
    data: searchCollections = [],
    isPending: collectionsPending,
    isFetching: collectionsFetching,
  } = usePlaylistSearch(debouncedQuery, { limit: PLAYLIST_SEARCH_LIMIT });
  const {
    data: tracks = [],
    isPending: tracksPending,
    isFetching: tracksFetching,
  } = useTrackSearch(debouncedQuery, { limit: 8 });
  const { data: trendingTracks = [] } = useTrendingTracks({ time: 'week', limit: 6 });
  const { data: trendingPlaylists = [] } = useTrendingPlaylists({ time: 'week', limit: 4 });

  const albums = useMemo(
    () => searchCollections.filter((collection) => collection.is_album).slice(0, 4),
    [searchCollections]
  );
  const playlists = useMemo(
    () => searchCollections.filter((collection) => !collection.is_album).slice(0, 4),
    [searchCollections]
  );
  const hasSearch = debouncedQuery.length > 0;
  const totalResults = artists.length + albums.length + playlists.length + tracks.length;
  const isLoadingResults = hasSearch && (
    artistsPending ||
    artistsFetching ||
    collectionsPending ||
    collectionsFetching ||
    tracksPending ||
    tracksFetching
  );

  function openArtist(artist: AudiusUser) {
    router.push({
      pathname: '/artist/[id]',
      params: {
        id: artist.id,
        name: artist.name,
        handle: artist.handle,
        bio: artist.bio ?? '',
        avatarUrl: getUserAvatar(artist),
        coverUrl: getUserCover(artist),
        followerCount: String(artist.follower_count ?? 0),
        trackCount: String(artist.track_count ?? 0),
        albumCount: String(artist.album_count ?? 0),
        playlistCount: String(artist.playlist_count ?? 0),
        verified: artist.is_verified ? '1' : '0',
        location: artist.location ?? '',
        website: artist.website ?? '',
      },
    });
  }

  function openCollection(collection: AudiusPlaylist, colors: [string, string]) {
    router.push({
      pathname: '/playlist/[id]',
      params: {
        id: collection.id,
        name: collection.playlist_name,
        color: colors[0],
        accent: colors[1],
        artworkUrl: getPlaylistArtwork(collection),
        trackCount: String(collection.track_count ?? 0),
        totalPlayCount: String(collection.total_play_count ?? 0),
        description: collection.description ?? '',
      },
    });
  }

  function openTrack(track: AudiusTrack, accent: string) {
    router.push({
      pathname: '/player',
      params: {
        playlistId: '',
        playlistName: 'Search results',
        trackId: track.id,
        trackTitle: track.title,
        trackArtist: track.user?.name ?? 'Unknown Artist',
        trackDuration: String(track.duration),
        artworkUrl: getTrackArtwork(track),
        color: accent,
      },
    });
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={['#184B45', '#0E212D', '#050505']} style={styles.hero}>
          <ThemedText style={styles.heroEyebrow}>AUDIO SEARCH</ThemedText>
          <ThemedText style={styles.heroTitle}>One search, four catalogs.</ThemedText>
          <ThemedText style={styles.heroSubtitle}>
            Artists, albums, playlists, and tracks pulled live from Audius.
          </ThemedText>

          <View style={styles.searchShell}>
            <Ionicons name="search" size={20} color="rgba(255,255,255,0.74)" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search artists, albums, playlists, tracks"
              placeholderTextColor="rgba(255,255,255,0.42)"
              style={styles.searchInput}
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor="#FFFFFF"
              returnKeyType="search"
            />
            {!!query && (
              <TouchableOpacity style={styles.clearButton} activeOpacity={0.75} onPress={() => setQuery('')}>
                <Ionicons name="close" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRow}>
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={styles.suggestionChip}
                activeOpacity={0.8}
                onPress={() => setQuery(suggestion)}
              >
                <ThemedText style={styles.suggestionText}>{suggestion}</ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </LinearGradient>

        {!hasSearch ? (
          <>
            <View style={styles.emptyHeroCard}>
              <ThemedText style={styles.emptyHeroTitle}>Search across everything</ThemedText>
              <ThemedText style={styles.emptyHeroCopy}>
                Type once to search Audius users, albums, playlists, and tracks in parallel.
              </ThemedText>
            </View>

            <SectionHeader title="Trending tracks" actionLabel="Live on Audius" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRail}>
              {trendingTracks.map((track, index) => {
                const artworkUrl = getTrackArtwork(track);
                const accent = TRACK_ACCENTS[index % TRACK_ACCENTS.length];

                return (
                  <TouchableOpacity
                    key={track.id}
                    style={[styles.discoveryTrackCard, { backgroundColor: accent }]}
                    activeOpacity={0.84}
                    onPress={() => openTrack(track, accent)}
                  >
                    {artworkUrl ? (
                      <Image source={{ uri: artworkUrl }} style={styles.discoveryTrackImage} contentFit="cover" />
                    ) : (
                      <View style={styles.discoveryTrackImagePlaceholder}>
                        <Ionicons name="musical-notes" size={22} color="#FFFFFF" />
                      </View>
                    )}
                    <ThemedText style={styles.discoveryTrackTitle} numberOfLines={2}>
                      {track.title}
                    </ThemedText>
                    <ThemedText style={styles.discoveryTrackMeta} numberOfLines={1}>
                      {track.user?.name ?? 'Unknown Artist'}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <SectionHeader title="Featured playlists" actionLabel="Refreshed weekly" />
            {trendingPlaylists.map((playlist, index) => {
              const colors = PLAYLIST_GRADIENTS[index % PLAYLIST_GRADIENTS.length];

              return (
                <CollectionCard
                  key={playlist.id}
                  collection={playlist}
                  colors={colors}
                  typeLabel={playlist.is_album ? 'Album' : 'Playlist'}
                  onPress={() => openCollection(playlist, colors)}
                />
              );
            })}
          </>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryChip}>
                <ThemedText style={styles.summaryLabel}>Artists</ThemedText>
                <ThemedText style={styles.summaryValue}>{artists.length}</ThemedText>
              </View>
              <View style={styles.summaryChip}>
                <ThemedText style={styles.summaryLabel}>Albums</ThemedText>
                <ThemedText style={styles.summaryValue}>{albums.length}</ThemedText>
              </View>
              <View style={styles.summaryChip}>
                <ThemedText style={styles.summaryLabel}>Playlists</ThemedText>
                <ThemedText style={styles.summaryValue}>{playlists.length}</ThemedText>
              </View>
              <View style={styles.summaryChip}>
                <ThemedText style={styles.summaryLabel}>Tracks</ThemedText>
                <ThemedText style={styles.summaryValue}>{tracks.length}</ThemedText>
              </View>
            </View>

            {isLoadingResults && totalResults === 0 && (
              <View style={styles.feedbackCard}>
                <ActivityIndicator color="#FFFFFF" />
                <ThemedText style={styles.feedbackText}>Searching Audius…</ThemedText>
              </View>
            )}

            {!isLoadingResults && totalResults === 0 && (
              <View style={styles.feedbackCard}>
                <Ionicons name="search" size={22} color="rgba(255,255,255,0.7)" />
                <ThemedText style={styles.feedbackTitle}>No matches for “{debouncedQuery}”</ThemedText>
                <ThemedText style={styles.feedbackText}>
                  Try a broader artist name, genre, or playlist theme.
                </ThemedText>
              </View>
            )}

            {!!artists.length && (
              <>
                <SectionHeader title="Artists" actionLabel={buildArtistMeta(artists[0]) || undefined} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRail}>
                  {artists.map((artist) => (
                    <ArtistResultCard key={artist.id} artist={artist} onPress={() => openArtist(artist)} />
                  ))}
                </ScrollView>
              </>
            )}

            {!!albums.length && (
              <>
                <SectionHeader title="Albums" actionLabel="From Audius playlists" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalRail}>
                  {albums.map((album, index) => (
                    <CollectionCard
                      key={album.id}
                      collection={album}
                      colors={ALBUM_GRADIENTS[index % ALBUM_GRADIENTS.length]}
                      typeLabel="Album"
                      onPress={() => openCollection(album, ALBUM_GRADIENTS[index % ALBUM_GRADIENTS.length])}
                    />
                  ))}
                </ScrollView>
              </>
            )}

            {!!playlists.length && (
              <>
                <SectionHeader title="Playlists" actionLabel="Curated on Audius" />
                {playlists.map((playlist, index) => {
                  const colors = PLAYLIST_GRADIENTS[index % PLAYLIST_GRADIENTS.length];

                  return (
                    <CollectionCard
                      key={playlist.id}
                      collection={playlist}
                      colors={colors}
                      typeLabel="Playlist"
                      onPress={() => openCollection(playlist, colors)}
                    />
                  );
                })}
              </>
            )}

            {!!tracks.length && (
              <>
                <SectionHeader title="Tracks" actionLabel={`${tracks.length} found`} />
                <View style={styles.trackList}>
                  {tracks.map((track, index) => {
                    const accent = TRACK_ACCENTS[index % TRACK_ACCENTS.length];

                    return (
                      <TrackRow
                        key={track.id}
                        track={track}
                        accent={accent}
                        onPress={() => openTrack(track, accent)}
                      />
                    );
                  })}
                </View>
              </>
            )}

            {isLoadingResults && totalResults > 0 && (
              <View style={styles.inlineSpinnerRow}>
                <ActivityIndicator color="rgba(255,255,255,0.74)" />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#050505',
  },
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  content: {
    paddingBottom: 240,
  },
  hero: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.58)',
  },
  heroTitle: {
    marginTop: 10,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.72)',
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    minHeight: 58,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionRow: {
    paddingTop: 14,
    paddingRight: 18,
  },
  suggestionChip: {
    marginRight: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  suggestionText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  emptyHeroCard: {
    marginHorizontal: 18,
    marginTop: 20,
    borderRadius: 22,
    backgroundColor: '#111417',
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  emptyHeroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyHeroCopy: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.62)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 26,
    marginBottom: 14,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionAction: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  horizontalRail: {
    paddingLeft: 18,
    paddingRight: 6,
  },
  discoveryTrackCard: {
    width: 164,
    borderRadius: 20,
    padding: 12,
    marginRight: 12,
  },
  discoveryTrackImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
  },
  discoveryTrackImagePlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveryTrackTitle: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  discoveryTrackMeta: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.76)',
  },
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  summaryChip: {
    minWidth: 78,
    borderRadius: 16,
    backgroundColor: '#111417',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.56)',
  },
  summaryValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  feedbackCard: {
    marginHorizontal: 18,
    marginTop: 24,
    borderRadius: 22,
    backgroundColor: '#111417',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  feedbackTitle: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  feedbackText: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  artistCard: {
    width: 108,
    marginRight: 14,
    alignItems: 'center',
  },
  artistAvatarShell: {
    width: 92,
    height: 92,
    borderRadius: 46,
    padding: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  artistAvatar: {
    width: '100%',
    height: '100%',
    borderRadius: 43,
  },
  artistName: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  artistHandle: {
    marginTop: 2,
    fontSize: 12,
    color: 'rgba(255,255,255,0.54)',
    textAlign: 'center',
  },
  collectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 12,
    borderRadius: 20,
    backgroundColor: '#111417',
    overflow: 'hidden',
  },
  collectionArtwork: {
    width: 104,
    height: 104,
  },
  collectionBody: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase',
  },
  collectionTitle: {
    marginTop: 10,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  collectionMeta: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.58)',
  },
  trackList: {
    paddingHorizontal: 18,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: '#111417',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  trackArtworkShell: {
    width: 58,
    height: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  trackArtwork: {
    width: '100%',
    height: '100%',
  },
  trackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  trackMeta: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.58)',
  },
  trackRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  trackDuration: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
  },
  explicitBadge: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
  },
  inlineSpinnerRow: {
    paddingTop: 8,
    alignItems: 'center',
  },
});
