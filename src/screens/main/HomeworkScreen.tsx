import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import { askHomework, ChatMessage } from '../../services/groqService';
import ChatMessageComponent from '../../components/ChatMessage';
import { Colors, Spacing, BorderRadius, Typography, Colors as C } from '../../theme';

const SUBJECTS = [
  { id: 'Matematik', icon: '🔢', color: C.subjects.matematik },
  { id: 'Fen Bilgisi', icon: '🔬', color: C.subjects.fen },
  { id: 'Türkçe', icon: '📖', color: C.subjects.turkce },
  { id: 'Tarih', icon: '🏛️', color: C.subjects.tarih },
  { id: 'İngilizce', icon: '🌍', color: C.subjects.ingilizce },
  { id: 'Fizik', icon: '⚛️', color: C.subjects.fizik },
  { id: 'Kimya', icon: '🧪', color: C.subjects.kimya },
  { id: 'Biyoloji', icon: '🌱', color: C.subjects.biyoloji },
  { id: 'Coğrafya', icon: '🗺️', color: C.subjects.cografya },
  { id: 'Felsefe', icon: '💭', color: C.subjects.felsefe },
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function HomeworkScreen() {
  const { groqApiKey, incrementStat } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    if (!groqApiKey) {
      Alert.alert('API Anahtarı Eksik', 'Profil ekranından Groq API anahtarınızı ekleyin.');
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
      const result = await askHomework(groqApiKey, selectedSubject.id, text, history);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.success ? result.content : `Hata: ${result.error}`,
      };
      setMessages((prev) => [...prev, aiMsg]);

      if (result.success) {
        await incrementStat('totalQuestions');
      }
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    Alert.alert('Sohbeti Temizle', 'Tüm mesajlar silinecek, emin misin?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Temizle', style: 'destructive', onPress: () => setMessages([]) },
    ]);
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <LinearGradient colors={['#13132A', '#0A0A1A']} style={styles.header}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerTitle}>📚 Ödev Yardımcısı</Text>
            <Text style={styles.headerSub}>Ders seç, soruyu yaz</Text>
          </View>
          {messages.length > 0 && (
            <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
              <Text style={styles.clearText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Subject chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectsScroll}>
          <View style={styles.subjectsRow}>
            {SUBJECTS.map((s) => (
              <TouchableOpacity
                key={s.id}
                onPress={() => setSelectedSubject(s)}
                style={[
                  styles.subjectChip,
                  selectedSubject.id === s.id && { backgroundColor: s.color + '33', borderColor: s.color },
                ]}
              >
                <Text style={styles.subjectIcon}>{s.icon}</Text>
                <Text style={[styles.subjectText, selectedSubject.id === s.id && { color: s.color }]}>
                  {s.id}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={[styles.messagesContent, messages.length === 0 && styles.emptyContent]}
        keyboardDismissMode="on-drag"
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>{selectedSubject.icon}</Text>
            <Text style={styles.emptyTitle}>{selectedSubject.id} dersinde yardım</Text>
            <Text style={styles.emptyText}>
              Sorunuzu aşağıya yazın. Adım adım, anlaşılır bir şekilde açıklayayım!
            </Text>
            <View style={styles.suggestionsBox}>
              <Text style={styles.suggestionsTitle}>Örnek sorular:</Text>
              {getSuggestions(selectedSubject.id).map((s, i) => (
                <TouchableOpacity key={i} onPress={() => setInput(s)} style={styles.suggestionChip}>
                  <Text style={styles.suggestionText}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessageComponent key={msg.id} role={msg.role} content={msg.content} />
            ))}
            {loading && <ChatMessageComponent role="assistant" content="" isLoading />}
          </>
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={`${selectedSubject.id} sorunuzu yazın...`}
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={1000}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          >
            <LinearGradient
              colors={Colors.gradientPrimary}
              style={styles.sendGradient}
            >
              <Text style={styles.sendIcon}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function getSuggestions(subject: string): string[] {
  const map: Record<string, string[]> = {
    'Matematik': ['Kesirlerde çarpma nasıl yapılır?', 'Denklem çözme adımları nelerdir?', 'Alan hesabı nasıl yapılır?'],
    'Fen Bilgisi': ['Fotosentez nedir?', 'Maddenin halleri nelerdir?', 'Besin zinciri nasıl çalışır?'],
    'Türkçe': ['Sıfat nedir, örnek ver', 'Fiilimsi türleri nelerdir?', 'Paragraf yazımı nasıl olmalı?'],
    'Tarih': ['Fransız İhtilali sebepleri nelerdir?', 'Osmanlı\'nın kuruluşu nasıl oldu?', 'Atatürk\'ün inkılapları nelerdir?'],
    'İngilizce': ['Present tense nasıl kullanılır?', 'Irregular verbs nelerdir?', 'Paragraf yazımı nasıl yapılır?'],
    'Fizik': ['Newton\'un hareket yasaları nelerdir?', 'Enerji dönüşümü nasıl çalışır?', 'Elektrik devresi nasıl kurulur?'],
    'Kimya': ['Asit-baz nedir?', 'Periyodik tablo nasıl okunur?', 'Kimyasal denklem nasıl denkleştirilir?'],
    'Biyoloji': ['Hücre bölünmesi nasıl gerçekleşir?', 'DNA nedir, görevi nedir?', 'Ekosistem nedir?'],
  };
  return map[subject] ?? ['Bu konuda soru sormak istiyorum', 'Konu hakkında bilgi ver', 'Örnek bir problem çöz'];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    ...Typography.headlineMedium,
    color: Colors.text,
  },
  headerSub: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  clearButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  clearText: {
    ...Typography.labelMedium,
    color: Colors.error,
  },
  subjectsScroll: {
    paddingLeft: Spacing.lg,
  },
  subjectsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  subjectChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  subjectIcon: { fontSize: 14 },
  subjectText: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
  },
  messagesScroll: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: Spacing.md,
  },
  emptyContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.headlineSmall,
    color: Colors.text,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  suggestionsBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  suggestionsTitle: {
    ...Typography.labelMedium,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  suggestionChip: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 2,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  suggestionText: {
    ...Typography.bodySmall,
    color: Colors.primaryLight,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    color: Colors.text,
    fontSize: 15,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sendButton: {
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  sendIcon: {
    color: Colors.white,
    fontSize: 22,
    fontWeight: '700',
  },
});
