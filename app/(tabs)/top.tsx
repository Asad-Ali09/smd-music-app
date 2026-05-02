import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export default function TopScreen() {
  return (
    <View style={styles.container}>
      <ThemedText type="title">Top</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
