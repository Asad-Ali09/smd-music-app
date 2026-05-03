import { Stack } from 'expo-router';

export default function FavoritesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="tracks" />
      <Stack.Screen name="artists" />
      <Stack.Screen name="albums" />
      <Stack.Screen name="playlists" />
      <Stack.Screen name="downloads" />
    </Stack>
  );
}