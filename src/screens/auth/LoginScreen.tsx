import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import GradientButton from '../../components/GradientButton';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Hata', 'Email ve şifre alanları boş olamaz.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (err: any) {
      const msg = err?.code === 'auth/invalid-credential'
        ? 'Email veya şifre hatalı.'
        : 'Giriş yapılamadı. Lütfen tekrar deneyin.';
      Alert.alert('Giriş Hatası', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#13132A', '#1A1A35']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoSection}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.logoCircle}>
              <Text style={styles.logoText}>YAP</Text>
            </LinearGradient>
            <Text style={styles.appName}>Yapay Zeka Ödev Asistanı</Text>
            <Text style={styles.tagline}>Öğrenmenin en akıllı yolu</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Giriş Yap</Text>

            <TextInput
              label="E-posta"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              left={<TextInput.Icon icon="email-outline" color={Colors.primaryLight} />}
              style={styles.input}
              outlineColor={Colors.cardBorder}
              activeOutlineColor={Colors.primary}
              textColor={Colors.text}
              theme={{ colors: { background: Colors.card } }}
            />

            <TextInput
              label="Şifre"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock-outline" color={Colors.primaryLight} />}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  color={Colors.textSecondary}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              style={styles.input}
              outlineColor={Colors.cardBorder}
              activeOutlineColor={Colors.primary}
              textColor={Colors.text}
              theme={{ colors: { background: Colors.card } }}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <GradientButton label="Giriş Yap" onPress={handleLogin} loading={loading} />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>veya</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            >
              <Text style={styles.registerText}>
                Hesabın yok mu?{' '}
                <Text style={styles.registerLink}>Kayıt Ol</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  appName: {
    ...Typography.headlineSmall,
    color: Colors.text,
    textAlign: 'center',
  },
  tagline: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  formTitle: {
    ...Typography.headlineLarge,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.lg,
    marginTop: -4,
  },
  forgotText: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.cardBorder,
  },
  dividerText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginHorizontal: Spacing.md,
  },
  registerButton: {
    alignItems: 'center',
  },
  registerText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  registerLink: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
});
