import { useAuth } from "@/context/auth";
import { useProfileAvatar } from "@/hooks/use-profile-avatar";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useTrendingPlaylists, useTrendingTracks } from "@/hooks/use-playlists";
import { type AudiusPlaylist, type AudiusTrack } from "@/lib/audius";

const RELEASE_CARD_COLORS = [
  "#F5A623",
  "#4CAF8A",
  "#6B4FBB",
  "#E84C3C",
  "#3A8FC1",
];
const PLAYLIST_GRADIENTS: [string, string][] = [
  ["#1DB954", "#157A38"],
  ["#6B4FBB", "#3E2A7A"],
  ["#E84C3C", "#9B2020"],
  ["#1A7BAA", "#0B3F59"],
];
const ALBUM_GRADIENTS: [string, string][] = [
  ["#D07A29", "#6C2D14"],
  ["#4B8A77", "#1E4238"],
  ["#6A63D9", "#2C2C73"],
  ["#BD4F6C", "#5C1933"],
];

function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function getTrackArtwork(track: AudiusTrack): string {
  return track.artwork?.["480x480"] ?? track.artwork?.["150x150"] ?? "";
}

function getPlaylistArtwork(playlist: AudiusPlaylist): string {
  return playlist.artwork?.["480x480"] ?? playlist.cover_art ?? "";
}

function getReleaseBadge(track: AudiusTrack): string | null {
  if (track.parental_warning_type) return "E";
  if (!track.genre) return null;
  return track.genre.split(/[\s/-]+/)[0]?.slice(0, 10) ?? null;
}

function getReleaseTimestamp(track: AudiusTrack): number {
  const rawValue = track.release_date ?? track.created_at;
  if (!rawValue) return 0;

  const timestamp = Date.parse(rawValue);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function buildPlaylistMeta(playlist: AudiusPlaylist): string {
  const parts: string[] = [];

  if (playlist.track_count) {
    parts.push(`${playlist.track_count} tracks`);
  }

  if (playlist.total_play_count) {
    parts.push(`${formatCompactNumber(playlist.total_play_count)} plays`);
  }

  return parts.join(" • ");
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { avatarUri } = useProfileAvatar(user?.uid, user?.photoURL ?? null);
  const {
    data: trendingTracks,
    isPending: tracksPending,
    isError: tracksError,
  } = useTrendingTracks({ time: "week", limit: 10 });
  const {
    data: trendingPlaylists,
    isPending: playlistsPending,
    isError: playlistsError,
  } = useTrendingPlaylists({ time: "week", limit: 4 });
  const {
    data: trendingAlbums,
    isPending: albumsPending,
    isError: albumsError,
  } = useTrendingPlaylists({ time: "week", limit: 6, type: "album" });
  const featuredPlaylists: AudiusPlaylist[] = trendingPlaylists ?? [];
  const featuredAlbums: AudiusPlaylist[] = trendingAlbums ?? [];

  const newReleases = [...(trendingTracks ?? [])]
    .sort((a, b) => getReleaseTimestamp(b) - getReleaseTimestamp(a))
    .slice(0, 5);
  const topCharts = (trendingTracks ?? []).slice(0, 5);
  const heroTrack = topCharts[0];

  const openPlaylist = (playlist: AudiusPlaylist, accent: string) => {
    router.push({
      pathname: "/playlist/[id]",
      params: {
        id: playlist.id,
        name: playlist.playlist_name,
        color: accent,
        artworkUrl: getPlaylistArtwork(playlist),
        trackCount: playlist.track_count,
        description: playlist.description ?? "",
      },
    });
  };

  const openAlbum = (album: AudiusPlaylist, colors: [string, string]) => {
    router.push({
      pathname: "/album/[id]",
      params: {
        id: album.id,
        title: album.playlist_name,
        artist: album.user?.name ?? "Unknown Artist",
        artworkUrl: getPlaylistArtwork(album),
        description: album.description ?? "",
        color: colors[0],
        accent: colors[1],
        trackCount: String(album.track_count ?? 0),
        totalPlayCount: String(album.total_play_count ?? 0),
        explicit: album.tracks?.some((track) => !!track.parental_warning_type)
          ? "1"
          : "0",
        source: "audius",
      },
    });
  };

  const openTrack = (track: AudiusTrack, color: string) => {
    router.push({
      pathname: "/player",
      params: {
        playlistId: "",
        trackId: track.id,
        trackTitle: track.title,
        trackArtist: track.user?.name ?? "Unknown Artist",
        trackDuration: String(track.duration),
        artworkUrl: getTrackArtwork(track),
        playlistName: "Trending on Audius",
        color,
      },
    });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero header */}
      <LinearGradient
        colors={["#1A5C55", "#0D2B28", "#0A0A0A"]}
        style={styles.hero}
      >
        {/* Avatar */}
        <TouchableOpacity
          style={styles.avatarWrapper}
          activeOpacity={0.85}
          onPress={() => router.push("/profile")}
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={styles.avatar}
              contentFit="cover"
            />
          ) : (
            <View style={styles.avatar}>
              <Image
                source={require("@/assets/icons/profile.png")}
                style={styles.avatarIcon}
                contentFit="contain"
              />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.heroContent}>
          <Image
            source={require("@/assets/images/splash-icon.png")}
            style={styles.heroLogo}
            contentFit="contain"
          />
          <ThemedText style={styles.heroTitle}>
            Live from Audius{`\n`}this week
          </ThemedText>

          <TouchableOpacity style={styles.trialButton} activeOpacity={0.85}>
            <ThemedText style={styles.trialButtonText}>
              {tracksPending
                ? "Syncing charts"
                : `${topCharts.length || 0} trending tracks`}
            </ThemedText>
          </TouchableOpacity>

          <ThemedText style={styles.trialMeta}>
            {heroTrack
              ? `${heroTrack.user?.name ?? "Audius"} is leading the feed with ${formatCompactNumber(heroTrack.play_count)} plays`
              : "Fresh tracks and playlists pulled directly from Audius"}
          </ThemedText>
        </View>
      </LinearGradient>

      {/* New releases */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>New releases</ThemedText>
          <TouchableOpacity onPress={() => router.push("/releases")}>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={newReleases}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item, index }) => {
            const badge = getReleaseBadge(item);
            const accent =
              RELEASE_CARD_COLORS[index % RELEASE_CARD_COLORS.length];

            return (
              <TouchableOpacity
                style={[styles.releaseCard, { backgroundColor: accent }]}
                activeOpacity={0.85}
                onPress={() => openTrack(item, accent)}
              >
                {!!getTrackArtwork(item) && (
                  <Image
                    source={{ uri: getTrackArtwork(item) }}
                    style={styles.releaseImage}
                    contentFit="cover"
                  />
                )}
                <View style={styles.releaseOverlay} />
                <ThemedText style={styles.releaseArtist} numberOfLines={1}>
                  {item.user?.name ?? "Unknown Artist"}
                </ThemedText>
                <View style={styles.releaseCardBottom}>
                  <ThemedText style={styles.releaseTitle} numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                  {badge && (
                    <View style={styles.tagBadge}>
                      <ThemedText style={styles.tagText}>{badge}</ThemedText>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        {tracksPending && !newReleases.length && (
          <View style={styles.feedbackRow}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}

        {tracksError && !newReleases.length && (
          <ThemedText style={styles.feedbackText}>
            Failed to load Audius releases.
          </ThemedText>
        )}
      </View>

      {/* Featured playlists */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            Featured playlists
          </ThemedText>
          <TouchableOpacity onPress={() => router.push("/playlists")}>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {featuredPlaylists.map((item, index) => {
          const colors = PLAYLIST_GRADIENTS[index % PLAYLIST_GRADIENTS.length];
          const artworkUrl = getPlaylistArtwork(item);

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.playlistRow}
              activeOpacity={0.85}
              onPress={() => openPlaylist(item, colors[0])}
            >
              {artworkUrl ? (
                <Image
                  source={{ uri: artworkUrl }}
                  style={styles.playlistThumb}
                  contentFit="cover"
                />
              ) : (
                <LinearGradient
                  colors={colors}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.playlistThumb}
                />
              )}
              <View style={styles.playlistInfo}>
                <ThemedText style={styles.playlistTitle} numberOfLines={1}>
                  {item.playlist_name}
                </ThemedText>
                <ThemedText style={styles.playlistMeta} numberOfLines={1}>
                  {buildPlaylistMeta(item) ||
                    (item.user?.name ?? "Audius Playlist")}
                </ThemedText>
              </View>
              <ThemedText style={styles.playlistArrow}>›</ThemedText>
            </TouchableOpacity>
          );
        })}

        {playlistsPending && featuredPlaylists.length === 0 && (
          <View style={styles.feedbackRow}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}

        {playlistsError && featuredPlaylists.length === 0 && (
          <ThemedText style={styles.feedbackText}>
            Failed to load Audius playlists.
          </ThemedText>
        )}
      </View>

      {/* Trending albums */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Trending albums</ThemedText>
          <TouchableOpacity onPress={() => router.push("/albums")}>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredAlbums}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          renderItem={({ item, index }) => {
            const colors = ALBUM_GRADIENTS[index % ALBUM_GRADIENTS.length];
            const artworkUrl = getPlaylistArtwork(item);

            return (
              <TouchableOpacity
                style={styles.albumCard}
                activeOpacity={0.85}
                onPress={() => openAlbum(item, colors)}
              >
                {artworkUrl ? (
                  <Image
                    source={{ uri: artworkUrl }}
                    style={styles.albumArtwork}
                    contentFit="cover"
                  />
                ) : (
                  <LinearGradient colors={colors} style={styles.albumArtwork} />
                )}

                <ThemedText style={styles.albumTitle} numberOfLines={2}>
                  {item.playlist_name}
                </ThemedText>
                <ThemedText style={styles.albumMeta} numberOfLines={2}>
                  {item.user?.name ?? "Unknown Artist"}
                  {buildPlaylistMeta(item)
                    ? ` • ${buildPlaylistMeta(item)}`
                    : ""}
                </ThemedText>
              </TouchableOpacity>
            );
          }}
        />

        {albumsPending && featuredAlbums.length === 0 && (
          <View style={styles.feedbackRow}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}

        {albumsError && featuredAlbums.length === 0 && (
          <ThemedText style={styles.feedbackText}>
            Failed to load Audius albums.
          </ThemedText>
        )}
      </View>

      {/* Top charts */}
      <View style={[styles.section, styles.sectionLast]}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Top charts</ThemedText>
          <TouchableOpacity onPress={() => router.push("/charts")}>
            <ThemedText style={styles.viewAll}>View All</ThemedText>
          </TouchableOpacity>
        </View>

        {topCharts.map((item, index) => {
          const accent =
            RELEASE_CARD_COLORS[index % RELEASE_CARD_COLORS.length];

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.chartRow}
              activeOpacity={0.85}
              onPress={() => openTrack(item, accent)}
            >
              <ThemedText style={styles.chartRank}>{index + 1}</ThemedText>
              {getTrackArtwork(item) ? (
                <Image
                  source={{ uri: getTrackArtwork(item) }}
                  style={styles.chartThumb}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.chartThumb} />
              )}
              <View style={styles.chartInfo}>
                <ThemedText style={styles.chartTitle} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.chartArtist} numberOfLines={1}>
                  {item.user?.name ?? "Unknown Artist"} •{" "}
                  {formatCompactNumber(item.play_count)} plays
                </ThemedText>
              </View>
              <TouchableOpacity
                style={styles.chartPlayBtn}
                onPress={() => openTrack(item, accent)}
              >
                <View style={styles.chartPlayTriangle} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}

        {tracksPending && !topCharts.length && (
          <View style={styles.feedbackRow}>
            <ActivityIndicator color="#FFFFFF" />
          </View>
        )}

        {tracksError && !topCharts.length && (
          <ThemedText style={styles.feedbackText}>
            Failed to load Audius charts.
          </ThemedText>
        )}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  /* Hero */
  hero: {
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    width: 22,
    height: 22,
    tintColor: "#1A1A1A",
  },
  heroContent: {
    alignItems: "center",
    gap: 16,
    marginTop: 8,
    paddingTop: 0,
  },
  heroLogo: {
    width: 90,
    height: 90,
    borderRadius: 22,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 36,
  },
  trialButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 14,
    paddingHorizontal: 60,
  },
  trialButtonText: {
    color: "#0A0A0A",
    fontSize: 16,
    fontWeight: "600",
  },
  trialMeta: {
    color: "#8A8A8A",
    fontSize: 13,
    textAlign: "center",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  viewAll: {
    fontSize: 13,
    color: "#FFFFFF",
    backgroundColor: "#2A2A2A",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },

  /* New releases */
  horizontalList: {
    gap: 12,
  },
  releaseCard: {
    width: 150,
    height: 180,
    borderRadius: 16,
    justifyContent: "flex-end",
    padding: 12,
    overflow: "hidden",
    position: "relative",
  },
  releaseImage: {
    ...StyleSheet.absoluteFillObject,
  },
  releaseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.28)",
  },
  releaseArtist: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 12,
    marginBottom: 6,
  },
  releaseCardBottom: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 6,
  },
  releaseTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
    flexShrink: 1,
  },
  tagBadge: {
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Featured playlists */
  playlistRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    gap: 14,
  },
  playlistThumb: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: "hidden",
  },
  playlistInfo: {
    flex: 1,
    gap: 4,
  },
  playlistTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  playlistMeta: {
    color: "#8A8A8A",
    fontSize: 13,
  },
  playlistArrow: {
    color: "#8A8A8A",
    fontSize: 24,
    lineHeight: 24,
  },

  /* Albums */
  albumCard: {
    width: 174,
  },
  albumArtwork: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 16,
    overflow: "hidden",
  },
  albumTitle: {
    marginTop: 10,
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
    lineHeight: 20,
  },
  albumMeta: {
    marginTop: 4,
    color: "#8A8A8A",
    fontSize: 13,
    lineHeight: 18,
  },

  /* Top charts */
  chartRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#2A2A2A",
  },
  chartRank: {
    color: "#8A8A8A",
    fontSize: 15,
    fontWeight: "700",
    width: 20,
    textAlign: "center",
  },
  chartThumb: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#2A2A2A",
    overflow: "hidden",
  },
  chartInfo: {
    flex: 1,
    gap: 3,
  },
  chartTitle: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  chartArtist: {
    color: "#8A8A8A",
    fontSize: 13,
  },
  chartPlayBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2A2A2A",
    alignItems: "center",
    justifyContent: "center",
  },
  chartPlayTriangle: {
    width: 0,
    height: 0,
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderLeftWidth: 10,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    borderLeftColor: "#FFFFFF",
    marginLeft: 2,
  },
  feedbackRow: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  feedbackText: {
    color: "#8A8A8A",
    fontSize: 13,
    paddingTop: 6,
  },
});
