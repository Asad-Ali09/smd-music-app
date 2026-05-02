import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
          <Text style={styles.title}>Sign in</Text>

          <View style={styles.form}>
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

            <TouchableOpacity style={styles.signInButton} activeOpacity={0.85}>
              <Text style={styles.signInButtonText}>Sign in</Text>
            </TouchableOpacity>

            <Pressable>
              <Text style={styles.forgotText}>Forgot your login or password?</Text>
            </Pressable>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.createAccountButton}
              activeOpacity={0.8}
              onPress={() => router.push('/(auth)/sign-up')}
            >
              <Text style={styles.createAccountText}>Create account</Text>
            </TouchableOpacity>
            <Text style={styles.trialText}>Free for 3 months, then $12 a month</Text>
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
  signInButton: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  signInButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  forgotText: {
    color: '#aaaaaa',
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 72,
    gap: 10,
  },
  createAccountButton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 50,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  createAccountText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
  },
  trialText: {
    color: '#666666',
    fontSize: 13,
  },
});
