import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAuth } from '../../context/AuthContext';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../theme';
import { MainTabParamList } from '../../types/navigation';

type Nav = BottomTabNavigationProp<MainTabParamList>;

const FEATURES = [
  {
    id: 'Homework',
    icon: '📚',
    title: 'Ödev Yardımcısı',
    desc: 'Matematik, Fen, Türkçe ve daha fazlası',
    gradient: Colors.gradientPrimary,
  },
  {
    id: 'Composition',
    icon: '✏️',
    title: 'Kompozisyon Yaz',
    desc: 'Deneme, hikaye, makale üret',
    gradient: Colors.gradientSecondary,
  },
  {
    id: 'Socratic',
    icon: '🧠',
    title: 'Sokratik Öğrenme',
    desc: 'Sorularla derinlemesine anla',
    gradient: Colors.gradientSuccess,
  },
] as const;

const TIPS = [
  '"Öğrenmenin sonu yoktur." — Aristoteles',
  '"Başarının sırrı, başlamaktır." — Mark Twain',
  '"Bilgi güçtür." — Francis Bacon',
  '"Her gün biraz daha iyi ol." — Will Durant',
];

export default function HomeScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation<Nav>();

  const firstName = profile?.displayName?.split(' ')[0] ?? 'Öğrenci';
  const tip = TIPS[new Date().getDay() % TIPS.length];

  const stats = [
    { label: 'Soru', value: profile?.totalQuestions ?? 0, icon: '❓', color: Colors.primary },
    { label: 'Kompozisyon', value: profile?.totalCompositions ?? 0, icon: '📄', color: Colors.secondary },
    { label: 'Oturum', value: profile?.totalSocraticSessions ?? 0, icon: '🧠', color: Colors.success },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <LinearGradient colors={['#13132A', '#0A0A1A']} style={styles.header}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Merhaba, {firstName} 👋</Text>
              <Text style={styles.subGreeting}>Bugün ne öğrenmek istiyorsun?</Text>
            </View>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeText}>{profile?.grade ?? '—'}</Text>
            </View>
          </View>

          {/* Quote card */}
          <View style={styles.quoteCard}>
            <Text style={styles.quoteIcon}>💡</Text>
            <Text style={styles.quoteText}>{tip}</Text>
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

        {/* Section title */}
        <Text style={styles.sectionTitle}>Ne yapmak istersin?</Text>

        {/* Feature cards */}
        <View style={styles.featuresGrid}>
          {FEATURES.map((feat) => (
            <TouchableOpacity
              key={feat.id}
              activeOpacity={0.85}
              onPress={() => navigation.navigate(feat.id as keyof MainTabParamList)}
              style={styles.featureCardWrapper}
            >
              <LinearGradient
                colors={feat.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.featureCard}
              >
                <Text style={styles.featureIcon}>{feat.icon}</Text>
                <Text style={styles.featureTitle}>{feat.title}</Text>
                <Text style={styles.featureDesc}>{feat.desc}</Text>
                <View style={styles.featureArrow}>
                  <Text style={styles.featureArrowText}>→</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* How to use */}
        <View style={styles.howCard}>
          <Text style={styles.howTitle}>🚀 Nasıl kullanılır?</Text>
          <View style={styles.howStep}>
            <View style={styles.howNumber}><Text style={styles.howNumberText}>1</Text></View>
            <Text style={styles.howText}>Profil ekranından Groq API anahtarını gir</Text>
          </View>
          <View style={styles.howStep}>
            <View style={styles.howNumber}><Text style={styles.howNumberText}>2</Text></View>
            <Text style={styles.howText}>Bir özellik seç ve soru sor veya konu gir</Text>
          </View>
          <View style={styles.howStep}>
            <View style={styles.howNumber}><Text style={styles.howNumberText}>3</Text></View>
            <Text style={styles.howText}>Yapay zeka sana yardımcı olsun!</Text>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  greeting: {
    ...Typography.headlineLarge,
    color: Colors.text,
  },
  subGreeting: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  gradeBadge: {
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  gradeText: {
    ...Typography.labelMedium,
    color: Colors.primaryLight,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  quoteIcon: { fontSize: 18 },
  quoteText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
    fontStyle: 'italic',
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
  statValue: {
    ...Typography.headlineMedium,
    fontWeight: '800',
  },
  statLabel: {
    ...Typography.labelSmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.headlineSmall,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  featuresGrid: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  featureCardWrapper: {
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  featureCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.xl,
  },
  featureIcon: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  featureTitle: {
    ...Typography.headlineSmall,
    color: Colors.white,
    marginBottom: 4,
  },
  featureDesc: {
    ...Typography.bodySmall,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.md,
  },
  featureArrow: {
    alignSelf: 'flex-end',
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureArrowText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  howCard: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  howTitle: {
    ...Typography.headlineSmall,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  howStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  howNumber: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  howNumberText: {
    color: Colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  howText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    flex: 1,
  },
});
