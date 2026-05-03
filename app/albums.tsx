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

const ALBUM_GRADIENTS: [string, string][] = [
  ["#D07A29", "#6C2D14"],
  ["#4B8A77", "#1E4238"],
  ["#6A63D9", "#2C2C73"],
  ["#BD4F6C", "#5C1933"],
];

function getPlaylistArtwork(playlist: AudiusPlaylist): string {
  return playlist.artwork?.["480x480"] ?? playlist.cover_art ?? "";
}

function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
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

export default function AlbumsScreen() {
  const { data, isPending, isError } = useTrendingPlaylists({
    time: "week",
    limit: 30,
    type: "album",
  });

  const albums = data ?? [];

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
          <ThemedText style={styles.headerTitle}>Trending albums</ThemedText>
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
              Failed to load albums. Please try again.
            </ThemedText>
          </View>
        )}

        <FlatList
          data={albums}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const colors = ALBUM_GRADIENTS[index % ALBUM_GRADIENTS.length];
            const artworkUrl = getPlaylistArtwork(item);

            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.85}
                onPress={() => openAlbum(item, colors)}
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
                  <ThemedText style={styles.albumTitle} numberOfLines={1}>
                    {item.playlist_name}
                  </ThemedText>
                  <ThemedText style={styles.albumMeta} numberOfLines={2}>
                    {item.user?.name ?? "Unknown Artist"}
                    {buildPlaylistMeta(item)
                      ? ` . ${buildPlaylistMeta(item)}`
                      : ""}
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
  albumTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  albumMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
});
