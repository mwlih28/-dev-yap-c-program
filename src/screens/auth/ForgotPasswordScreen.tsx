import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { TextInput } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../types/navigation';
import { useAuth } from '../../context/AuthContext';
import GradientButton from '../../components/GradientButton';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
};

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) {
      Alert.alert('Hata', 'E-posta adresinizi girin.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim().toLowerCase());
      setSent(true);
    } catch {
      Alert.alert('Hata', 'Şifre sıfırlama e-postası gönderilemedi. E-posta adresinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#13132A', '#1A1A35']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Geri</Text>
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <LinearGradient colors={Colors.gradientPrimary} style={styles.iconCircle}>
              <Text style={styles.iconText}>🔑</Text>
            </LinearGradient>
          </View>

          <View style={styles.formCard}>
            {sent ? (
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>E-posta Gönderildi!</Text>
                <Text style={styles.successText}>
                  {email} adresine şifre sıfırlama bağlantısı gönderildi. E-posta kutunuzu kontrol edin.
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backToLogin}>
                  <Text style={styles.backToLoginText}>Giriş Ekranına Dön</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.title}>Şifremi Unuttum</Text>
                <Text style={styles.subtitle}>
                  E-posta adresinizi girin, şifre sıfırlama bağlantısı gönderelim.
                </Text>

                <TextInput
                  label="E-posta"
                  value={email}
                  onChangeText={setEmail}
                  mode="outlined"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  left={<TextInput.Icon icon="email-outline" color={Colors.primaryLight} />}
                  style={styles.input}
                  outlineColor={Colors.cardBorder}
                  activeOutlineColor={Colors.primary}
                  textColor={Colors.text}
                  theme={{ colors: { background: Colors.card } }}
                />

                <GradientButton label="Sıfırlama Bağlantısı Gönder" onPress={handleReset} loading={loading} />

                <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.loginLink}>
                  <Text style={styles.loginLinkText}>Giriş ekranına dön</Text>
                </TouchableOpacity>
              </>
            )}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    justifyContent: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.lg,
  },
  backText: {
    ...Typography.bodyMedium,
    color: Colors.primaryLight,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 36,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  input: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.card,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginLinkText: {
    ...Typography.bodyMedium,
    color: Colors.primaryLight,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  successIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  successTitle: {
    ...Typography.headlineSmall,
    color: Colors.success,
    marginBottom: Spacing.sm,
  },
  successText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  backToLogin: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.lg,
  },
  backToLoginText: {
    ...Typography.titleMedium,
    color: Colors.primaryLight,
  },
});
