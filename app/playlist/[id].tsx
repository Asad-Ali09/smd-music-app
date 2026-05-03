import { Ionicons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetView,
  type BottomSheetHandleProps,
} from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  interpolateColor,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useFavoritePlaylists } from '@/hooks/use-favorite-playlists';
import { useFavoriteTracks } from '@/hooks/use-favorite-tracks';
import { usePlaylistTracks } from '@/hooks/use-playlists';
import { type AudiusTrack } from '@/lib/audius';
import { buildFavoritePlaylistMeta } from '@/lib/favorite-playlists';
import { createFavoriteTrackInput } from '@/lib/favorite-tracks-store';

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatTotalDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours} hr ${minutes > 0 ? `${minutes} min` : ''}`.trim();
  return `${minutes} min`;
}

const SHEET_EXPANDED_HEIGHT = 500;
const SHEET_COLLAPSED_HEIGHT = 52;
const SHEET_HANDLE_CLOSED_WIDTH = 52;
const SHEET_HANDLE_OPEN_WIDTH = 40;
const SHEET_HANDLE_TOP_SPACING = 10;

type TrackItemProps = {
  track: AudiusTrack;
  index: number;
  isMenuOpen: boolean;
  isFavorite: boolean;
  onPress: () => void;
  onMorePress: () => void;
  onAddToFavorites: () => void;
  onDownload: () => void;
};

function TrackItem({
  track,
  index,
  isMenuOpen,
  isFavorite,
  onPress,
  onMorePress,
  onAddToFavorites,
  onDownload,
}: TrackItemProps) {
  return (
    <TouchableOpacity
      style={[styles.trackRow, isMenuOpen && styles.trackRowMenuOpen]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.trackIndex}>
        <ThemedText style={styles.trackIndexText}>{index + 1}</ThemedText>
      </View>
      <View style={styles.trackInfo}>
        <ThemedText style={styles.trackTitle} numberOfLines={1}>
          {track.title}
        </ThemedText>
        <ThemedText style={styles.trackArtist} numberOfLines={1}>
          {track.user?.name ?? 'Unknown Artist'}
        </ThemedText>
      </View>
      <View style={styles.trackRight}>
        <ThemedText style={styles.trackDuration}>
          {formatDuration(track.duration)}
        </ThemedText>
        <TouchableOpacity
          style={styles.trackMore}
          hitSlop={8}
          onPress={(event) => {
            event.stopPropagation();
            onMorePress();
          }}
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        {isMenuOpen && (
          <View style={styles.trackMenu}>
            <TouchableOpacity
              style={styles.trackMenuItem}
              activeOpacity={0.75}
              onPress={(event) => {
                event.stopPropagation();
                onAddToFavorites();
              }}
            >
              <ThemedText style={styles.trackMenuText}>
                {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              </ThemedText>
            </TouchableOpacity>

            <View style={styles.trackMenuDivider} />

            <TouchableOpacity
              style={styles.trackMenuItem}
              activeOpacity={0.75}
              onPress={(event) => {
                event.stopPropagation();
                onDownload();
              }}
            >
              <ThemedText style={styles.trackMenuText}>Download</ThemedText>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function PlaylistSheetHandle({
  animatedIndex,
}: BottomSheetHandleProps) {
  const handleContainerStyle = useAnimatedStyle(() => ({
    paddingTop: interpolate(
      animatedIndex?.value ?? 0,
      [0, 1],
      [0, SHEET_HANDLE_TOP_SPACING],
      Extrapolation.CLAMP,
    ),
  }));

  const handleIndicatorStyle = useAnimatedStyle(() => ({
    width: interpolate(
      animatedIndex?.value ?? 0,
      [0, 1],
      [SHEET_HANDLE_CLOSED_WIDTH, SHEET_HANDLE_OPEN_WIDTH],
      Extrapolation.CLAMP,
    ),
    backgroundColor: interpolateColor(
      animatedIndex?.value ?? 0,
      [0, 1],
      ['rgba(255,255,255,0.48)', 'rgba(255,255,255,0.3)'],
    ),
  }));

  return (
    <Animated.View style={[styles.sheetHandleContainer, handleContainerStyle]}>
      <Animated.View style={[styles.sheetHandle, handleIndicatorStyle]} />
    </Animated.View>
  );
}

export default function PlaylistDetailScreen() {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const [openTrackMenuId, setOpenTrackMenuId] = useState<string | null>(null);
  const { id, name, color, accent, artworkUrl, trackCount, totalPlayCount, description } = useLocalSearchParams<{
    id: string;
    name: string;
    color: string;
    accent: string;
    artworkUrl: string;
    trackCount: string;
    totalPlayCount: string;
    description: string;
  }>();

  const gradientTop = color ?? '#8B0000';
  const gradientBottom = '#000000';

  const { data: tracks, isPending, isError } = usePlaylistTracks(id);
  const { data: favoritePlaylists, favoriteIds, isBookmarkPending, toggleFavoritePlaylist } =
    useFavoritePlaylists();
  const { favoriteIds: favoriteTrackIds, toggleFavoriteTrack } = useFavoriteTracks();

  const existingFavoritePlaylist = favoritePlaylists.find((playlist) => playlist.id === id);

  const displayTrackCount = tracks?.length ?? Number(trackCount ?? 0);
  const totalSeconds = tracks?.reduce((sum, t) => sum + t.duration, 0) ?? 0;
  const cachedTrackCount = existingFavoritePlaylist?.trackCount ?? Number(trackCount ?? 0);
  const cachedTotalPlayCount =
    existingFavoritePlaylist?.totalPlayCount ?? Number(totalPlayCount ?? 0);
  const bookmarkMeta = buildFavoritePlaylistMeta({
    track_count: cachedTrackCount,
    total_play_count: cachedTotalPlayCount,
  });
  const isBookmarked = !!id && favoriteIds.has(id);
  const bookmarkPending = !!id && isBookmarkPending(id);
  const metaLabel = displayTrackCount > 0
    ? `${displayTrackCount} tracks${totalSeconds > 0 ? ` • ${formatTotalDuration(totalSeconds)}` : ''}`
    : 'Loading…';

  const snapPoints = useMemo(
    () => [SHEET_COLLAPSED_HEIGHT, SHEET_EXPANDED_HEIGHT],
    [],
  );

  async function handleToggleBookmark() {
    if (!id) {
      return;
    }

    try {
      await toggleFavoritePlaylist(
        existingFavoritePlaylist ?? {
          id,
          playlistName: name ?? '',
          description: description ?? '',
          artworkUrl: artworkUrl ?? '',
          color: gradientTop,
          accent: accent ?? gradientTop,
          meta: bookmarkMeta,
          trackCount: cachedTrackCount,
          totalPlayCount: cachedTotalPlayCount,
        }
      );
    } catch {
      Alert.alert('Bookmark failed', 'Unable to update this playlist bookmark right now.');
    }
  }

  function handleTrackOptions(trackId: string) {
    setOpenTrackMenuId((currentId) => (currentId === trackId ? null : trackId));
  }

  function closeTrackMenu() {
    setOpenTrackMenuId(null);
  }

  function handleTrackMenuAction() {
    closeTrackMenu();
  }

  async function handleAddTrackToFavorites(track: AudiusTrack) {
    try {
      await toggleFavoriteTrack(
        createFavoriteTrackInput({
          id: track.id,
          title: track.title,
          artist: track.user?.name ?? 'Unknown Artist',
          artworkUrl: track.artwork?.['480x480'] ?? track.artwork?.['150x150'] ?? artworkUrl ?? '',
          duration: track.duration,
          color: gradientTop,
          playlistName: name ?? '',
          playlistId: id ?? '',
        })
      );
      closeTrackMenu();
    } catch {
      Alert.alert('Favorite failed', 'Unable to update this track in favorites right now.');
    }
  }

  return (
    <View style={styles.root}>
      {/* Gradient background */}
      <LinearGradient
        colors={[gradientTop, gradientBottom]}
        locations={[0, 0.55]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={26} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn} hitSlop={8}>
            <Ionicons name="ellipsis-horizontal" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Artwork */}
        <View style={styles.artworkWrapper}>
          {artworkUrl ? (
            <Image
              source={{ uri: artworkUrl }}
              style={styles.artwork}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]}>
              <Ionicons name="musical-notes" size={64} color="rgba(255,255,255,0.4)" />
            </View>
          )}
        </View>

        {/* Playlist info */}
        <ThemedText style={styles.playlistName}>{name}</ThemedText>
        <ThemedText style={styles.playlistMeta}>{metaLabel}</ThemedText>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="arrow-redo-outline" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.playBtn}>
            <Ionicons name="play" size={30} color="#000" style={{ marginLeft: 3 }} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, bookmarkPending && styles.iconButtonDisabled]}
            disabled={bookmarkPending}
            onPress={() => void handleToggleBookmark()}
          >
            <Ionicons
              name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color="rgba(255,255,255,0.8)"
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Track list */}
      {isPending && (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}

      {isError && (
        <View style={styles.centered}>
          <ThemedText style={styles.errorText}>Failed to load tracks.</ThemedText>
        </View>
      )}

      {tracks && (
        <FlatList
          data={tracks}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TrackItem
              track={item}
              index={index}
              isMenuOpen={openTrackMenuId === item.id}
              isFavorite={favoriteTrackIds.has(item.id)}
              onMorePress={() => handleTrackOptions(item.id)}
              onAddToFavorites={() => void handleAddTrackToFavorites(item)}
              onDownload={handleTrackMenuAction}
              onPress={() =>
                (() => {
                  closeTrackMenu();
                  router.push({
                    pathname: '/player',
                    params: {
                      playlistId: id,
                      trackId: item.id,
                      trackTitle: item.title,
                      trackArtist: item.user?.name ?? 'Unknown Artist',
                      trackDuration: String(item.duration),
                      artworkUrl: item.artwork?.['480x480'] ?? artworkUrl ?? '',
                      playlistName: name ?? '',
                      color: gradientTop,
                    },
                  });
                })()
              }
            />
          )}
          contentContainerStyle={styles.trackList}
          onScrollBeginDrag={closeTrackMenu}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomSheet
        index={0}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        handleComponent={PlaylistSheetHandle}
        backgroundStyle={styles.sheetBackground}
      >
        <BottomSheetView style={[styles.sheetScroll, styles.sheetContent]}>
          {/* Header row: bookmark | artwork | share */}
          <View style={styles.sheetHeaderRow}>
            <TouchableOpacity
              style={[styles.sheetIconBtn, bookmarkPending && styles.iconButtonDisabled]}
              disabled={bookmarkPending}
              onPress={() => void handleToggleBookmark()}
            >
              <Ionicons name={isBookmarked ? 'bookmark' : 'bookmark-outline'} size={22} color="#fff" />
            </TouchableOpacity>

            <View style={styles.sheetArtworkWrapper}>
              {artworkUrl ? (
                <Image
                  source={{ uri: artworkUrl }}
                  style={styles.sheetArtwork}
                  contentFit="cover"
                />
              ) : (
                <View
                  style={[
                    styles.sheetArtwork,
                    styles.sheetArtworkPlaceholder,
                    { backgroundColor: gradientTop },
                  ]}
                >
                  <Ionicons name="musical-notes" size={28} color="rgba(255,255,255,0.5)" />
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.sheetIconBtn}>
              <Ionicons name="arrow-redo-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Playlist name & meta */}
          <ThemedText style={styles.sheetName}>{name}</ThemedText>
          <ThemedText style={styles.sheetMeta}>{metaLabel}</ThemedText>

          {/* Description */}
          <ThemedText style={description ? styles.sheetDescription : styles.sheetDescriptionEmpty}>
            {description || 'No description available.'}
          </ThemedText>
        </BottomSheetView>
      </BottomSheet>

      {bottomInset > 0 && (
        <View
          pointerEvents="none"
          style={[styles.systemNavigationScrim, { height: bottomInset }]}
        />
      )}
    </View>
  );
}

const ARTWORK_SIZE = 160;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },
  safeArea: {
    alignItems: 'center',
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 18,
  },
  artworkWrapper: {
    marginTop: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  artwork: {
    width: ARTWORK_SIZE,
    height: ARTWORK_SIZE,
    borderRadius: ARTWORK_SIZE / 2,
  },
  artworkPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playlistName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  playlistMeta: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackList: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  trackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  trackRowMenuOpen: {
    zIndex: 10,
  },
  trackIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  trackIndexText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  trackInfo: {
    flex: 1,
    marginRight: 8,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  trackArtist: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.55)',
    marginTop: 2,
  },
  trackRight: {
    position: 'relative',
    alignItems: 'flex-end',
    gap: 4,
  },
  trackDuration: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
  },
  trackMore: {
    padding: 2,
  },
  trackMenu: {
    position: 'absolute',
    top: 26,
    right: -6,
    minWidth: 154,
    borderRadius: 14,
    backgroundColor: '#161616',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
    overflow: 'hidden',
  },
  trackMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trackMenuText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  trackMenuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 15,
    textAlign: 'center',
  },
  sheetBackground: {
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sheetHandleContainer: {
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  sheetHandle: {
    width: SHEET_HANDLE_OPEN_WIDTH,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignSelf: 'center',
  },
  sheetScroll: {
    flex: 1,
  },
  sheetContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 10,
  },
  sheetIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonDisabled: {
    opacity: 0.55,
  },
  sheetArtworkWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  sheetArtwork: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  sheetArtworkPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 6,
  },
  sheetMeta: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    marginBottom: 16,
  },
  sheetDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 22,
    textAlign: 'center',
    paddingBottom: 8,
  },
  sheetDescriptionEmpty: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingBottom: 8,
  },
  systemNavigationScrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
  },
});
