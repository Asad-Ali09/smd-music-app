import { useAuth } from '@/context/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUpScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  async function handleSignUp() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
    } catch (e: any) {
      Alert.alert('Sign up failed', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={['#1a4a42', '#0d2b26', '#000000']}
      locations={[0, 0.45, 1]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        <View style={styles.inner}>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Free for 3 months, then $12 a month</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="#888"
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#888"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#888"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.signUpButton} activeOpacity={0.85} onPress={handleSignUp} disabled={loading}>
              <Text style={styles.signUpButtonText}>{loading ? 'Creating…' : 'Create account'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.8}
              onPress={() => router.back()}
            >
              <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </View>
        </ScrollView>
        </KeyboardAvoidingView>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  inner: {
    width: '100%',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    color: '#aaaaaa',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 28,
  },
  form: {
    gap: 12,
    alignItems: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#1c1c1e',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    color: '#ffffff',
    fontSize: 16,
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  signUpButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    marginTop: 56,
    gap: 14,
  },
  signInButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  signInButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  termsText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#aaaaaa',
    textDecorationLine: 'underline',
  },
});
