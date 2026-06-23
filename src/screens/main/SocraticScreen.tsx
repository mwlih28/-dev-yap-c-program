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
import { socraticChat, ChatMessage } from '../../services/groqService';
import ChatMessageComponent from '../../components/ChatMessage';
import GradientButton from '../../components/GradientButton';
import { Colors, Spacing, BorderRadius, Typography } from '../../theme';

const TOPIC_SUGGESTIONS = [
  { icon: '🌍', topic: 'İklim değişikliği neden önemlidir?' },
  { icon: '🧬', topic: 'DNA ve genetik miras nasıl çalışır?' },
  { icon: '🏛️', topic: 'Demokrasi neden önemlidir?' },
  { icon: '⚡', topic: 'Elektrik nasıl üretilir?' },
  { icon: '💭', topic: 'Serbest irade var mıdır?' },
  { icon: '🌱', topic: 'Sürdürülebilirlik neden önemlidir?' },
];

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export default function SocraticScreen() {
  const { groqApiKey, incrementStat } = useAuth();
  const [topic, setTopic] = useState('');
  const [activeTopic, setActiveTopic] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, loading]);

  async function startSession(t: string) {
    if (!t.trim()) return;
    if (!groqApiKey) {
      Alert.alert('API Anahtarı Eksik', 'Profil ekranından Groq API anahtarınızı ekleyin.');
      return;
    }

    setActiveTopic(t);
    setStarted(true);
    setMessages([]);
    setQuestionCount(0);
    setLoading(true);

    try {
      const res = await socraticChat(groqApiKey, t, [], true);
      if (res.success) {
        const aiMsg: Message = { id: Date.now().toString(), role: 'assistant', content: res.content };
        setMessages([aiMsg]);
        setQuestionCount(1);
        await incrementStat('totalSocraticSessions');
      } else {
        Alert.alert('Hata', res.error ?? 'Oturum başlatılamadı.');
        setStarted(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function sendReply() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history: ChatMessage[] = messages.map((m) => ({ role: m.role, content: m.content }));
      history.push({ role: 'user', content: text });

      const res = await socraticChat(groqApiKey, activeTopic, history, false);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: res.success ? res.content : `Hata: ${res.error}`,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setQuestionCount((c) => c + 1);
    } finally {
      setLoading(false);
    }
  }

  function endSession() {
    Alert.alert('Oturumu Bitir', 'Bu Sokratik öğrenme oturumunu bitirmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Bitir', onPress: () => {
          setStarted(false);
          setMessages([]);
          setTopic('');
          setActiveTopic('');
          setQuestionCount(0);
        },
      },
    ]);
  }

  if (!started) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#13132A', '#0A0A1A']} style={styles.header}>
          <Text style={styles.headerTitle}>🧠 Sokratik Öğrenme</Text>
          <Text style={styles.headerSub}>Sorularla düşün, keşfederek öğren</Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.startContent} keyboardShouldPersistTaps="handled">

          {/* Info card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Sokratik Yöntem Nedir?</Text>
            <Text style={styles.infoText}>
              Sokrates yöntemi, cevabı doğrudan vermek yerine sorular sorarak öğrencinin kendi başına düşünmesini
              ve sonuca ulaşmasını sağlayan bir öğretim tekniğidir. Bu yöntemle öğrendiklerini çok daha uzun süre hatırlarsın!
            </Text>
          </View>

          {/* Topic input */}
          <View style={styles.topicSection}>
            <Text style={styles.sectionLabel}>Bir konu veya soru gir:</Text>
            <TextInput
              style={styles.topicInput}
              value={topic}
              onChangeText={setTopic}
              placeholder="Örn: Yerçekimi nedir? Evren nasıl oluştu?"
              placeholderTextColor={Colors.textSecondary}
              multiline
              maxLength={200}
            />
            <GradientButton
              label="🚀 Oturumu Başlat"
              onPress={() => startSession(topic)}
              gradient={Colors.gradientSuccess}
              style={styles.startButton}
            />
          </View>

          {/* Suggestions */}
          <Text style={styles.sectionLabel}>Hazır konular:</Text>
          <View style={styles.suggestionsGrid}>
            {TOPIC_SUGGESTIONS.map((s) => (
              <TouchableOpacity
                key={s.topic}
                onPress={() => startSession(s.topic)}
                style={styles.suggestionCard}
              >
                <Text style={styles.suggestionIcon}>{s.icon}</Text>
                <Text style={styles.suggestionText}>{s.topic}</Text>
              </TouchableOpacity>
            ))}
          </View>

        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Active session header */}
      <LinearGradient colors={['#0D2D1A', '#0A0A1A']} style={styles.header}>
        <View style={styles.sessionHeaderRow}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionTopic} numberOfLines={1}>{activeTopic}</Text>
            <View style={styles.sessionMeta}>
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Aktif</Text>
              </View>
              <Text style={styles.questionCounter}>{questionCount} soru</Text>
            </View>
          </View>
          <TouchableOpacity onPress={endSession} style={styles.endButton}>
            <Text style={styles.endText}>Bitir</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesScroll}
        contentContainerStyle={styles.messagesContent}
        keyboardDismissMode="on-drag"
      >
        <View style={styles.socraticNote}>
          <Text style={styles.socraticNoteText}>
            💡 Asistan sana cevabı vermeyecek — seni düşünmeye yönlendirecek. Sorulara cevap ver!
          </Text>
        </View>
        {messages.map((msg) => (
          <ChatMessageComponent key={msg.id} role={msg.role} content={msg.content} />
        ))}
        {loading && <ChatMessageComponent role="assistant" content="" isLoading />}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Düşünceni yaz…"
            placeholderTextColor={Colors.textSecondary}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendReply}
            disabled={!input.trim() || loading}
            style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
          >
            <LinearGradient colors={Colors.gradientSuccess} style={styles.sendGradient}>
              <Text style={styles.sendIcon}>↑</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerTitle: { ...Typography.headlineMedium, color: Colors.text },
  headerSub: { ...Typography.bodySmall, color: Colors.textSecondary, marginTop: 2 },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: { flex: 1, marginRight: Spacing.md },
  sessionTopic: { ...Typography.titleLarge, color: Colors.text },
  sessionMeta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginTop: 4 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: Colors.success },
  liveText: { ...Typography.labelSmall, color: Colors.success },
  questionCounter: { ...Typography.labelSmall, color: Colors.textSecondary },
  endButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.error + '22',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error + '66',
  },
  endText: { ...Typography.labelMedium, color: Colors.error },
  startContent: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    marginBottom: Spacing.xl,
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  infoTitle: { ...Typography.titleLarge, color: Colors.text, marginBottom: Spacing.sm },
  infoText: { ...Typography.bodyMedium, color: Colors.textSecondary, lineHeight: 22 },
  topicSection: { marginBottom: Spacing.xl },
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
    marginBottom: Spacing.md,
  },
  startButton: { marginTop: Spacing.sm },
  suggestionsGrid: { gap: Spacing.sm },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  suggestionIcon: { fontSize: 24, width: 36 },
  suggestionText: { ...Typography.bodyMedium, color: Colors.textSecondary, flex: 1 },
  messagesScroll: { flex: 1 },
  messagesContent: { paddingVertical: Spacing.md },
  socraticNote: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.success + '15',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.success + '44',
  },
  socraticNoteText: { ...Typography.bodySmall, color: Colors.success, lineHeight: 18 },
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
  sendButton: { borderRadius: BorderRadius.full, overflow: 'hidden' },
  sendButtonDisabled: { opacity: 0.4 },
  sendGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.full,
  },
  sendIcon: { color: Colors.white, fontSize: 22, fontWeight: '700' },
});
