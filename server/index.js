const fs = require('fs');
const path = require('path');
const express = require('express');
const {
  createAccessRequest,
  attachAiResultToScan,
  createMessage,
  createScan,
  deleteMessage,
  deleteScan,
  getAccessRequests,
  getConversation,
  getDoctorById,
  getDoctors,
  getMessagesForUser,
  getPatientById,
  getPatients,
  getScanById,
  getScans,
  getSessionUser,
  getUserById,
  getUsers,
  loginUser,
  logoutSession,
  markMessageAsRead,
  updateAccessRequest,
  updatePatient,
  updateScan,
} = require('./appDb');
const {
  addAuditLog,
  addRecognitionEvents,
  endSession,
  getAnalyticsSnapshot,
  getAuditLogs,
  getRecognitionEvents,
  startSession,
} = require('./storage');

const loadEnvFile = filePath => {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) return;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key]) return;

    let value = trimmed.slice(separatorIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  });
};

loadEnvFile(path.resolve(__dirname, '../.env'));
loadEnvFile(path.resolve(__dirname, '.env'));

const app = express();
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '127.0.0.1';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = (
  process.env.OPENROUTER_API_KEY ||
  process.env.REACT_APP_OPENROUTER_API_KEY ||
  ''
).trim();
const OPENROUTER_MODEL = (
  process.env.OPENROUTER_MODEL ||
  process.env.REACT_APP_OPENROUTER_MODEL ||
  'openai/gpt-4o-mini'
).trim();
const OPENROUTER_SITE_URL = (
  process.env.OPENROUTER_SITE_URL ||
  process.env.REACT_APP_OPENROUTER_SITE_URL ||
  ''
).trim();
const OPENROUTER_APP_NAME = (
  process.env.OPENROUTER_APP_NAME ||
  process.env.REACT_APP_OPENROUTER_APP_NAME ||
  'Noura AI'
).trim();
const AI_SERVICE_URL = (process.env.AI_SERVICE_URL || 'http://127.0.0.1:8001/predict').trim();
const AI_SERVICE_TOKEN = (process.env.AI_SERVICE_TOKEN || '').trim();
const AI_SERVICE_TIMEOUT_MS = Number(process.env.AI_SERVICE_TIMEOUT_MS || 45000);
const AI_SERVICE_UPLOAD_FIELD = (process.env.AI_SERVICE_UPLOAD_FIELD || 'file').trim();
const RECOGNITION_INGEST_TOKEN = (process.env.RECOGNITION_INGEST_TOKEN || '').trim();
const CLIENT_ORIGIN = (
  process.env.CLIENT_ORIGIN || 'http://127.0.0.1:3000,http://localhost:3000'
).trim();
const COOKIE_NAME = 'noura_session';
const ALLOWED_ORIGINS = CLIENT_ORIGIN.split(',')
  .map(origin => origin.trim())
  .filter(Boolean);
const MAX_BODY_FIELDS = 40;
const loginAttempts = new Map();
const requestCounters = new Map();

// Enforce presence of OPENROUTER_API_KEY unless developer explicitly opts into demo mode
if (!OPENROUTER_API_KEY) {
  if (String(process.env.FORCE_DEMO || '').toLowerCase() === 'true') {
    // explicit opt-in for demo behaviour
    console.warn('WARN: OPENROUTER_API_KEY not set — starting in DEMO mode because FORCE_DEMO=true');
  } else {
    console.error('\nERROR: OPENROUTER_API_KEY is not set in the environment.');
    console.error('To enable the real AI provider set OPENROUTER_API_KEY in your .env or export it in the shell.');
    console.error('If you intentionally want the demo fallback, set FORCE_DEMO=true in your environment.');
    process.exit(1);
  }
} else {
  console.log('Using OpenRouter provider for AI requests.');
}

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

const parseCookies = req => {
  const header = req.headers.cookie || '';
  return header.split(';').reduce((cookies, entry) => {
    const [rawKey, ...rawValue] = entry.trim().split('=');
    if (!rawKey) return cookies;
    cookies[rawKey] = decodeURIComponent(rawValue.join('=') || '');
    return cookies;
  }, {});
};

const getAuthToken = req => {
  const cookies = parseCookies(req);
  if (cookies[COOKIE_NAME]) return cookies[COOKIE_NAME];
  const header = req.headers.authorization || '';
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return req.headers['x-auth-token'] || null;
};

const setSessionCookie = (res, token) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (isProduction) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
};

const clearSessionCookie = res => {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (isProduction) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
};

const requireAuth = (req, res, next) => {
  const token = getAuthToken(req);
  const user = getSessionUser(token);
  if (!user) {
    return res.status(401).json({ ok: false, message: 'Unauthorized', code: 'UNAUTHORIZED' });
  }

  req.authToken = token;
  req.user = user;
  return next();
};

const requireRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  return next();
};

const isAdmin = user => user?.role === 'admin';
const isDoctor = user => user?.role === 'doctor';
const isNurse = user => user?.role === 'nurse';
const isPatient = user => user?.role === 'patient';

const getPatientRecord = patientId => getPatientById(patientId);

const canAccessPatient = (user, patientId) => {
  if (!user || !patientId) return false;
  if (isAdmin(user)) return true;

  const patient = getPatientRecord(patientId);
  if (!patient) return false;

  if (isPatient(user)) return user.userId === patient.userId;
  if (isDoctor(user)) return patient.assignedDoctorId === user.userId;
  if (isNurse(user)) return patient.assignedDoctorId === user.assignedDoctorId;
  return false;
};

const canAccessDoctor = (user, doctorId) => {
  if (!user || !doctorId) return false;
  if (isAdmin(user)) return true;
  if (isDoctor(user)) return user.userId === doctorId;
  if (isPatient(user)) return user.assignedDoctorId === doctorId;
  if (isNurse(user)) return user.assignedDoctorId === doctorId;
  return false;
};

const canManageScan = (user, scan) => {
  if (!user || !scan) return false;
  if (isAdmin(user)) return true;
  if (isDoctor(user)) {
    const patient = getPatientRecord(scan.patientId);
    return patient?.assignedDoctorId === user.userId;
  }
  if (isNurse(user)) {
    const patient = getPatientRecord(scan.patientId);
    return patient?.assignedDoctorId === user.assignedDoctorId;
  }
  return false;
};

const canMessageUser = (sender, receiver) => {
  if (!sender || !receiver) return false;
  if (isAdmin(sender)) return true;
  if (sender.userId === receiver.userId) return false;

  if (isPatient(sender)) {
    return (
      receiver.userId === sender.assignedDoctorId ||
      (isNurse(receiver) && receiver.assignedDoctorId === sender.assignedDoctorId)
    );
  }

  if (isDoctor(sender)) {
    return (
      (isPatient(receiver) && receiver.assignedDoctorId === sender.userId) ||
      (isNurse(receiver) && receiver.assignedDoctorId === sender.userId)
    );
  }

  if (isNurse(sender)) {
    return (
      receiver.userId === sender.assignedDoctorId ||
      (isPatient(receiver) && receiver.assignedDoctorId === sender.assignedDoctorId)
    );
  }

  return false;
};

const sanitizeText = (value, maxLength = 500) =>
  String(value || '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, maxLength);

const hasRecognitionIngestAccess = req => {
  const providedToken = String(
    req.headers['x-recognition-token'] ||
      req.headers['x-ingest-token'] ||
      req.headers.authorization?.replace(/^Bearer\s+/i, '') ||
      ''
  ).trim();

  if (RECOGNITION_INGEST_TOKEN && providedToken === RECOGNITION_INGEST_TOKEN) return true;
  return Boolean(req.user && isAdmin(req.user));
};

const normalizeRecognitionPayload = payload => {
  const entries = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.events)
      ? payload.events
      : payload?.event
        ? [payload.event]
        : payload
          ? [payload]
          : [];

  return entries
    .filter(entry => entry && typeof entry === 'object')
    .map(entry => ({
      name: sanitizeText(entry.name, 120) || 'Unknown',
      confidence: Number(entry.confidence || 0),
      timestamp: sanitizeText(entry.timestamp, 40) || new Date().toISOString(),
      bbox: Array.isArray(entry.bbox) ? entry.bbox.slice(0, 4).map(value => Number(value) || 0) : [],
      received_at:
        sanitizeText(entry.received_at, 40) ||
        new Date().toISOString().replace('T', ' ').slice(0, 19),
    }))
    .filter(entry => entry.bbox.length === 4);
};

const pickAllowedFields = (payload, allowedFields) =>
  Object.fromEntries(
    Object.entries(payload || {}).filter(
      ([key, value]) => allowedFields.includes(key) && value !== undefined
    )
  );

const validateBodyShape = (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) return next();
  const keys = Object.keys(req.body);
  if (keys.length > MAX_BODY_FIELDS) {
    return res.status(400).json({
      ok: false,
      message: 'Payload contains too many fields',
      code: 'INVALID_PAYLOAD',
    });
  }
  return next();
};

const applyRateLimit = ({ keyPrefix, limit, windowMs, message, resolveKey }) => {
  return (req, res, next) => {
    const identifier = resolveKey?.(req) || req.ip || 'unknown';
    const key = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const entry = requestCounters.get(key);

    if (!entry || now > entry.resetAt) {
      requestCounters.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({
        ok: false,
        message,
        code: 'RATE_LIMITED',
      });
    }

    entry.count += 1;
    requestCounters.set(key, entry);
    return next();
  };
};

const buildDemoMedicalReply = (message, history = []) => {
  const normalized = String(message || '').toLowerCase().trim();

  // Include history in hash so replies can vary based on conversation context
  const historyStr = Array.isArray(history) ? history.map(h => String(h.content || '')).join('|') : '';
  const hash = String(normalized + '|' + historyStr)
    .split('')
    .reduce((s, c) => s + c.charCodeAt(0), 0);

  const templates = [
    msg => `سؤالك: "${msg}" — إجابة عامة: ${buildShortGuidance(msg)} `,
    msg => `رد تجريبي: ${buildShortGuidance(msg)} إذا أردت تفاصيل أكثر، أضف سياقًا أو أمثلة.`,
    msg => `حسنًا — ${buildShortGuidance(msg)} ملاحظة: هذه مساعدة تجريبية وليست تشخيصًا طبيًا.`,
    msg => `نقطة سريعة: ${buildShortGuidance(msg)} يمكنك دائمًا مشاركة صورة أو نتائج لفحص لمساعدة التوجيه.`,
  ];

  // Keyword-driven overrides for common intents
  if (normalized.includes('upload') || normalized.includes('scan') || normalized.includes('رفع')) {
    const opts = [
      'يمكنك رفع الفحص من صفحة Upload ثم متابعة النتيجة من Results. تأكد من اختيار الملف الصحيح وإرفاق أي ملاحظات مطلوبة قبل الإرسال.',
      'لرفع الفحص: اذهب إلى صفحة Upload واختر الملف ثم اضغط Submit. بعد المعالجة ستجد النتيجة في صفحة Results.',
      'لتحميل فحصك، استخدم زر Upload في القائمة العلوية للـ Upload page، ثم انتظر اكتمال المعالجة لمراجعة النتيجة.'
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  if (
    normalized.includes('result') ||
    normalized.includes('analysis') ||
    normalized.includes('نتيجة') ||
    normalized.includes('تحليل')
  ) {
    const opts = [
      'يمكنك مراجعة النتائج من صفحة Results. التفسير النهائي لأي نتيجة يجب أن يكون مع طبيب مختص؛ إذا أردت مساعدة في قراءة الحقول أو المصطلحات فأرسل النص هنا.',
      'النتائج متاحة في صفحة Results، وإذا أردت توضيحًا لمصطلح أو قيمة معينة أرسلها هنا وسأحاول توضيحها بشكل مبسّط.',
      'راجع Results لعرض تفاصيل التحليل؛ للمساعدة في تفسير القيم أرسل النص أو الحقول التي تريد شرحها.'
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  if (normalized.includes('cancer') || normalized.includes('سرطان')) {
    const opts = [
      'الاكتشاف المبكر مهم جدًا. أنصح بمراجعة الطبيب وإجراء الفحوصات اللازمة. هذه معلومات عامة وليست تشخيصًا.',
      'من الأفضل مراجعة الطبيب لإجراء فحوصات إضافية عند وجود شك. هذه مساعدة عامة وليست بديلاً عن رأي طبيب مختص.',
      'إذا كنت قلقًا بشأن أعراض معينة، التواصل مع الطبيب وإجراء الفحوصات المبكرة يساعد في التدخل المبكر.'
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  if (
    normalized.includes('appointment') ||
    normalized.includes('doctor') ||
    normalized.includes('موعد') ||
    normalized.includes('طبيب')
  ) {
    const opts = [
      'يمكنك استخدام صفحات النظام الخاصة بالمواعيد أو الرسائل للتواصل مع الطبيب. إذا كانت الحالة عاجلة، تواصل مع الطوارئ.',
      'لحجز موعد، استخدم صفحة Appointments أو تواصل مع الفريق عبر Messages. للحالات الطارئة اتصل بالطوارئ.',
      'الجدولة تتم عبر صفحة Appointments في النظام، أو اطلب مساعدة من فريق الدعم إذا واجهت مشكلة.'
    ];
    return opts[Math.floor(Math.random() * opts.length)];
  }

  // Fallback: pick a template based on hash to vary phrasing per input
  const idx = Math.abs(hash) % templates.length;
  return templates[idx](String(message || '')); 
};

// Helper to produce short guidance strings based on message content
const buildShortGuidance = msg => {
  const t = String(msg || '').toLowerCase();
  if (!t) return 'أحتاج سؤالك أو مزيد من التفاصيل لأردّ بدقة.';
  if (t.length < 40) return `يمكن توضيح: "${msg}" — حاول إضافة أعراض أو زمن الحالة.`;
  // return a short paraphrase without exposing sensitive content
  const snippet = msg.length > 120 ? `${msg.slice(0, 117)}...` : msg;
  return `ملخّص سؤالك: "${snippet}" — للأسف هذه إجابة تجريبية.`;
};

const buildMedicalMessages = (message, history = []) => [
  {
    role: 'system',
    content:
      'أنت مساعد طبي ذكي (لا تقوم بالتشخيص النهائي ولا تصف أدوية). ' +
      'قدّم معلومات طبية عامة، واشرح للمستخدم بلغة بسيطة، ' +
      'وانصح دائمًا بمراجعة طبيب مختص قبل أي قرار علاجي. ' +
      'إذا سُئلت عن شيء خارج الطب، يمكنك الإجابة لكن وضّح أنك مساعد طبي بالأساس.',
  },
  ...history.map(item => ({
    role: item?.role === 'user' ? 'user' : 'assistant',
    content: String(item?.content || ''),
  })),
  {
    role: 'user',
    content: String(message || ''),
  },
];

const buildDemoAnalysis = payload => {
  const scanType = String(payload.scanType || '').toLowerCase();

  if (scanType.includes('oncology') || scanType.includes('medical')) {
    return {
      prediction: 'Normal',
      confidence: 96.4,
      recommendation: 'Routine oncology follow-up is suggested based on the uploaded scan.',
      modelVersion: 'demo-oncology-v1',
    };
  }

  if (scanType.includes('brain')) {
    return {
      prediction: 'Follow-up',
      confidence: 91.2,
      recommendation: 'Review with radiologist and compare with previous scans.',
      modelVersion: 'demo-brain-v1',
    };
  }

  return {
    prediction: 'Normal',
    confidence: 94.8,
    recommendation: 'Clinical review recommended before final medical decision.',
    modelVersion: 'demo-general-v1',
  };
};

const fetchWithTimeout = async (url, options, timeoutMs) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const inferExtensionFromMimeType = mimeType => {
  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/bmp') return '.bmp';
  if (mimeType === 'image/webp') return '.webp';
  return '.jpg';
};

const fileFromBase64 = (imageBase64, fileName = 'scan-upload') => {
  const match = String(imageBase64 || '').match(/^data:(.+);base64,(.+)$/);
  const mimeType = match?.[1] || 'image/jpeg';
  const rawBase64 = match?.[2] || String(imageBase64 || '');
  const buffer = Buffer.from(rawBase64, 'base64');
  const extension = path.extname(fileName) || inferExtensionFromMimeType(mimeType);
  return new File([buffer], `${path.basename(fileName, path.extname(fileName))}${extension}`, {
    type: mimeType,
  });
};

const fileFromImageUrl = async imageUrl => {
  const response = await fetchWithTimeout(imageUrl, {}, AI_SERVICE_TIMEOUT_MS);
  if (!response.ok) {
    throw new Error(`Failed to fetch imageUrl: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const mimeType = response.headers.get('content-type') || 'image/jpeg';
  const extension = inferExtensionFromMimeType(mimeType);
  return new File([Buffer.from(arrayBuffer)], `scan-from-url${extension}`, {
    type: mimeType,
  });
};

const buildRemoteAiFormData = async payload => {
  const appendImage = formData => {
    if (payload.scanType) {
      formData.append('scan_type', String(payload.scanType));
    }
    return formData;
  };

  if (payload.imageBase64) {
    const file = fileFromBase64(payload.imageBase64, payload.metadata?.fileName || 'scan-upload');
    const formData = new FormData();
    formData.append(AI_SERVICE_UPLOAD_FIELD, file);
    return appendImage(formData);
  }

  if (payload.imageUrl) {
    const file = await fileFromImageUrl(payload.imageUrl);
    const formData = new FormData();
    formData.append(AI_SERVICE_UPLOAD_FIELD, file);
    return appendImage(formData);
  }

  throw new Error('No imageBase64 or imageUrl provided for AI analysis');
};

const normalizeAiResult = remoteData => ({
  prediction:
    remoteData.prediction ||
    remoteData.result ||
    remoteData.label ||
    remoteData.cancer_type ||
    'Unknown',
  cancerType:
    remoteData.cancer_type || remoteData.prediction || remoteData.result || remoteData.label,
  confidence:
    typeof remoteData.confidence === 'number'
      ? remoteData.confidence <= 1
        ? Math.round(remoteData.confidence * 1000) / 10
        : remoteData.confidence
      : Number(remoteData.confidence || 0),
  recommendation: remoteData.recommendation || remoteData.notes || remoteData.summary || '',
  riskLevel: remoteData.risk_level || remoteData.riskLevel || 'Unknown',
  top2: Array.isArray(remoteData.top2) ? remoteData.top2 : [],
  modelVersion: remoteData.modelVersion || remoteData.model || 'unknown',
  raw: remoteData,
  analyzedAt: new Date().toISOString(),
});

const processAiAnalysis = async payload => {
  if (!payload?.scanId) {
    throw new Error('scanId is required for AI analysis');
  }

  if (!AI_SERVICE_URL) {
    const demoResult = buildDemoAnalysis(payload);
    const updatedScan = attachAiResultToScan(payload.scanId, {
      ...demoResult,
      analyzedAt: new Date().toISOString(),
      raw: { source: 'demo-fallback' },
    });
    return {
      updatedScan,
      source: 'demo-fallback',
      result: updatedScan.aiResult || demoResult,
    };
  }

  const remoteBody = await buildRemoteAiFormData(payload);

  const response = await fetchWithTimeout(
    AI_SERVICE_URL,
    {
      method: 'POST',
      headers: {
        ...(AI_SERVICE_TOKEN ? { Authorization: `Bearer ${AI_SERVICE_TOKEN}` } : {}),
      },
      body: remoteBody,
    },
    AI_SERVICE_TIMEOUT_MS
  );

  const rawText = await response.text();
  let remoteData = {};

  try {
    remoteData = rawText ? JSON.parse(rawText) : {};
  } catch {
    remoteData = { raw: rawText };
  }

  if (!response.ok) {
    throw new Error(remoteData?.message || `AI service returned status ${response.status}`);
  }

  const normalizedResult = normalizeAiResult(remoteData);
  const updatedScan = attachAiResultToScan(payload.scanId, normalizedResult);

  return {
    updatedScan,
    source: 'remote-ai-service',
    result: updatedScan.aiResult || normalizedResult,
  };
};

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (!origin || ALLOWED_ORIGINS.includes(origin)) {
    if (origin) res.header('Access-Control-Allow-Origin', origin);
  } else {
    return res.status(403).json({ ok: false, message: 'Origin not allowed', code: 'ORIGIN_DENIED' });
  }

  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Requested-With');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('Referrer-Policy', 'same-origin');
  res.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.header(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'"
  );

  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use(validateBodyShape);

app.get('/', (req, res) => {
  res.json({
    ok: true,
    service: 'noura-local-api',
    message: 'API is running. Use /api/health, /api/chat, /api/logs/audit, /api/analytics/summary',
    now: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    service: 'noura-analytics-api',
    now: new Date().toISOString(),
  });
});

app.post(
  '/api/auth/login',
  applyRateLimit({
    keyPrefix: 'login',
    limit: 8,
    windowMs: 10 * 60 * 1000,
    message: 'Too many login attempts. Please try again later.',
    resolveKey: req => `${req.ip}:${String(req.body?.identifier || req.body?.userId || '').trim()}`,
  }),
  (req, res) => {
  const { identifier, email, userId, password, role } = req.body || {};
  const result = loginUser({
    identifier: identifier || userId || email,
    password,
    role,
  });

    const attemptKey = `${req.ip}:${String(identifier || userId || email || '').trim().toLowerCase()}`;

  if (!result) {
      const failedAttempts = (loginAttempts.get(attemptKey) || 0) + 1;
      loginAttempts.set(attemptKey, failedAttempts);
    return res.status(401).json({
      ok: false,
      message: 'Invalid credentials',
      code: 'INVALID_CREDENTIALS',
    });
  }

    loginAttempts.delete(attemptKey);

    setSessionCookie(res, result.token);
  return res.json({
    ok: true,
    token: result.token,
    user: result.user,
  });
  }
);

app.post('/api/auth/register', (req, res) => {
  return res.status(501).json({
    ok: false,
    message: 'Registration is not implemented yet in the local backend',
    code: 'NOT_IMPLEMENTED',
  });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({
    ok: true,
    user: req.user,
  });
});

app.post('/api/auth/logout', requireAuth, (req, res) => {
  logoutSession(req.authToken);
  clearSessionCookie(res);
  return res.json({ ok: true, success: true });
});

app.get('/api/users', requireAuth, requireRoles('admin'), (req, res) => {
  res.json({
    ok: true,
    users: getUsers(),
  });
});

app.delete('/api/users/:id', requireAuth, requireRoles('admin'), (req, res) => {
  return res.status(501).json({
    ok: false,
    message: 'User deletion is not implemented yet',
    code: 'NOT_IMPLEMENTED',
  });
});

app.get('/api/doctors', requireAuth, (req, res) => {
  res.json({
    ok: true,
    doctors: getDoctors(),
  });
});

app.get('/api/doctors/:id', requireAuth, (req, res) => {
  if (!canAccessDoctor(req.user, req.params.id)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  const doctor = getDoctorById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ ok: false, message: 'Doctor not found', code: 'NOT_FOUND' });
  }
  return res.json({ ok: true, doctor });
});

app.get('/api/doctors/:id/patients', requireAuth, (req, res) => {
  if (!canAccessDoctor(req.user, req.params.id)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  const patients = getPatients().filter(patient => patient.assignedDoctorId === req.params.id);
  return res.json({ ok: true, patients });
});

app.post('/api/doctors/access-requests', requireAuth, requireRoles('doctor'), (req, res) => {
  const { patientId, reason } = req.body || {};
  if (!patientId || !reason) {
    return res.status(400).json({
      ok: false,
      message: 'patientId and reason are required',
      code: 'INVALID_PAYLOAD',
    });
  }
  const request = createAccessRequest({
    patientId,
    reason: sanitizeText(reason, 500),
    requestingDoctorId: req.user.userId,
  });
  return res.json({ ok: true, request });
});

app.get('/api/doctors/access-requests', requireAuth, requireRoles('doctor'), (req, res) => {
  res.json({
    ok: true,
    requests: getAccessRequests({ requestingDoctorId: req.user.userId }),
  });
});

app.get('/api/access-requests', requireAuth, requireRoles('admin'), (req, res) => {
  res.json({
    ok: true,
    requests: getAccessRequests(),
  });
});

app.put('/api/access-requests/:id', requireAuth, requireRoles('admin'), (req, res) => {
  const { status, reviewNotes = '' } = req.body || {};
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      ok: false,
      message: 'status must be approved or rejected',
      code: 'INVALID_PAYLOAD',
    });
  }

  const existing = getAccessRequests().find(request => String(request.id) === String(req.params.id));
  if (!existing) {
    return res.status(404).json({ ok: false, message: 'Request not found', code: 'NOT_FOUND' });
  }

  if (existing.status !== 'pending') {
    return res.status(409).json({
      ok: false,
      message: 'Request already processed',
      code: 'ALREADY_PROCESSED',
    });
  }

  const now = new Date();
  const expiresAt =
    status === 'approved' ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : null;
  const updated = updateAccessRequest(req.params.id, {
    status,
    reviewDate: now.toISOString(),
    reviewedBy: req.user.userId,
    reviewNotes: sanitizeText(reviewNotes, 1000),
    expiryDate: expiresAt,
  });

  return res.json({ ok: true, request: updated });
});

app.get('/api/patients', requireAuth, (req, res) => {
  let patients = [];
  if (isAdmin(req.user)) {
    patients = getPatients();
  } else if (isDoctor(req.user)) {
    patients = getPatients().filter(patient => patient.assignedDoctorId === req.user.userId);
  } else if (isNurse(req.user)) {
    patients = getPatients().filter(patient => patient.assignedDoctorId === req.user.assignedDoctorId);
  } else if (isPatient(req.user)) {
    patients = getPatients().filter(patient => patient.userId === req.user.userId);
  }
  res.json({
    ok: true,
    patients,
  });
});

app.get('/api/patients/:id', requireAuth, (req, res) => {
  if (!canAccessPatient(req.user, req.params.id)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  const patient = getPatientById(req.params.id);
  if (!patient) {
    return res.status(404).json({ ok: false, message: 'Patient not found', code: 'NOT_FOUND' });
  }
  return res.json({ ok: true, patient });
});

app.put('/api/patients/:id', requireAuth, (req, res) => {
  if (!canAccessPatient(req.user, req.params.id)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }

  let payload = {};
  if (isAdmin(req.user) || isDoctor(req.user) || isNurse(req.user)) {
    payload = pickAllowedFields(req.body, [
      'name',
      'email',
      'status',
      'assignedDoctorId',
      'assignedDoctorName',
      'phone',
      'address',
      'notes',
    ]);
  } else if (isPatient(req.user)) {
    payload = pickAllowedFields(req.body, ['name', 'email', 'phone', 'address']);
  }

  const patient = updatePatient(req.params.id, payload);
  if (!patient) {
    return res.status(404).json({ ok: false, message: 'Patient not found', code: 'NOT_FOUND' });
  }
  return res.json({ ok: true, patient });
});

app.get('/api/patients/:id/scans', requireAuth, (req, res) => {
  if (!canAccessPatient(req.user, req.params.id)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  res.json({
    ok: true,
    scans: getScans({ patientId: req.params.id }),
  });
});

app.get('/api/patients/:id/access-requests', requireAuth, (req, res) => {
  if (!canAccessPatient(req.user, req.params.id) && !isDoctor(req.user)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  res.json({
    ok: true,
    requests: getAccessRequests({
      patientId: req.params.id,
      ...(isDoctor(req.user) ? { requestingDoctorId: req.user.userId } : {}),
    }),
  });
});

app.get('/api/scans', requireAuth, (req, res) => {
  const requestedPatientId = req.query.patientId || undefined;
  if (requestedPatientId && !canAccessPatient(req.user, requestedPatientId)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }

  let scans = getScans({ patientId: requestedPatientId });
  if (!requestedPatientId) {
    if (isPatient(req.user)) {
      scans = scans.filter(scan => scan.patientId === req.user.userId);
    } else if (isDoctor(req.user)) {
      scans = scans.filter(scan => {
        const patient = getPatientRecord(scan.patientId);
        return patient?.assignedDoctorId === req.user.userId;
      });
    } else if (isNurse(req.user)) {
      scans = scans.filter(scan => {
        const patient = getPatientRecord(scan.patientId);
        return patient?.assignedDoctorId === req.user.assignedDoctorId;
      });
    }
  }
  res.json({
    ok: true,
    scans,
  });
});

app.get('/api/scans/:id', requireAuth, (req, res) => {
  const scan = getScanById(req.params.id);
  if (!scan) {
    return res.status(404).json({ ok: false, message: 'Scan not found', code: 'NOT_FOUND' });
  }
  if (!canAccessPatient(req.user, scan.patientId)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  return res.json({ ok: true, scan });
});

app.post('/api/scans/upload', requireAuth, async (req, res) => {
  const { patientId, scanType, notes, fileName, fileSize, encryptedImage, imageUrl, imageBase64 } = req.body || {};
  if (!patientId) {
    return res.status(400).json({
      ok: false,
      message: 'patientId is required',
      code: 'INVALID_PAYLOAD',
    });
  }

  if (!canAccessPatient(req.user, patientId)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  if (!(isPatient(req.user) || isNurse(req.user) || isAdmin(req.user))) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }

  const scan = createScan({
    patientId,
    scanType: sanitizeText(scanType, 120),
    notes: sanitizeText(notes, 1000),
    fileName: sanitizeText(fileName, 200),
    fileSize,
    encryptedImage,
    status: imageBase64 || imageUrl ? 'pending_ai_analysis' : 'completed',
    aiAnalysis: Boolean(imageBase64 || imageUrl),
  });

  if (imageBase64 || imageUrl) {
    try {
      const analysis = await processAiAnalysis({
        scanId: scan.id,
        patientId,
        scanType: sanitizeText(scanType, 120),
        imageUrl: imageUrl || null,
        imageBase64: imageBase64 || null,
        metadata: {
          uploadedBy: req.user.userId,
          source: 'noura-backend',
          fileName: sanitizeText(fileName, 200),
          fileSize,
          notes: sanitizeText(notes, 1000),
        },
      });

      return res.json({
        ok: true,
        success: true,
        source: analysis.source,
        patientId,
        scan: analysis.updatedScan,
        result: analysis.result,
      });
    } catch (error) {
      return res.status(502).json({
        ok: false,
        code: 'AI_ANALYSIS_FAILED',
        message: error instanceof Error ? error.message : 'AI analysis failed',
        details: error,
      });
    }
  }

  return res.json({
    ok: true,
    success: true,
    patientId,
    scan,
  });
});

app.post('/api/ai/analyze', requireAuth, requireRoles('admin', 'doctor', 'nurse'), async (req, res) => {
  const { scanId, patientId, scanType, imageUrl, imageBase64, metadata = {} } = req.body || {};

  if (!scanId && !patientId) {
    return res.status(400).json({
      ok: false,
      message: 'scanId or patientId is required',
      code: 'INVALID_PAYLOAD',
    });
  }

  const sourceScan = scanId ? getScanById(scanId) : null;
  const targetPatientId = patientId || sourceScan?.patientId || null;
  if (!targetPatientId || !canAccessPatient(req.user, targetPatientId)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  const targetScanId =
    scanId ||
    createScan({
      patientId: targetPatientId,
      scanType: sanitizeText(scanType, 120),
      fileName: sanitizeText(metadata.fileName, 200) || 'pending-analysis',
      fileSize: metadata.fileSize || '0 MB',
      notes: sanitizeText(metadata.notes, 1000),
      status: 'pending_ai_analysis',
      aiAnalysis: false,
    }).id;

  const payload = {
    scanId: targetScanId,
    patientId: targetPatientId,
    scanType: sanitizeText(scanType, 120) || sourceScan?.scanType || 'General',
    imageUrl: imageUrl || null,
    imageBase64: imageBase64 || null,
    metadata: {
      uploadedBy: req.user.userId,
      source: 'noura-backend',
      ...metadata,
    },
  };

  if (!AI_SERVICE_URL) {
    const demoResult = buildDemoAnalysis(payload);
    const updatedScan = attachAiResultToScan(targetScanId, {
      ...demoResult,
      analyzedAt: new Date().toISOString(),
      raw: { source: 'demo-fallback' },
    });

    return res.json({
      ok: true,
      source: 'demo-fallback',
      scan: updatedScan,
      result: updatedScan?.aiResult || demoResult,
    });
  }

  try {
    const remoteBody = await buildRemoteAiFormData(payload);

    const response = await fetchWithTimeout(
      AI_SERVICE_URL,
      {
        method: 'POST',
        headers: {
          ...(AI_SERVICE_TOKEN ? { Authorization: `Bearer ${AI_SERVICE_TOKEN}` } : {}),
        },
        body: remoteBody,
      },
      AI_SERVICE_TIMEOUT_MS
    );

    const rawText = await response.text();
    let remoteData = {};

    try {
      remoteData = rawText ? JSON.parse(rawText) : {};
    } catch {
      remoteData = { raw: rawText };
    }

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        code: 'AI_SERVICE_FAILED',
        message: remoteData?.message || 'AI service returned an error',
        provider: 'remote-ai-service',
        details: remoteData,
      });
    }

    const normalizedResult = {
      prediction:
        remoteData.prediction ||
        remoteData.result ||
        remoteData.label ||
        remoteData.cancer_type ||
        'Unknown',
      cancerType:
        remoteData.cancer_type || remoteData.prediction || remoteData.result || remoteData.label,
      confidence:
        typeof remoteData.confidence === 'number'
          ? remoteData.confidence <= 1
            ? Math.round(remoteData.confidence * 1000) / 10
            : remoteData.confidence
          : Number(remoteData.confidence || 0),
      recommendation:
        remoteData.recommendation || remoteData.notes || remoteData.summary || '',
      riskLevel: remoteData.risk_level || remoteData.riskLevel || 'Unknown',
      top2: Array.isArray(remoteData.top2) ? remoteData.top2 : [],
      modelVersion: remoteData.modelVersion || remoteData.model || 'unknown',
      analyzedAt: new Date().toISOString(),
      raw: remoteData,
    };

    const updatedScan = attachAiResultToScan(targetScanId, normalizedResult);

    return res.json({
      ok: true,
      source: 'remote-ai-service',
      scan: updatedScan,
      result: updatedScan?.aiResult || normalizedResult,
    });
  } catch (error) {
    const isAbort = error?.name === 'AbortError';
    return res.status(isAbort ? 504 : 502).json({
      ok: false,
      code: isAbort ? 'AI_SERVICE_TIMEOUT' : 'AI_SERVICE_UNAVAILABLE',
      message: isAbort
        ? 'AI service timed out'
        : error instanceof Error
          ? error.message
          : 'AI service unavailable',
      provider: 'remote-ai-service',
    });
  }
});

app.put('/api/scans/:id', requireAuth, (req, res) => {
  const existingScan = getScanById(req.params.id);
  if (!existingScan) {
    return res.status(404).json({ ok: false, message: 'Scan not found', code: 'NOT_FOUND' });
  }
  if (!canManageScan(req.user, existingScan)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }

  const scan = updateScan(
    req.params.id,
    pickAllowedFields(req.body, [
      'status',
      'doctorReview',
      'reviewedBy',
      'notes',
      'location',
      'result',
      'confidence',
    ])
  );
  if (!scan) {
    return res.status(404).json({ ok: false, message: 'Scan not found', code: 'NOT_FOUND' });
  }
  return res.json({ ok: true, scan });
});

app.delete('/api/scans/:id', requireAuth, (req, res) => {
  const existingScan = getScanById(req.params.id);
  if (!existingScan) {
    return res.status(404).json({ ok: false, message: 'Scan not found', code: 'NOT_FOUND' });
  }
  if (!canManageScan(req.user, existingScan)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  const deleted = deleteScan(req.params.id);
  if (!deleted) {
    return res.status(404).json({ ok: false, message: 'Scan not found', code: 'NOT_FOUND' });
  }
  return res.json({ ok: true, success: true });
});

app.get('/api/messages', requireAuth, (req, res) => {
  res.json({
    ok: true,
    messages: getMessagesForUser(req.user.userId),
  });
});

app.get('/api/messages/:userId', requireAuth, (req, res) => {
  res.json({
    ok: true,
    messages: getConversation(req.user.userId, req.params.userId),
  });
});

app.post('/api/messages', requireAuth, (req, res) => {
  const { receiverId, content } = req.body || {};
  if (!receiverId || !content) {
    return res.status(400).json({
      ok: false,
      message: 'receiverId and content are required',
      code: 'INVALID_PAYLOAD',
    });
  }

  const receiver = getUserById(receiverId);
  if (!receiver) {
    return res.status(404).json({ ok: false, message: 'Receiver not found', code: 'NOT_FOUND' });
  }
  if (!canMessageUser(req.user, receiver)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }

  const message = createMessage({
    senderId: req.user.userId,
    receiverId,
    content: sanitizeText(content, 2000),
  });

  return res.json({ ok: true, success: true, message });
});

app.post('/api/messages/:id/read', requireAuth, (req, res) => {
  const message = getMessagesForUser(req.user.userId).find(
    item => String(item.id) === String(req.params.id)
  );
  if (!message) {
    return res.status(404).json({ ok: false, message: 'Message not found', code: 'NOT_FOUND' });
  }
  if (message.receiverId !== req.user.userId && !isAdmin(req.user)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  const updated = markMessageAsRead(req.params.id);
  return res.json({ ok: true, success: true, message: updated });
});

app.delete('/api/messages/:id', requireAuth, (req, res) => {
  const conversation = getMessagesForUser(req.user.userId);
  const targetMessage = conversation.find(message => String(message.id) === String(req.params.id));
  if (!targetMessage && !isAdmin(req.user)) {
    return res.status(403).json({ ok: false, message: 'Forbidden', code: 'FORBIDDEN' });
  }
  const deleted = deleteMessage(req.params.id);
  if (!deleted) {
    return res.status(404).json({ ok: false, message: 'Message not found', code: 'NOT_FOUND' });
  }
  return res.json({ ok: true, success: true });
});

app.post(
  '/api/chat',
  requireAuth,
  applyRateLimit({
    keyPrefix: 'chat',
    limit: 25,
    windowMs: 15 * 60 * 1000,
    message: 'Too many chat requests. Please slow down.',
  }),
  async (req, res) => {
  const { message, history = [] } = req.body || {};

  if (!String(message || '').trim()) {
    return res.status(400).json({ ok: false, code: 'INVALID_MESSAGE', message: 'Message is required' });
  }

  if (!OPENROUTER_API_KEY) {
    return res.json({
      ok: true,
      reply: buildDemoMedicalReply(message, history),
      source: 'demo-fallback',
    });
  }

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': OPENROUTER_SITE_URL || `http://${HOST}:${PORT}`,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: buildMedicalMessages(message, Array.isArray(history) ? history : []),
        temperature: 0.4,
        max_tokens: 600,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        ok: false,
        code:
          response.status === 401 || response.status === 403
            ? 'AI_UNAUTHORIZED'
            : response.status === 429
              ? 'AI_RATE_LIMIT'
              : 'AI_REQUEST_FAILED',
        message: errorText || 'AI request failed',
        provider: 'openrouter',
      });
    }

    const data = await response.json();
    const reply =
      data?.choices?.[0]?.message?.content ||
      'لم أستطع فهم سؤالك، حاول صياغته بشكل آخر.';

    return res.json({
      ok: true,
      reply,
      source: 'openrouter',
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      code: 'AI_UPSTREAM_UNAVAILABLE',
      message: error instanceof Error ? error.message : 'AI upstream unavailable',
      provider: 'openrouter',
    });
  }
  }
);

app.post('/api/logs/audit', requireAuth, (req, res) => {
  const { entry } = req.body || {};
  if (!entry || !entry.action) {
    return res.status(400).json({ ok: false, message: 'Missing audit entry/action' });
  }

  const saved = addAuditLog({
    id: entry.id || `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: entry.timestamp || new Date().toISOString(),
    userId: req.user.userId,
    userName: req.user.name || 'Unknown',
    role: req.user.role || 'unknown',
    action: entry.action,
    status: entry.status || 'success',
    details: sanitizeText(entry.details, 1000),
    ip: req.ip || '0.0.0.0',
    device: sanitizeText(entry.device, 120) || 'Unknown',
    route: sanitizeText(entry.route, 200) || '/',
    sessionId: req.user.sessionId || null,
    metadata: entry.metadata || {},
  });

  return res.json({ ok: true, entry: saved });
});

app.post('/api/logs/session/start', requireAuth, (req, res) => {
  const { session } = req.body || {};
  if (!session || !session.sessionId) {
    return res.status(400).json({ ok: false, message: 'Missing session/sessionId' });
  }
  startSession({
    sessionId: req.user.sessionId,
    userId: req.user.userId,
    userName: req.user.name,
    role: req.user.role,
    loginTime: req.user.loginTime,
  });
  return res.json({ ok: true });
});

app.post('/api/logs/session/end', requireAuth, (req, res) => {
  endSession(req.user.sessionId);
  return res.json({ ok: true });
});

app.get('/api/logs/audit', requireAuth, requireRoles('admin'), (req, res) => {
  const logs = getAuditLogs();
  res.json({ ok: true, logs });
});

app.get('/api/analytics/summary', requireAuth, requireRoles('admin', 'doctor'), (req, res) => {
  const snapshot = getAnalyticsSnapshot();
  res.json({
    ok: true,
    summary: snapshot.summary,
    hourlyLoad: snapshot.hourlyLoad,
    dailyActivity: snapshot.dailyActivity,
    actionBreakdown: snapshot.actionBreakdown,
  });
});

app.get('/api/recognition/events', requireAuth, requireRoles('admin'), (req, res) => {
  const events = getRecognitionEvents();
  res.json({ ok: true, events });
});

app.post('/api/recognition/events', (req, res) => {
  const token = getAuthToken(req);
  const user = getSessionUser(token);
  if (user) req.user = user;

  if (!hasRecognitionIngestAccess(req)) {
    return res.status(401).json({
      ok: false,
      message: 'Unauthorized recognition ingest request',
      code: 'UNAUTHORIZED',
    });
  }

  const events = normalizeRecognitionPayload(req.body);
  if (events.length === 0) {
    return res.status(400).json({
      ok: false,
      message: 'No valid recognition events found in payload',
      code: 'INVALID_PAYLOAD',
    });
  }

  const saved = addRecognitionEvents(events);
  return res.status(201).json({ ok: true, savedCount: saved.length, events: saved });
});

app.listen(PORT, HOST, () => {
  console.log(`Noura Analytics API running on http://${HOST}:${PORT}`);
});
