'use strict';

const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { sql, initSchema } = require('../lib/db');

const app = express();

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());

// DB şemasını oluştur (ilk çağrıda)
let schemaReady = false;
async function ensureSchema() {
  if (!schemaReady) {
    await initSchema();
    schemaReady = true;
  }
}

// ─── Middleware: JWT doğrulama ────────────────────────────────────
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token gerekli.' });
  }
  try {
    req.user = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token.' });
  }
}

// ─── Health check ─────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── POST /api/auth/register ──────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
  try {
    await ensureSchema();
    const { email, password, displayName, grade } = req.body;

    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, şifre ve isim zorunlu.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Şifre en az 6 karakter olmalı.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const rows = await sql`
      INSERT INTO users (email, password_hash, display_name, grade)
      VALUES (${email.toLowerCase().trim()}, ${passwordHash}, ${displayName.trim()}, ${grade || ''})
      RETURNING id, email, display_name, grade,
                total_questions, total_compositions, total_socratic_sessions, created_at
    `;
    const user = formatUser(rows[0]);
    const token = signToken(user.id);

    res.status(201).json({ token, user });
  } catch (err) {
    if (err.message?.includes('unique') || err.code === '23505') {
      return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı.' });
    }
    console.error('register error:', err);
    res.status(500).json({ error: 'Kayıt işlemi başarısız.' });
  }
});

// ─── POST /api/auth/login ─────────────────────────────────────────
app.post('/api/auth/login', async (req, res) => {
  try {
    await ensureSchema();
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre zorunlu.' });
    }

    const rows = await sql`
      SELECT * FROM users WHERE email = ${email.toLowerCase().trim()}
    `;
    if (rows.length === 0) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı.' });
    }

    const user  = formatUser(rows[0]);
    const token = signToken(user.id);
    res.json({ token, user });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ error: 'Giriş başarısız.' });
  }
});

// ─── POST /api/auth/change-password ───────────────────────────────
app.post('/api/auth/change-password', authenticate, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Mevcut ve yeni şifre zorunlu.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Yeni şifre en az 6 karakter.' });
    }

    const rows = await sql`SELECT * FROM users WHERE id = ${req.user.userId}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

    const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Mevcut şifre hatalı.' });

    const newHash = await bcrypt.hash(newPassword, 10);
    await sql`UPDATE users SET password_hash = ${newHash} WHERE id = ${req.user.userId}`;
    res.json({ success: true });
  } catch (err) {
    console.error('change-password error:', err);
    res.status(500).json({ error: 'Şifre değiştirilemedi.' });
  }
});

// ─── GET /api/users/:id ───────────────────────────────────────────
app.get('/api/users/:id', authenticate, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }
    const rows = await sql`
      SELECT id, email, display_name, grade,
             total_questions, total_compositions, total_socratic_sessions, created_at
      FROM users WHERE id = ${req.params.id}
    `;
    if (rows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });
    res.json(formatUser(rows[0]));
  } catch (err) {
    console.error('get user error:', err);
    res.status(500).json({ error: 'Kullanıcı bilgisi alınamadı.' });
  }
});

// ─── PATCH /api/users/:id ─────────────────────────────────────────
app.patch('/api/users/:id', authenticate, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }
    const { displayName, grade } = req.body;
    const rows = await sql`
      UPDATE users
      SET display_name = COALESCE(${displayName || null}, display_name),
          grade        = COALESCE(${grade || null}, grade)
      WHERE id = ${req.params.id}
      RETURNING id, email, display_name, grade,
                total_questions, total_compositions, total_socratic_sessions, created_at
    `;
    res.json(formatUser(rows[0]));
  } catch (err) {
    console.error('update user error:', err);
    res.status(500).json({ error: 'Profil güncellenemedi.' });
  }
});

// ─── POST /api/users/:id/stats ────────────────────────────────────
app.post('/api/users/:id/stats', authenticate, async (req, res) => {
  try {
    if (req.user.userId !== req.params.id) {
      return res.status(403).json({ error: 'Yetkisiz erişim.' });
    }
    const { field } = req.body;

    let rows;
    if (field === 'totalQuestions') {
      rows = await sql`
        UPDATE users SET total_questions = total_questions + 1
        WHERE id = ${req.params.id} RETURNING total_questions AS value
      `;
    } else if (field === 'totalCompositions') {
      rows = await sql`
        UPDATE users SET total_compositions = total_compositions + 1
        WHERE id = ${req.params.id} RETURNING total_compositions AS value
      `;
    } else if (field === 'totalSocraticSessions') {
      rows = await sql`
        UPDATE users SET total_socratic_sessions = total_socratic_sessions + 1
        WHERE id = ${req.params.id} RETURNING total_socratic_sessions AS value
      `;
    } else {
      return res.status(400).json({ error: 'Geçersiz istatistik alanı.' });
    }

    res.json({ success: true, newValue: rows[0]?.value });
  } catch (err) {
    console.error('stats error:', err);
    res.status(500).json({ error: 'İstatistik güncellenemedi.' });
  }
});

// ─── Yardımcı fonksiyonlar ────────────────────────────────────────
function formatUser(row) {
  return {
    id:                    row.id,
    email:                 row.email,
    displayName:           row.display_name,
    grade:                 row.grade,
    totalQuestions:        row.total_questions,
    totalCompositions:     row.total_compositions,
    totalSocraticSessions: row.total_socratic_sessions,
    createdAt:             row.created_at,
  };
}

function signToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// ─── 404 handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint bulunamadı.' });
});

// Local geliştirme için
if (require.main === module) {
  require('dotenv').config();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`YAP Backend çalışıyor: http://localhost:${PORT}`));
}

module.exports = app;
