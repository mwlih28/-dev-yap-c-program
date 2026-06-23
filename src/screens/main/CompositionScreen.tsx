import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { generateComposition, improveText } from '../../services/groqService';
import GradientButton from '../../components/GradientButton';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const TYPES = ['Deneme', 'Hikaye', 'Makale', 'Mektup', 'Şiir', 'Özet'];
const TONES = ['Resmi', 'Samimi', 'Akademik', 'Yaratıcı', 'Duygusal'];
const LENGTHS: { label: string; value: 'kısa' | 'orta' | 'uzun'; desc: string }[] = [
  { label: 'Kısa', value: 'kısa', desc: '150–250 kelime' },
  { label: 'Orta', value: 'orta', desc: '300–500 kelime' },
  { label: 'Uzun', value: 'uzun', desc: '600–900 kelime' },
];

type Step = 'form' | 'result';

export default function CompositionScreen() {
  const { groqApiKey, incrementStat } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState(TYPES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [length, setLength] = useState<'kısa' | 'orta' | 'uzun'>('orta');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [improving, setImproving] = useState(false);

  async function generate() {
    if (!topic.trim()) {
      Alert.alert('Konu Gerekli', 'Lütfen kompozisyon konusunu girin.');
      return;
    }
    if (!groqApiKey) {
      Alert.alert('API Anahtarı Eksik', 'Profil ekranından Groq API anahtarınızı ekleyin.');
      return;
    }

    setLoading(true);
    try {
      const res = await generateComposition(groqApiKey, topic.trim(), type, tone, length);
      if (res.success) {
        setResult(res.content);
        setStep('result');
        await incrementStat('totalCompositions');
      } else {
        Alert.alert('Hata', res.error ?? 'Kompozisyon oluşturulamadı.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function improve(instruction: string) {
    if (!result || !groqApiKey) return;
    setImproving(true);
    try {
      const res = await improveText(groqApiKey, result, instruction);
      if (res.success) {
        setResult(res.content);
      } else {
        Alert.alert('Hata', res.error ?? 'Metin düzenlenemedi.');
      }
    } finally {
      setImproving(false);
    }
  }

  if (step === 'result') {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#13132A', '#0A0A1A']} style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => setStep('form')} style={styles.backBtn}>
              <Text style={styles.backText}>← Geri</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>✏️ Kompozisyon</Text>
            <TouchableOpacity onPress={() => { setResult(''); setStep('form'); }} style={styles.newBtn}>
              <Text style={styles.newText}>Yeni</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.metaBadges}>
            <View style={styles.badge}><Text style={styles.badgeText}>{type}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>{tone}</Text></View>
            <View style={styles.badge}><Text style={styles.badgeText}>{topic.length > 25 ? topic.slice(0, 25) + '…' : topic}</Text></View>
          </View>
        </LinearGradient>

        <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
          <View style={styles.resultCard}>
            <Text style={styles.resultText}>{result}</Text>
          </View>
        </ScrollView>

        {/* Improve actions */}
        <View style={styles.improveBar}>
          <Text style={styles.improveTitle}>Geliştir:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.improveRow}>
              {[
                { label: 'Daha kısa yap', instruction: 'Bu metni daha kısa ve öz hale getir' },
                { label: 'Akıcılaştır', instruction: 'Cümle geçişlerini ve akıcılığı iyileştir' },
                { label: 'Resmi yap', instruction: 'Dili daha resmi ve akademik hale getir' },
                { label: 'Giriş güçlendir', instruction: 'Giriş paragrafını daha çarpıcı ve ilgi çekici yap' },
                { label: 'Sonuç güçlendir', instruction: 'Sonuç paragrafını daha güçlü ve etkileyici yap' },
              ].map((a) => (
                <TouchableOpacity
                  key={a.label}
                  onPress={() => improve(a.instruction)}
                  disabled={improving}
                  style={[styles.improveChip, improving && styles.improveChipDisabled]}
                >
                  <Text style={styles.improveChipText}>{improving ? '…' : a.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#13132A', '#0A0A1A']} style={styles.header}>
        <Text style={styles.headerTitle}>✏️ Kompozisyon Yaz</Text>
        <Text style={styles.headerSub}>Konu gir, yapay zeka yazsın</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.formContent} keyboardShouldPersistTaps="handled">

        {/* Topic */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Konu *</Text>
          <TextInput
            style={styles.topicInput}
            value={topic}
            onChangeText={setTopic}
            placeholder="Örn: Çevre kirliliğinin etkileri, Türkiye'nin güzellikleri..."
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={200}
          />
          <Text style={styles.charCount}>{topic.length}/200</Text>
        </View>

        {/* Type */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Yazı Türü</Text>
          <View style={styles.optionsWrap}>
            {TYPES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setType(t)}
                style={[styles.optionChip, type === t && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, type === t && styles.optionTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tone */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ton / Üslup</Text>
          <View style={styles.optionsWrap}>
            {TONES.map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setTone(t)}
                style={[styles.optionChip, tone === t && styles.optionChipSelected]}
              >
                <Text style={[styles.optionText, tone === t && styles.optionTextSelected]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Length */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Uzunluk</Text>
          <View style={styles.lengthRow}>
            {LENGTHS.map((l) => (
              <TouchableOpacity
                key={l.value}
                onPress={() => setLength(l.value)}
                style={[styles.lengthCard, length === l.value && styles.lengthCardSelected]}
              >
                <Text style={[styles.lengthLabel, length === l.value && styles.lengthLabelSelected]}>
                  {l.label}
                </Text>
                <Text style={styles.lengthDesc}>{l.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.generateContainer}>
          <GradientButton
            label={loading ? 'Yazılıyor…' : '✨ Kompozisyon Oluştur'}
            onPress={generate}
            loading={loading}
            gradient={Colors.gradientSecondary}
          />
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  headerTitle: { ...Typography.headlineMedium, color: Colors.text },
  headerSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  backBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  backText: { ...Typography.bodyMedium, color: Colors.primaryLight },
  newBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  newText: { ...Typography.labelMedium, color: Colors.textSecondary },
  metaBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  badge: {
    backgroundColor: Colors.primaryDark,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
  },
  badgeText: { ...Typography.labelSmall, color: Colors.primaryLight },
  formContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { marginBottom: Spacing.xl },
  sectionLabel: { ...Typography.titleMedium, color: Colors.text, marginBottom: Spacing.sm },
  topicInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    color: Colors.text,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: { ...Typography.labelSmall, color: Colors.textMuted, alignSelf: 'flex-end', marginTop: 4 },
  optionsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  optionChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  optionChipSelected: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.primary,
  },
  optionText: { ...Typography.labelMedium, color: Colors.textSecondary },
  optionTextSelected: { color: Colors.primaryLight, fontWeight: '600' },
  lengthRow: { flexDirection: 'row', gap: Spacing.sm },
  lengthCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    alignItems: 'center',
  },
  lengthCardSelected: { backgroundColor: Colors.primaryDark, borderColor: Colors.primary },
  lengthLabel: { ...Typography.titleMedium, color: Colors.text, marginBottom: 2 },
  lengthLabelSelected: { color: Colors.primaryLight },
  lengthDesc: { ...Typography.labelSmall, color: Colors.textSecondary, textAlign: 'center' },
  generateContainer: { marginTop: Spacing.md },
  resultScroll: { flex: 1 },
  resultContent: { padding: Spacing.lg, paddingBottom: Spacing.xl },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  resultText: {
    ...Typography.bodyLarge,
    color: Colors.text,
    lineHeight: 28,
  },
  improveBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  improveTitle: { ...Typography.labelMedium, color: Colors.textSecondary, marginBottom: Spacing.sm },
  improveRow: { flexDirection: 'row', gap: Spacing.sm },
  improveChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  improveChipDisabled: { opacity: 0.4 },
  improveChipText: { ...Typography.labelMedium, color: Colors.primaryLight },
});
