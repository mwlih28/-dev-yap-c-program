const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export type GroqResponse = {
  success: boolean;
  content: string;
  error?: string;
};

async function callGroq(
  apiKey: string,
  messages: ChatMessage[],
  options?: { model?: string; temperature?: number; maxTokens?: number }
): Promise<GroqResponse> {
  if (!apiKey || apiKey.trim() === '') {
    return { success: false, content: '', error: 'API anahtarı eksik. Profil ekranından Groq API anahtarınızı girin.' };
  }

  try {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options?.model ?? DEFAULT_MODEL,
        messages,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = (errorData as any)?.error?.message ?? `HTTP ${response.status}`;
      return { success: false, content: '', error: msg };
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content ?? '';
    return { success: true, content };
  } catch (err: any) {
    return { success: false, content: '', error: err?.message ?? 'Bağlantı hatası' };
  }
}

export async function askHomework(
  apiKey: string,
  subject: string,
  question: string,
  history: ChatMessage[]
): Promise<GroqResponse> {
  const systemPrompt = `Sen yardımcı ve anlayışlı bir öğretmensin. Türkçe eğitim sisteminde ${subject} dersinde öğrencilere yardım ediyorsun.

Kurallar:
- Her zaman Türkçe cevap ver
- Cevaplarını adım adım açıkla, anlaşılır ol
- Öğrencinin seviyesine uygun dil kullan
- Soruyu çözerken neden-sonuç ilişkisini vurgula
- Formüller ve kavramları net açıkla
- Cevabın sonunda öğrencinin anladığını kontrol et`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8),
    { role: 'user', content: question },
  ];

  return callGroq(apiKey, messages, { temperature: 0.5 });
}

export async function generateComposition(
  apiKey: string,
  topic: string,
  type: string,
  tone: string,
  length: 'kısa' | 'orta' | 'uzun'
): Promise<GroqResponse> {
  const wordCounts = { kısa: '150-250', orta: '300-500', uzun: '600-900' };
  const systemPrompt = `Sen Türkçe kompozisyon yazmada uzman bir yazarsın. Akıcı, etkileyici ve özgün Türkçe metinler yazıyorsun.`;

  const userPrompt = `"${topic}" konusunda ${type} türünde, ${tone} bir ton ile ${wordCounts[length]} kelimelik bir kompozisyon yaz.

Kompozisyon şunları içermeli:
- Güçlü bir giriş paragrafı
- Konuyu detaylandıran gelişme bölümü
- Etkileyici bir sonuç paragrafı
- Türkçe yazım ve noktalama kurallarına uygunluk`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ];

  return callGroq(apiKey, messages, { temperature: 0.85, maxTokens: 3000 });
}

export async function socraticChat(
  apiKey: string,
  topic: string,
  history: ChatMessage[],
  isFirst: boolean
): Promise<GroqResponse> {
  const systemPrompt = `Sen Sokrates yöntemini kullanan deneyimli bir öğretmensin. Amacın öğrenciye cevabı doğrudan vermek yerine, onlara rehberlik ederek kendi başlarına düşünmelerini ve sonuca ulaşmalarını sağlamak.

Kurallar:
- Cevap vermek yerine soru sor
- Her soruda öğrenciyi bir adım ilerlet
- Öğrencinin verdiği cevapları over analiz et
- Yanlış anlamaları nazikçe fark ettir, cevabı söyleme
- Öğrenciyi tebrik et ama hep bir sonraki soruya yönlendir
- Konu: ${topic}
- Türkçe konuş`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-12),
  ];

  if (isFirst) {
    messages.push({
      role: 'user',
      content: `"${topic}" konusunu anlamak istiyorum.`,
    });
  }

  return callGroq(apiKey, messages, { temperature: 0.7 });
}

export async function improveText(
  apiKey: string,
  text: string,
  instruction: string
): Promise<GroqResponse> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'Sen Türkçe metin düzenleme ve geliştirme uzmanısın.',
    },
    {
      role: 'user',
      content: `Aşağıdaki metni şu talimatla düzenle: ${instruction}\n\nMetin:\n${text}`,
    },
  ];

  return callGroq(apiKey, messages, { temperature: 0.6, maxTokens: 3000 });
}
