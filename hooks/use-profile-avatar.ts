import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

const PROFILE_AVATAR_KEY_PREFIX = 'profile-avatar:';

function getProfileAvatarKey(userId: string) {
  return `${PROFILE_AVATAR_KEY_PREFIX}${userId}`;
}

export function useProfileAvatar(userId?: string | null, fallbackUri?: string | null) {
  const [avatarUri, setAvatarUri] = useState<string | null>(fallbackUri ?? null);

  useEffect(() => {
    let isMounted = true;

    async function loadAvatar() {
      if (!userId) {
        if (isMounted) {
          setAvatarUri(fallbackUri ?? null);
        }
        return;
      }

      try {
        const storedAvatar = await AsyncStorage.getItem(getProfileAvatarKey(userId));

        if (isMounted) {
          setAvatarUri(storedAvatar || fallbackUri || null);
        }
      } catch {
        if (isMounted) {
          setAvatarUri(fallbackUri ?? null);
        }
      }
    }

    loadAvatar();

    return () => {
      isMounted = false;
    };
  }, [fallbackUri, userId]);

  async function saveAvatar(nextUri: string) {
    setAvatarUri(nextUri);

    if (!userId) {
      return;
    }

    await AsyncStorage.setItem(getProfileAvatarKey(userId), nextUri);
  }

  async function removeAvatar() {
    setAvatarUri(fallbackUri ?? null);

    if (!userId) {
      return;
    }

    await AsyncStorage.removeItem(getProfileAvatarKey(userId));
  }

  return { avatarUri, saveAvatar, removeAvatar };
}