import { useAuth } from '@/context/auth';
import { useProfileAvatar } from '@/hooks/use-profile-avatar';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    Alert,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ProfileAction = {
  label: string;
  tone?: 'default' | 'danger';
  onPress: () => void | Promise<void>;
};

function formatDisplayName(email: string | null | undefined, displayName: string | null | undefined) {
  if (displayName?.trim()) {
    return displayName.trim();
  }

  const localPart = email?.split('@')[0]?.trim();
  if (!localPart) {
    return 'Music Listener';
  }

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getInitials(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return 'ML';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export default function ProfileScreen() {
  const { user, logOut } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [updatingImage, setUpdatingImage] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const displayName = formatDisplayName(user?.email, user?.displayName);
  const initials = getInitials(displayName);
  const email = user?.email ?? 'Signed in user';
  const { avatarUri, saveAvatar, removeAvatar } = useProfileAvatar(user?.uid, user?.photoURL ?? null);

  const showPlaceholder = (title: string) => {
    Alert.alert(title, 'This action can be connected once that flow exists.');
  };

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logOut();
      router.replace('/(auth)/sign-in');
    } catch (error: any) {
      Alert.alert('Log out failed', error?.message ?? 'Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  const handleUpdateImage = async () => {
    setUpdatingImage(true);

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert('Permission needed', 'Allow photo access to update your profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets.length) {
        return;
      }

      await saveAvatar(result.assets[0].uri);
    } catch (error: any) {
      Alert.alert('Unable to update image', error?.message ?? 'Please try again.');
    } finally {
      setUpdatingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      await removeAvatar();
      setIsPreviewOpen(false);
    } catch (error: any) {
      Alert.alert('Unable to remove image', error?.message ?? 'Please try again.');
    }
  };

  const actions: ProfileAction[] = [
    {
      label: 'Restore purchases',
      onPress: () => showPlaceholder('Restore purchases'),
    },
    {
      label: loggingOut ? 'Logging out…' : 'Log out',
      tone: 'danger',
      onPress: handleLogout,
    },
  ];

  return (
    <LinearGradient
      colors={['#A86C49', '#8C573A', '#1C110D']}
      locations={[0, 0.55, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <Text style={styles.headerTitle}>Profile</Text>
          <Pressable style={styles.closeButton} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.avatarSection}>
            <Pressable
              style={styles.avatarCircle}
              onPress={() => avatarUri && setIsPreviewOpen(true)}
              disabled={!avatarUri}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
              ) : (
                <Text style={styles.avatarText}>{initials}</Text>
              )}
            </Pressable>

            <View style={styles.avatarActionRow}>
              <Pressable
                style={styles.avatarActionButton}
                onPress={handleUpdateImage}
                disabled={updatingImage}
              >
                <MaterialIcons
                  name={avatarUri ? 'edit' : 'add'}
                  size={18}
                  color="#FFFFFF"
                />
              </Pressable>

              {avatarUri ? (
                <Pressable
                  style={[styles.avatarActionButton, styles.avatarDeleteButton]}
                  onPress={handleRemoveImage}
                  disabled={updatingImage}
                >
                  <MaterialIcons name="delete-outline" size={18} color="#6D1F0A" />
                </Pressable>
              ) : null}
            </View>
          </View>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>

          <View style={styles.membershipCard}>
            <Text style={styles.membershipTitle}>My subscription</Text>
            <Text style={styles.membershipMeta}>Valid until May 23, 2026</Text>
          </View>

          <View style={styles.actions}>
            {actions.map((action) => (
              <Pressable
                key={action.label}
                style={[
                  styles.actionButton,
                  action.tone === 'danger' ? styles.actionButtonDanger : null,
                ]}
                onPress={action.onPress}
                disabled={loggingOut && action.tone === 'danger'}
              >
                <Text
                  style={[
                    styles.actionLabel,
                    action.tone === 'danger' ? styles.actionLabelDanger : null,
                  ]}
                >
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <Modal
          visible={isPreviewOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsPreviewOpen(false)}
        >
          <Pressable style={styles.previewBackdrop} onPress={() => setIsPreviewOpen(false)}>
            <Pressable style={styles.previewCard} onPress={() => {}}>
              <Pressable style={styles.previewCloseButton} onPress={() => setIsPreviewOpen(false)}>
                <MaterialIcons name="close" size={24} color="#FFFFFF" />
              </Pressable>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.previewImage} contentFit="contain" />
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 30,
    fontWeight: '300',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 32,
    paddingBottom: 48,
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginTop: 8,
  },
  avatarCircle: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#FFD0AA',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarText: {
    color: '#74442A',
    fontSize: 32,
    fontWeight: '700',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 56,
  },
  avatarActionRow: {
    position: 'absolute',
    right: -10,
    bottom: -6,
    flexDirection: 'row',
    gap: 8,
  },
  avatarActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A3C28',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  avatarDeleteButton: {
    backgroundColor: '#E8C4B5',
  },
  name: {
    marginTop: 18,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
  },
  email: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 15,
    textAlign: 'center',
  },
  membershipCard: {
    width: '100%',
    marginTop: 30,
    backgroundColor: '#49281B',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  membershipTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '500',
  },
  membershipMeta: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 14,
  },
  actions: {
    width: '100%',
    gap: 10,
    marginTop: 22,
  },
  actionButton: {
    backgroundColor: '#D4B2A1',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  actionButtonDanger: {
    backgroundColor: '#E8C4B5',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  actionLabelDanger: {
    color: '#6D1F0A',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.84)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  previewCard: {
    width: '100%',
    maxWidth: 380,
    aspectRatio: 1,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#1C110D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewCloseButton: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});