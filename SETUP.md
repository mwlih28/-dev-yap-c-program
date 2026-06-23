# YAP - Yapay Zeka Ödev Asistanı

Groq AI destekli kapsamlı ödev asistanı mobil uygulaması.

## Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. Firebase Kurulumu

1. [Firebase Console](https://console.firebase.google.com)'a git
2. Yeni proje oluştur
3. **Authentication** > Sign-in method > Email/Password aktif et
4. **Firestore Database** > Production mode ile oluştur
5. **Project Settings** > Your apps > Web app ekle
6. Config değerlerini kopyala

`src/services/firebaseConfig.ts` içindeki placeholder değerleri kendi Firebase değerlerinle değiştir:

```typescript
const firebaseConfig = {
  apiKey: 'BURAYA_FIREBASE_API_KEY',
  authDomain: 'BURAYA_AUTH_DOMAIN',
  projectId: 'BURAYA_PROJECT_ID',
  storageBucket: 'BURAYA_STORAGE_BUCKET',
  messagingSenderId: 'BURAYA_SENDER_ID',
  appId: 'BURAYA_APP_ID',
};
```

### 3. Firestore Kuralları

Firebase Console > Firestore > Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Groq API Key

1. [console.groq.com](https://console.groq.com) adresine git
2. Ücretsiz hesap oluştur
3. API Keys bölümünden anahtar oluştur
4. Uygulamada **Profil** ekranına gidip anahtarı gir

### 5. Çalıştırma

```bash
# Geliştirme (Expo Go olmadan - development client)
npm start

# Android APK build (EAS Build)
npm run build:android:preview

# Production build
npm run build:android
```

### 6. EAS Build Kurulumu (Expo Go olmadan APK için)

```bash
npm install -g eas-cli
eas login
eas build:configure
npm run build:android:preview
```

## Özellikler

| Özellik | Açıklama |
|---------|----------|
| 📚 Ödev Yardımcısı | 10 farklı derste soru-cevap |
| ✏️ Kompozisyon Yazıcı | 6 tür, 5 ton, 3 uzunluk seçeneği |
| 🧠 Sokratik Öğrenme | Sorularla düşünerek öğrenme |
| 👤 Profil | İstatistikler, API anahtar yönetimi |
| 🔐 Auth | Email/şifre ile kayıt ve giriş |

## Teknoloji Stack

- **React Native** (Expo SDK 52)
- **Firebase** (Authentication + Firestore)
- **Groq AI** (Llama 3.3 70B)
- **React Navigation** v6
- **React Native Paper** v5
- **TypeScript**
