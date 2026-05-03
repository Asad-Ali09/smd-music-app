import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useTrendingPlaylists } from "@/hooks/use-playlists";
import { type AudiusPlaylist } from "@/lib/audius";

const PLAYLIST_GRADIENTS: [string, string][] = [
  ["#1DB954", "#157A38"],
  ["#6B4FBB", "#3E2A7A"],
  ["#E84C3C", "#9B2020"],
  ["#1A7BAA", "#0B3F59"],
];

function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function getPlaylistArtwork(playlist: AudiusPlaylist): string {
  return playlist.artwork?.["480x480"] ?? playlist.cover_art ?? "";
}

function buildPlaylistMeta(playlist: AudiusPlaylist): string {
  const parts: string[] = [];

  if (playlist.track_count) {
    parts.push(`${playlist.track_count} tracks`);
  }

  if (playlist.total_play_count) {
    parts.push(`${formatCompactNumber(playlist.total_play_count)} plays`);
  }

  return parts.join(" . ");
}

export default function PlaylistsScreen() {
  const { data, isPending, isError } = useTrendingPlaylists({
    time: "week",
    limit: 30,
  });

  const playlists = data ?? [];

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

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerAction}
            activeOpacity={0.7}
            onPress={() => router.back()}
          >
            <MaterialIcons
              name="arrow-back-ios-new"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Featured playlists</ThemedText>
          <View style={styles.headerAction} />
        </View>

        {isPending && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#FFFFFF" />
          </View>
        )}

        {isError && (
          <View style={styles.centered}>
            <ThemedText style={styles.errorText}>
              Failed to load playlists. Please try again.
            </ThemedText>
          </View>
        )}

        <FlatList
          data={playlists}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const colors =
              PLAYLIST_GRADIENTS[index % PLAYLIST_GRADIENTS.length];
            const artworkUrl = getPlaylistArtwork(item);

            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.85}
                onPress={() => openPlaylist(item, colors[0])}
              >
                {artworkUrl ? (
                  <Image
                    source={{ uri: artworkUrl }}
                    style={styles.artwork}
                    contentFit="cover"
                  />
                ) : (
                  <LinearGradient colors={colors} style={styles.artwork} />
                )}
                <View style={styles.rowContent}>
                  <ThemedText style={styles.playlistTitle} numberOfLines={1}>
                    {item.playlist_name}
                  </ThemedText>
                  <ThemedText style={styles.playlistMeta} numberOfLines={2}>
                    {buildPlaylistMeta(item) ||
                      (item.user?.name ?? "Audius Playlist")}
                  </ThemedText>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },
  container: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    paddingBottom: 18,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 60,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 15,
    textAlign: "center",
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  artwork: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 14,
    overflow: "hidden",
  },
  rowContent: {
    flex: 1,
  },
  playlistTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  playlistMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
});
