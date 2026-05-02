import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AuthProvider, useAuth } from '@/context/auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

const queryClient = new QueryClient();

function RootNavigator() {
  const { user, loading } = useAuth();
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (loading) return;
    if (user || true) { // remove this later
      router.replace('/(tabs)');
    } else {
    }
  }, [user, loading]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="playlist/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="player" options={{ headerShown: false, presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
