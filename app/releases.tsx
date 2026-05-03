import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
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
import { useTrendingTracks } from "@/hooks/use-playlists";
import { type AudiusTrack } from "@/lib/audius";

const RELEASE_CARD_COLORS = [
  "#F5A623",
  "#4CAF8A",
  "#6B4FBB",
  "#E84C3C",
  "#3A8FC1",
];

function formatCompactNumber(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}

function getTrackArtwork(track: AudiusTrack): string {
  return track.artwork?.["480x480"] ?? track.artwork?.["150x150"] ?? "";
}

function getReleaseTimestamp(track: AudiusTrack): number {
  const rawValue = track.release_date ?? track.created_at;
  if (!rawValue) return 0;

  const timestamp = Date.parse(rawValue);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export default function ReleasesScreen() {
  const { data, isPending, isError } = useTrendingTracks({
    time: "week",
    limit: 40,
  });

  const releases = [...(data ?? [])].sort(
    (a, b) => getReleaseTimestamp(b) - getReleaseTimestamp(a),
  );

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
        playlistName: "New releases",
        color,
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
          <ThemedText style={styles.headerTitle}>New releases</ThemedText>
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
              Failed to load new releases. Please try again.
            </ThemedText>
          </View>
        )}

        <FlatList
          data={releases}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => {
            const accent =
              RELEASE_CARD_COLORS[index % RELEASE_CARD_COLORS.length];
            const artwork = getTrackArtwork(item);

            return (
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.82}
                onPress={() => openTrack(item, accent)}
              >
                {artwork ? (
                  <Image
                    source={{ uri: artwork }}
                    style={styles.artwork}
                    contentFit="cover"
                  />
                ) : (
                  <View style={[styles.artwork, { backgroundColor: accent }]} />
                )}

                <View style={styles.rowContent}>
                  <ThemedText style={styles.trackTitle} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={styles.trackMeta} numberOfLines={1}>
                    {item.user?.name ?? "Unknown Artist"} .{" "}
                    {formatCompactNumber(item.play_count)} plays
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
    width: 56,
    height: 56,
    borderRadius: 10,
    marginRight: 14,
    overflow: "hidden",
  },
  rowContent: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  trackMeta: {
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    marginTop: 4,
  },
});
