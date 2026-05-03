import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FavoritesCategoryPlaceholder } from "@/components/favorites-category-placeholder";
import { useFavoriteTracks } from "@/hooks/use-favorite-tracks";

function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainderSeconds = seconds % 60;
  return `${minutes}:${remainderSeconds.toString().padStart(2, "0")}`;
}

export default function FavoriteTracksScreen() {
  const { data, isPending, isError, toggleFavoriteTrack } = useFavoriteTracks();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (!isPending && !isError && data.length === 0) {
    return (
      <FavoritesCategoryPlaceholder
        title="Tracks"
        message="Save tracks from the player screen to keep them ready for playback here."
        icon="music-note"
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.container}>
        {openMenuId && (
          <Pressable
            style={styles.menuOverlay}
            onPress={() => setOpenMenuId(null)}
          />
        )}
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

          <Text style={styles.headerTitle}>Tracks</Text>

          <TouchableOpacity style={styles.headerAction} activeOpacity={0.7}>
            <MaterialIcons name="menu" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {isPending && (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}

        {isError && (
          <View style={styles.centered}>
            <Text style={styles.errorText}>
              Failed to load favorite tracks. Please try again.
            </Text>
          </View>
        )}

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.row, openMenuId === item.id && styles.rowMenuOpen]}
              activeOpacity={0.75}
              onPress={() => {
                setOpenMenuId(null);
                router.push({
                  pathname: "/player",
                  params: {
                    playlistId: item.playlistId,
                    trackId: item.id,
                    trackTitle: item.title,
                    trackArtist: item.artist,
                    trackDuration: String(item.durationSec),
                    artworkUrl: item.artworkUrl,
                    playlistName: item.playlistName,
                    color: item.color,
                  },
                });
              }}
            >
              <View style={styles.leftGroup}>
                <View style={styles.indexWrap}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>

                {item.artworkUrl ? (
                  <Image
                    source={{ uri: item.artworkUrl }}
                    style={styles.artwork}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[styles.artwork, { backgroundColor: item.color }]}
                  />
                )}

                <View style={styles.rowContent}>
                  <View style={styles.titleRow}>
                    <Text style={styles.trackTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                  </View>

                  <Text style={styles.artist} numberOfLines={1}>
                    {item.artist}
                  </Text>
                </View>
              </View>

              <View style={styles.trackRight}>
                <Text style={styles.duration}>
                  {formatDuration(item.durationSec)}
                </Text>
                <TouchableOpacity
                  style={styles.moreButton}
                  activeOpacity={0.7}
                  hitSlop={8}
                  onPress={(e) => {
                    e.stopPropagation();
                    setOpenMenuId((cur) => (cur === item.id ? null : item.id));
                  }}
                >
                  <MaterialIcons
                    name="more-horiz"
                    size={20}
                    color="rgba(255,255,255,0.62)"
                  />
                </TouchableOpacity>

                {openMenuId === item.id && (
                  <Pressable style={styles.trackMenu} onPress={() => {}}>
                    <TouchableOpacity
                      style={styles.trackMenuItem}
                      activeOpacity={0.75}
                      onPress={() => {
                        const track = item;
                        setOpenMenuId(null);
                        toggleFavoriteTrack(track);
                      }}
                    >
                      <Text style={styles.trackMenuText}>
                        Remove from favorites
                      </Text>
                    </TouchableOpacity>
                  </Pressable>
                )}
              </View>
            </TouchableOpacity>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onScrollBeginDrag={() => setOpenMenuId(null)}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000000",
  },
  container: {
    flex: 1,
    backgroundColor: "#000000",
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
  listContent: {
    paddingTop: 8,
    paddingBottom: 220,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  rowMenuOpen: {
    zIndex: 10,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  leftGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  indexWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  indexText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 14,
    overflow: "hidden",
  },
  rowContent: {
    flex: 1,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackTitle: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  artist: {
    marginTop: 3,
    fontSize: 14,
    color: "rgba(255,255,255,0.52)",
  },
  trackRight: {
    position: "relative",
    alignItems: "flex-end",
    gap: 4,
  },
  duration: {
    fontSize: 13,
    color: "rgba(255,255,255,0.5)",
  },
  moreButton: {
    padding: 2,
  },
  trackMenu: {
    position: "absolute",
    top: 26,
    right: -6,
    minWidth: 154,
    borderRadius: 14,
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 12,
    overflow: "hidden",
  },
  trackMenuItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  trackMenuText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});
