import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAudiusUser, useAudiusUserPlaylists, useAudiusUserTracks } from '@/hooks/use-audius';
import { type AudiusPlaylist, type AudiusTrack, type AudiusUser } from '@/lib/audius';
import { getFavoriteArtist, type FavoriteArtist, type FavoriteArtistRelease } from '@/lib/favorite-artists';

const PLAYLIST_COLORS: [string, string][] = [
  ['#1D7F6B', '#0B3E36'],
  ['#D15836', '#6E2316'],
  ['#5767EA', '#23295D'],
  ['#C79B2D', '#5C430A'],
];
const ALBUM_COLORS: [string, string][] = [
  ['#A854D4', '#472063'],
  ['#249394', '#103F48'],
  ['#D26945', '#5E2415'],
  ['#A58D32', '#5B470C'],
];
const TRACK_COLORS = ['#30B680', '#FF7A59', '#4D7CFE', '#E0A02E'];

type ArtistRouteParams = {
  id?: string;
  name?: string;
  handle?: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  followerCount?: string;
  trackCount?: string;
  albumCount?: string;
  playlistCount?: string;
  verified?: string;
  location?: string;
  website?: string;
};

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

function getCollectionArtwork(collection: AudiusPlaylist): string {
  return collection.artwork?.['480x480'] ?? collection.artwork?.['150x150'] ?? collection.cover_art ?? '';
}

function getUserAvatar(user: AudiusUser | null): string {
  if (!user) return '';
  return user.profile_picture?.['480x480'] ?? user.profile_picture?.['150x150'] ?? '';
}

function getUserCover(user: AudiusUser | null): string {
  if (!user) return '';
  return user.cover_photo?.['640x'] ?? user.cover_photo?.['2000x'] ?? '';
}

function openCollection(collection: AudiusPlaylist, colors: [string, string]) {
  router.push({
    pathname: '/playlist/[id]',
    params: {
      id: collection.id,
      name: collection.playlist_name,
      color: colors[0],
      accent: colors[1],
      artworkUrl: getCollectionArtwork(collection),
      trackCount: String(collection.track_count ?? 0),
      totalPlayCount: String(collection.total_play_count ?? 0),
      description: collection.description ?? '',
    },
  });
}

function openTrack(track: AudiusTrack, accent: string, artistName: string) {
  router.push({
    pathname: '/player',
    params: {
      playlistId: '',
      playlistName: artistName,
      trackId: track.id,
      trackTitle: track.title,
      trackArtist: track.user?.name ?? artistName,
      trackDuration: String(track.duration),
      artworkUrl: getTrackArtwork(track),
      color: accent,
    },
  });
}

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

function FavoriteArtistDetailScreen({ artist }: { artist: FavoriteArtist }) {
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

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.releaseList}>
            {artist.releases.map((release) => (
              <ReleaseCard key={release.id} release={release} />
            ))}
          </ScrollView>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function ArtistTrackRow({
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
    <TouchableOpacity style={styles.audiusTrackRow} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.audiusTrackArtworkShell, { backgroundColor: accent }]}> 
        {artworkUrl ? (
          <Image source={{ uri: artworkUrl }} style={styles.audiusTrackArtwork} contentFit="cover" />
        ) : (
          <Ionicons name="musical-notes" size={18} color="#FFFFFF" />
        )}
      </View>
      <View style={styles.audiusTrackInfo}>
        <ThemedText style={styles.audiusTrackTitle} numberOfLines={1}>
          {track.title}
        </ThemedText>
        <ThemedText style={styles.audiusTrackMeta} numberOfLines={1}>
          {track.genre ?? 'Audius track'}
        </ThemedText>
      </View>
      <View style={styles.audiusTrackRight}>
        {track.parental_warning_type ? <ThemedText style={styles.explicitBadge}>E</ThemedText> : null}
        <ThemedText style={styles.audiusTrackDuration}>{formatDuration(track.duration)}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function ArtistCollectionCard({
  collection,
  typeLabel,
  colors,
  onPress,
}: {
  collection: AudiusPlaylist;
  typeLabel: string;
  colors: [string, string];
  onPress: () => void;
}) {
  const artworkUrl = getCollectionArtwork(collection);

  return (
    <TouchableOpacity style={styles.collectionCard} activeOpacity={0.82} onPress={onPress}>
      {artworkUrl ? (
        <Image source={{ uri: artworkUrl }} style={styles.collectionArtwork} contentFit="cover" />
      ) : (
        <LinearGradient colors={colors} style={styles.collectionArtwork} />
      )}

      <View style={styles.collectionInfo}>
        <View style={styles.collectionTypeBadge}>
          <ThemedText style={styles.collectionTypeText}>{typeLabel}</ThemedText>
        </View>
        <ThemedText style={styles.collectionName} numberOfLines={2}>
          {collection.playlist_name}
        </ThemedText>
        <ThemedText style={styles.collectionMeta} numberOfLines={2}>
          {collection.track_count} tracks • {formatCompactNumber(collection.total_play_count)} plays
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
}

function AudiusArtistDetailScreen({ params }: { params: ArtistRouteParams }) {
  const artistId = params.id;
  const { data: artist, isPending: artistPending, isError: artistError } = useAudiusUser(artistId);
  const { data: tracks = [], isPending: tracksPending } = useAudiusUserTracks(artistId, { limit: 6 });
  const { data: collections = [], isPending: collectionsPending } = useAudiusUserPlaylists(artistId, { limit: 8 });

  const profile: AudiusUser | null = artist ?? (artistId
    ? {
        id: artistId,
        name: params.name ?? 'Artist',
        handle: params.handle ?? '',
        bio: params.bio ?? '',
        follower_count: Number(params.followerCount ?? 0),
        track_count: Number(params.trackCount ?? 0),
        album_count: Number(params.albumCount ?? 0),
        playlist_count: Number(params.playlistCount ?? 0),
        is_verified: params.verified === '1',
        location: params.location ?? '',
        website: params.website ?? '',
        profile_picture: params.avatarUrl
          ? {
              '150x150': params.avatarUrl,
              '480x480': params.avatarUrl,
              '1000x1000': params.avatarUrl,
            }
          : null,
        cover_photo: params.coverUrl
          ? {
              '640x': params.coverUrl,
              '2000x': params.coverUrl,
            }
          : undefined,
      }
    : null);

  const albums = collections.filter((collection) => collection.is_album).slice(0, 4);
  const playlists = collections.filter((collection) => !collection.is_album).slice(0, 4);
  const avatarUrl = getUserAvatar(profile);
  const coverUrl = getUserCover(profile);
  const stats = [
    `${formatCompactNumber(profile?.follower_count)} followers`,
    `${profile?.track_count ?? 0} tracks`,
    `${profile?.album_count ?? 0} albums`,
  ].join(' • ');

  if (!artistId) {
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
        colors={['#1B6056', '#102534', '#060606', '#000000']}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.audiusContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
              <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.coverShell}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={styles.coverPhoto} contentFit="cover" />
            ) : (
              <LinearGradient colors={['#1C7064', '#0F2F39']} style={styles.coverPhoto} />
            )}
            <View style={styles.coverOverlay} />
          </View>

          <View style={styles.avatarRow}>
            <View style={styles.avatarRing}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.avatar} contentFit="cover" />
              ) : (
                <LinearGradient colors={['#1D746C', '#0A2626']} style={styles.avatar} />
              )}
            </View>
          </View>

          <View style={styles.audiusTitleBlock}>
            <View style={styles.audiusNameRow}>
              <ThemedText style={styles.artistName}>{profile?.name ?? params.name ?? 'Artist'}</ThemedText>
              {profile?.is_verified ? <Ionicons name="checkmark-circle" size={18} color="#7EE4D0" /> : null}
            </View>
            {!!profile?.handle && <ThemedText style={styles.audiusHandle}>@{profile.handle}</ThemedText>}
            <ThemedText style={styles.artistMeta}>{stats}</ThemedText>
          </View>

          {!!profile?.bio && (
            <View style={styles.bioCard}>
              <ThemedText style={styles.bioText}>{profile.bio}</ThemedText>
            </View>
          )}

          <View style={styles.badgeRow}>
            {!!profile?.location && (
              <View style={styles.infoBadge}>
                <Ionicons name="location-outline" size={14} color="#FFFFFF" />
                <ThemedText style={styles.infoBadgeText}>{profile.location}</ThemedText>
              </View>
            )}
            {!!profile?.website && (
              <TouchableOpacity
                style={styles.infoBadge}
                activeOpacity={0.8}
                onPress={() => void Linking.openURL(profile.website!)}
              >
                <Ionicons name="globe-outline" size={14} color="#FFFFFF" />
                <ThemedText style={styles.infoBadgeText} numberOfLines={1}>
                  {profile.website}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>

          {artistPending && !artist && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color="#FFFFFF" />
            </View>
          )}

          {artistError && !artist && (
            <View style={styles.inlineNotice}>
              <ThemedText style={styles.inlineNoticeText}>Unable to refresh this artist right now.</ThemedText>
            </View>
          )}

          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Top tracks</ThemedText>
            <ThemedText style={styles.sectionHint}>{tracksPending ? 'Syncing…' : `${tracks.length} loaded`}</ThemedText>
          </View>

          <View style={styles.trackStack}>
            {tracks.map((track, index) => (
              <ArtistTrackRow
                key={track.id}
                track={track}
                accent={TRACK_COLORS[index % TRACK_COLORS.length]}
                onPress={() => openTrack(track, TRACK_COLORS[index % TRACK_COLORS.length], profile?.name ?? 'Artist')}
              />
            ))}

            {!tracks.length && !tracksPending && (
              <View style={styles.inlineNotice}>
                <ThemedText style={styles.inlineNoticeText}>No public tracks available yet.</ThemedText>
              </View>
            )}
          </View>

          {!!albums.length && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Albums</ThemedText>
                <ThemedText style={styles.sectionHint}>{collectionsPending ? 'Syncing…' : `${albums.length} loaded`}</ThemedText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionRail}>
                {albums.map((album, index) => (
                  <ArtistCollectionCard
                    key={album.id}
                    collection={album}
                    typeLabel="Album"
                    colors={ALBUM_COLORS[index % ALBUM_COLORS.length]}
                    onPress={() => openCollection(album, ALBUM_COLORS[index % ALBUM_COLORS.length])}
                  />
                ))}
              </ScrollView>
            </>
          )}

          {!!playlists.length && (
            <>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Playlists</ThemedText>
                <ThemedText style={styles.sectionHint}>{playlists.length} loaded</ThemedText>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionRail}>
                {playlists.map((playlist, index) => (
                  <ArtistCollectionCard
                    key={playlist.id}
                    collection={playlist}
                    typeLabel="Playlist"
                    colors={PLAYLIST_COLORS[index % PLAYLIST_COLORS.length]}
                    onPress={() => openCollection(playlist, PLAYLIST_COLORS[index % PLAYLIST_COLORS.length])}
                  />
                ))}
              </ScrollView>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export default function ArtistDetailScreen() {
  const params = useLocalSearchParams<ArtistRouteParams>();
  const favoriteArtist = getFavoriteArtist(params.id ?? '');

  if (favoriteArtist) {
    return <FavoriteArtistDetailScreen artist={favoriteArtist} />;
  }

  return <AudiusArtistDetailScreen params={params} />;
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
  audiusContent: {
    paddingHorizontal: 18,
    paddingBottom: 48,
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
  audiusTitleBlock: {
    alignItems: 'center',
    marginTop: 14,
  },
  audiusNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  audiusHandle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.58)',
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
  coverShell: {
    marginTop: 12,
    height: 210,
    borderRadius: 26,
    overflow: 'hidden',
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  avatarRow: {
    marginTop: -44,
    alignItems: 'center',
  },
  avatarRing: {
    width: 112,
    height: 112,
    borderRadius: 56,
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 52,
  },
  bioCard: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.74)',
    textAlign: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    maxWidth: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoBadgeText: {
    maxWidth: 220,
    fontSize: 12,
    color: '#FFFFFF',
  },
  loadingRow: {
    marginTop: 18,
    alignItems: 'center',
  },
  inlineNotice: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  inlineNoticeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  sectionHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
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
  trackStack: {
    gap: 12,
  },
  audiusTrackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  audiusTrackArtworkShell: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  audiusTrackArtwork: {
    width: '100%',
    height: '100%',
  },
  audiusTrackInfo: {
    flex: 1,
    marginLeft: 12,
  },
  audiusTrackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  audiusTrackMeta: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.56)',
  },
  audiusTrackRight: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  audiusTrackDuration: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.58)',
  },
  collectionRail: {
    paddingRight: 18,
  },
  collectionCard: {
    width: 188,
    marginRight: 14,
  },
  collectionArtwork: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 18,
  },
  collectionInfo: {
    marginTop: 10,
  },
  collectionTypeBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  collectionTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase',
  },
  collectionName: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  collectionMeta: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.56)',
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