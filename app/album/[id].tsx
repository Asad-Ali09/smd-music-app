import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useFavoriteAlbums } from '@/hooks/use-favorite-albums';
import { usePlaylistTracks } from '@/hooks/use-playlists';
import { type AudiusTrack } from '@/lib/audius';
import { getFavoriteAlbum, type FavoriteAlbumTrack } from '@/lib/favorite-albums';
import { buildFavoriteAlbumMeta } from '@/lib/favorite-albums-store';

type AlbumRouteParams = {
  id?: string;
  title?: string;
  artist?: string;
  artworkUrl?: string;
  description?: string;
  color?: string;
  accent?: string;
  trackCount?: string;
  totalPlayCount?: string;
  explicit?: string;
  source?: 'audius' | 'local';
};

function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getTrackArtwork(track: AudiusTrack): string {
  return track.artwork?.['480x480'] ?? track.artwork?.['150x150'] ?? '';
}

function buildAlbumMeta(parts: (string | null | undefined)[]) {
  return parts.filter(Boolean).join(' • ');
}

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

function AudiusAlbumTrackRow({
  albumArtist,
  albumColor,
  albumId,
  albumName,
  index,
  track,
}: {
  albumArtist: string;
  albumColor: string;
  albumId: string;
  albumName: string;
  index: number;
  track: AudiusTrack;
}) {
  const artworkUrl = getTrackArtwork(track);

  return (
    <TouchableOpacity
      style={styles.trackRow}
      activeOpacity={0.78}
      onPress={() =>
        router.push({
          pathname: '/player',
          params: {
            playlistId: albumId,
            playlistName: albumName,
            trackId: track.id,
            trackTitle: track.title,
            trackArtist: track.user?.name ?? albumArtist,
            trackDuration: String(track.duration),
            artworkUrl,
            color: albumColor,
          },
        })
      }
    >
      <View style={styles.trackNumberWrap}>
        <ThemedText style={styles.trackNumber}>{index + 1}</ThemedText>
      </View>

      <View style={styles.trackInfo}>
        <ThemedText style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </ThemedText>
        <ThemedText style={styles.trackArtist} numberOfLines={1}>
          {track.user?.name ?? albumArtist}
        </ThemedText>
      </View>

      <View style={styles.trackActions}>
        {track.parental_warning_type ? <ThemedText style={styles.explicitBadge}>E</ThemedText> : null}
        <ThemedText style={styles.trackDuration}>{formatDuration(track.duration)}</ThemedText>
      </View>
    </TouchableOpacity>
  );
}

export default function AlbumDetailScreen() {
  const params = useLocalSearchParams<AlbumRouteParams>();
  const { id } = params;
  const album = getFavoriteAlbum(id ?? '');
  const { data: favoriteAlbums, favoriteIds, isBookmarkPending, toggleFavoriteAlbum } = useFavoriteAlbums();
  const storedFavoriteAlbum = favoriteAlbums.find((entry) => entry.id === id);
  const isBookmarked = !!id && favoriteIds.has(id);
  const bookmarkPending = !!id && isBookmarkPending(id);
  const shouldRenderAudiusAlbum = params.source === 'audius' || (!album && !!params.title);
  const { data: tracks = [], isPending, isError } = usePlaylistTracks(shouldRenderAudiusAlbum ? id : undefined);

  async function handleToggleAudiusBookmark() {
    if (!id) {
      return;
    }

    const albumTitle = params.title ?? 'Album';
    const albumArtist = params.artist ?? 'Unknown Artist';
    const totalPlayCount = Number(params.totalPlayCount ?? 0);
    const trackCount = Number(params.trackCount ?? 0) || tracks.length;

    try {
      await toggleFavoriteAlbum(
        storedFavoriteAlbum ?? {
          id,
          title: albumTitle,
          artist: albumArtist,
          artworkUrl: params.artworkUrl ?? '',
          description: params.description ?? '',
          color: params.color ?? '#7D4B2A',
          accent: params.accent ?? '#2D1B12',
          meta: buildFavoriteAlbumMeta({
            trackCount,
            totalPlayCount,
          }),
          trackCount,
          totalPlayCount,
          explicit: params.explicit === '1',
          source: 'audius',
        }
      );
    } catch (error) {
      Alert.alert(
        'Bookmark failed',
        error instanceof Error ? error.message : 'Unable to update this album bookmark right now.'
      );
    }
  }

  async function handleToggleLocalBookmark() {
    if (!id || !album) {
      return;
    }

    try {
      await toggleFavoriteAlbum(
        storedFavoriteAlbum ?? {
          id,
          title: album.title,
          artist: album.artist,
          artworkUrl: '',
          description: '',
          color: album.color,
          accent: album.color,
          meta: buildFavoriteAlbumMeta({
            year: album.year,
            trackCount: album.tracks.length,
          }),
          trackCount: album.tracks.length,
          totalPlayCount: 0,
          explicit: !!album.explicit,
          source: 'local',
        }
      );
    } catch (error) {
      Alert.alert(
        'Bookmark failed',
        error instanceof Error ? error.message : 'Unable to update this album bookmark right now.'
      );
    }
  }

  if (shouldRenderAudiusAlbum && id) {
    const albumColor = params.color ?? '#7D4B2A';
    const albumAccent = params.accent ?? '#2D1B12';
    const albumTitle = params.title ?? 'Album';
    const albumArtist = params.artist ?? 'Unknown Artist';
    const albumDescription = params.description?.trim();
    const artworkUrl = params.artworkUrl ?? '';
    const totalPlays = Number(params.totalPlayCount ?? 0);
    const routeTrackCount = Number(params.trackCount ?? 0);
    const metaLine = buildAlbumMeta([
      albumArtist,
      routeTrackCount > 0 ? `${routeTrackCount} tracks` : tracks.length > 0 ? `${tracks.length} tracks` : null,
      totalPlays > 0 ? `${formatCompactNumber(totalPlays)} plays` : null,
    ]);

    return (
      <View style={styles.root}>
        <LinearGradient
          colors={[albumColor, albumAccent, '#050505', '#000000']}
          locations={[0, 0.34, 0.72, 1]}
          style={StyleSheet.absoluteFill}
        />

        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <FlatList
            data={tracks}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <AudiusAlbumTrackRow
                albumArtist={albumArtist}
                albumColor={albumColor}
                albumId={id}
                albumName={albumTitle}
                index={index}
                track={item}
              />
            )}
            ListEmptyComponent={
              !isPending ? (
                <View style={styles.inlineNotice}>
                  <ThemedText style={styles.inlineNoticeText}>
                    {isError ? 'Unable to load this album right now.' : 'No public tracks available for this album.'}
                  </ThemedText>
                </View>
              ) : null
            }
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

                {artworkUrl ? (
                  <Image source={{ uri: artworkUrl }} style={styles.artwork} contentFit="cover" />
                ) : (
                  <LinearGradient colors={[albumColor, albumAccent]} style={styles.artwork} />
                )}

                <View style={styles.heroText}>
                  <ThemedText style={styles.albumName}>{albumTitle}</ThemedText>
                  <ThemedText style={styles.albumMeta}>{metaLine}</ThemedText>
                </View>

                {!!albumDescription && (
                  <View style={styles.descriptionCard}>
                    <ThemedText style={styles.descriptionText}>{albumDescription}</ThemedText>
                  </View>
                )}

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.secondaryAction} activeOpacity={0.8}>
                    <Ionicons name="arrow-redo-outline" size={22} color="#FFFFFF" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.playAction}
                    activeOpacity={0.85}
                    disabled={tracks.length === 0}
                    onPress={() =>
                      tracks[0]
                        ? router.push({
                            pathname: '/player',
                            params: {
                              playlistId: id,
                              playlistName: albumTitle,
                              trackId: tracks[0].id,
                              trackTitle: tracks[0].title,
                              trackArtist: tracks[0].user?.name ?? albumArtist,
                              trackDuration: String(tracks[0].duration),
                              artworkUrl: getTrackArtwork(tracks[0]) || artworkUrl,
                              color: albumColor,
                            },
                          })
                        : undefined
                    }
                  >
                    <Ionicons name="play" size={28} color="#0C63B8" style={styles.playIcon} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.secondaryAction, bookmarkPending && styles.actionDisabled]}
                    activeOpacity={0.8}
                    disabled={bookmarkPending}
                    onPress={() => void handleToggleAudiusBookmark()}
                  >
                    <Ionicons
                      name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                      size={22}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </View>

                {isPending && (
                  <View style={styles.feedbackRow}>
                    <ActivityIndicator color="#FFFFFF" />
                  </View>
                )}
              </>
            }
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
          />
        </SafeAreaView>
      </View>
    );
  }

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

                <TouchableOpacity
                  style={[styles.secondaryAction, bookmarkPending && styles.actionDisabled]}
                  activeOpacity={0.8}
                  disabled={bookmarkPending}
                  onPress={() => void handleToggleLocalBookmark()}
                >
                  <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFFFFF" />
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
  actionDisabled: {
    opacity: 0.58,
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
  trackDuration: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.62)',
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
  descriptionCard: {
    marginTop: 18,
    marginBottom: 8,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.76)',
    textAlign: 'center',
  },
  feedbackRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  inlineNotice: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginTop: 10,
  },
  inlineNoticeText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
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