import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import GradientButton from '../../components/GradientButton';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

export default function ProfileScreen() {
  const { user, profile, groqApiKey, logOut, updateGroqKey, refreshProfile } = useAuth();
  const [apiKey, setApiKey] = useState(groqApiKey);
  const [showKey, setShowKey] = useState(false);
  const [savingKey, setSavingKey] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = profile?.displayName
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

  async function saveApiKey() {
    if (!apiKey.trim()) {
      Alert.alert('Hata', 'API anahtarı boş olamaz.');
      return;
    }
    setSavingKey(true);
    try {
      await updateGroqKey(apiKey.trim());
      Alert.alert('Kaydedildi', 'Groq API anahtarı başarıyla kaydedildi!');
    } finally {
      setSavingKey(false);
    }
  }

  async function handleLogOut() {
    Alert.alert('Çıkış Yap', 'Hesabından çıkmak istediğinden emin misin?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap', style: 'destructive', onPress: async () => {
          setLoggingOut(true);
          try {
            await logOut();
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  }

  const stats = [
    { label: 'Sorulan Soru', value: profile?.totalQuestions ?? 0, icon: '❓', color: Colors.primary },
    { label: 'Kompozisyon', value: profile?.totalCompositions ?? 0, icon: '✏️', color: Colors.secondary },
    { label: 'Sokratik Oturum', value: profile?.totalSocraticSessions ?? 0, icon: '🧠', color: Colors.success },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <LinearGradient colors={Colors.gradientPrimary} style={styles.headerGradient}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.displayName}>{profile?.displayName ?? user?.displayName ?? 'Kullanıcı'}</Text>
          <Text style={styles.email}>{user?.email ?? ''}</Text>
          <View style={styles.gradeBadge}>
            <Text style={styles.gradeText}>🎓 {profile?.grade ?? '—'}</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Groq API Key */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Groq AI Ayarları</Text>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>API Anahtarı</Text>
            <Text style={styles.cardHint}>
              console.groq.com adresinden ücretsiz API anahtarı alabilirsin.
            </Text>
            <View style={styles.keyInputRow}>
              <TextInput
                style={styles.keyInput}
                value={apiKey}
                onChangeText={setApiKey}
                placeholder="gsk_..."
                placeholderTextColor={Colors.textSecondary}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.eyeButton}>
                <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {groqApiKey ? (
              <View style={styles.keyStatusRow}>
                <View style={styles.keyStatusDot} />
                <Text style={styles.keyStatusText}>API anahtarı kayıtlı</Text>
              </View>
            ) : (
              <View style={styles.keyMissingRow}>
                <Text style={styles.keyMissingText}>⚠️ API anahtarı henüz girilmemiş</Text>
              </View>
            )}

            <View style={styles.keyButtonRow}>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://console.groq.com')}
                style={styles.getKeyButton}
              >
                <Text style={styles.getKeyText}>↗ Groq Console</Text>
              </TouchableOpacity>
              <GradientButton
                label={savingKey ? 'Kaydediliyor…' : 'Kaydet'}
                onPress={saveApiKey}
                loading={savingKey}
                small
                style={styles.saveKeyButton}
              />
            </View>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Uygulama Hakkında</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Uygulama</Text>
              <Text style={styles.infoValue}>YAP - Ödev Asistanı</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Versiyon</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>AI Modeli</Text>
              <Text style={styles.infoValue}>Llama 3.3 70B (Groq)</Text>
            </View>
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={styles.infoLabel}>Hesap Oluşturuldu</Text>
              <Text style={styles.infoValue}>
                {profile?.createdAt?.toDate
                  ? profile.createdAt.toDate().toLocaleDateString('tr-TR')
                  : 'Bilinmiyor'}
              </Text>
            </View>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity onPress={handleLogOut} disabled={loggingOut} style={styles.logoutButton}>
            <Text style={styles.logoutText}>{loggingOut ? 'Çıkış yapılıyor…' : '🚪 Çıkış Yap'}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { paddingBottom: Spacing.xxl },
  headerGradient: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl + Spacing.md,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '800',
  },
  displayName: {
    ...Typography.headlineMedium,
    color: Colors.white,
    fontWeight: '700',
  },
  email: {
    ...Typography.bodyMedium,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  gradeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  gradeText: {
    ...Typography.labelMedium,
    color: Colors.white,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statValue: { ...Typography.headlineSmall, fontWeight: '800' },
  statLabel: { ...Typography.labelSmall, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionTitle: { ...Typography.headlineSmall, color: Colors.text, marginBottom: Spacing.md },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  cardLabel: { ...Typography.titleMedium, color: Colors.text, marginBottom: 4 },
  cardHint: { ...Typography.bodySmall, color: Colors.textSecondary, marginBottom: Spacing.md, lineHeight: 18 },
  keyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  keyInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: 14,
    fontFamily: 'monospace',
  },
  eyeButton: { padding: Spacing.xs },
  eyeIcon: { fontSize: 18 },
  keyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  keyStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  keyStatusText: { ...Typography.labelMedium, color: Colors.success },
  keyMissingRow: { marginBottom: Spacing.md },
  keyMissingText: { ...Typography.labelMedium, color: Colors.warning },
  keyButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  getKeyButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  getKeyText: { ...Typography.labelMedium, color: Colors.primaryLight },
  saveKeyButton: { flex: 1 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { ...Typography.bodyMedium, color: Colors.textSecondary },
  infoValue: { ...Typography.bodyMedium, color: Colors.text, fontWeight: '500' },
  logoutButton: {
    backgroundColor: Colors.error + '18',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error + '55',
  },
  logoutText: {
    ...Typography.titleLarge,
    color: Colors.error,
    fontWeight: '700',
  },
});
