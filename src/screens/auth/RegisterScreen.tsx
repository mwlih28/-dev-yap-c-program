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
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Register'>;
};

const GRADES = [
  '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf',
  '5. Sınıf', '6. Sınıf', '7. Sınıf', '8. Sınıf',
  '9. Sınıf', '10. Sınıf', '11. Sınıf', '12. Sınıf',
  'Üniversite', 'Mezun',
];

export default function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showGradePicker, setShowGradePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword || !grade) {
      Alert.alert('Hata', 'Tüm alanları doldurun.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, name.trim(), grade);
    } catch (err: any) {
      const msg = err?.code === 'auth/email-already-in-use'
        ? 'Bu e-posta zaten kayıtlı.'
        : 'Kayıt olunamadı. Lütfen tekrar deneyin.';
      Alert.alert('Kayıt Hatası', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={['#0A0A1A', '#13132A', '#1A1A35']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.logoSection}>
            <LinearGradient colors={Colors.gradientSecondary} style={styles.logoCircle}>
              <Text style={styles.logoText}>YAP</Text>
            </LinearGradient>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Hemen öğrenmeye başla</Text>
          </View>

          <View style={styles.formCard}>

            <TextInput
              label="Ad Soyad"
              value={name}
              onChangeText={setName}
              mode="outlined"
              autoCapitalize="words"
              left={<TextInput.Icon icon="account-outline" color={Colors.primaryLight} />}
              style={styles.input}
              outlineColor={Colors.cardBorder}
              activeOutlineColor={Colors.primary}
              textColor={Colors.text}
              theme={{ colors: { background: Colors.card } }}
            />

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

            <TextInput
              label="Şifre Tekrar"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              mode="outlined"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              left={<TextInput.Icon icon="lock-check-outline" color={Colors.primaryLight} />}
              style={styles.input}
              outlineColor={Colors.cardBorder}
              activeOutlineColor={Colors.primary}
              textColor={Colors.text}
              theme={{ colors: { background: Colors.card } }}
            />

            {/* Grade Picker */}
            <TouchableOpacity
              style={styles.gradePicker}
              onPress={() => setShowGradePicker(!showGradePicker)}
            >
              <Text style={styles.gradePickerLabel}>Sınıf / Seviye</Text>
              <Text style={[styles.gradeValue, !grade && styles.gradePlaceholder]}>
                {grade || 'Seçiniz...'}
              </Text>
              <Text style={styles.gradeArrow}>{showGradePicker ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {showGradePicker && (
              <View style={styles.gradeOptions}>
                <ScrollView style={styles.gradeScroll} nestedScrollEnabled>
                  {GRADES.map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.gradeOption, grade === g && styles.gradeOptionSelected]}
                      onPress={() => {
                        setGrade(g);
                        setShowGradePicker(false);
                      }}
                    >
                      <Text style={[styles.gradeOptionText, grade === g && styles.gradeOptionTextSelected]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.buttonContainer}>
              <GradientButton
                label="Kayıt Ol"
                onPress={handleRegister}
                loading={loading}
                gradient={Colors.gradientSecondary}
              />
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Zaten hesabın var mı?{' '}
                <Text style={styles.loginLinkText}>Giriş Yap</Text>
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  header: {
    paddingTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backText: {
    ...Typography.bodyMedium,
    color: Colors.primaryLight,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  logoText: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
  },
  title: {
    ...Typography.headlineLarge,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  input: {
    marginBottom: Spacing.md,
    backgroundColor: Colors.card,
  },
  gradePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  gradePickerLabel: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  gradeValue: {
    ...Typography.bodyMedium,
    color: Colors.text,
    flex: 1,
  },
  gradePlaceholder: {
    color: Colors.textSecondary,
  },
  gradeArrow: {
    color: Colors.textSecondary,
    fontSize: 10,
  },
  gradeOptions: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  gradeScroll: {
    maxHeight: 200,
  },
  gradeOption: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  gradeOptionSelected: {
    backgroundColor: Colors.primaryDark,
  },
  gradeOptionText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  gradeOptionTextSelected: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: Spacing.md,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  loginLinkText: {
    color: Colors.primaryLight,
    fontWeight: '700',
  },
});
