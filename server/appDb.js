const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'app-db.json');
const SESSION_TTL_MS = Number(process.env.SESSION_TTL_MS || 5 * 60 * 1000);
const HASH_ITERATIONS = 120000;
const HASH_BYTES = 64;
const HASH_DIGEST = 'sha512';

const nowIso = () => new Date().toISOString();
const safeTrimLower = value =>
  String(value || '')
    .trim()
    .toLowerCase();
const constantTimeEqual = (left, right) => {
  const leftBuffer = Buffer.from(String(left || ''), 'utf8');
  const rightBuffer = Buffer.from(String(right || ''), 'utf8');
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};
const createPasswordHash = password => {
  const passwordSalt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto
    .pbkdf2Sync(String(password || ''), passwordSalt, HASH_ITERATIONS, HASH_BYTES, HASH_DIGEST)
    .toString('hex');
  return { passwordSalt, passwordHash, passwordVersion: 1 };
};
const verifyPasswordHash = (password, user) => {
  if (!user?.passwordSalt || !user?.passwordHash) return false;
  const attemptedHash = crypto
    .pbkdf2Sync(String(password || ''), user.passwordSalt, HASH_ITERATIONS, HASH_BYTES, HASH_DIGEST)
    .toString('hex');
  return constantTimeEqual(attemptedHash, user.passwordHash);
};
const isStrongPassword = password =>
  typeof password === 'string' &&
  password.length >= 12 &&
  /[A-Z]/.test(password) &&
  /[a-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);
const getConfiguredPassword = (envKey, fallback) => {
  const configured = String(process.env[envKey] || fallback || '');
  return isStrongPassword(configured) ? configured : fallback;
};

const buildSeedDb = () => {
  const adminPassword = getConfiguredPassword('SEED_ADMIN_PASSWORD', 'Admin@2026Secure');
  const doctorPassword = getConfiguredPassword('SEED_DOCTOR_PASSWORD', 'Doctor@2026Secure');
  const nursePassword = getConfiguredPassword('SEED_NURSE_PASSWORD', 'Nurse@2026Secure');
  const patientPassword = getConfiguredPassword('SEED_PATIENT_PASSWORD', 'Patient@2026Secure');
  const users = [
    {
      id: 'AD-2026-001',
      userId: 'AD-2026-001',
      password: adminPassword,
      role: 'admin',
      name: 'System Admin',
      email: 'admin@noura-ai.com',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'DR-2026-001',
      userId: 'DR-2026-001',
      password: doctorPassword,
      role: 'doctor',
      name: 'Dr. Ahmed Mahmoud',
      email: 'ahmed@noura-ai.com',
      specialty: 'oncology',
      specialtyName: 'General Oncology',
      specialtyIcon: '🎗️',
      department: 'General Oncology',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'DR-2026-002',
      userId: 'DR-2026-002',
      password: doctorPassword,
      role: 'doctor',
      name: 'Dr. Mohamed Abdullah',
      email: 'mohamed@noura-ai.com',
      specialty: 'lung',
      specialtyName: 'Lung Cancer',
      specialtyIcon: '🫁',
      department: 'Lung Oncology',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'DR-2026-003',
      userId: 'DR-2026-003',
      password: doctorPassword,
      role: 'doctor',
      name: 'Dr. Nada Sobhy',
      email: 'nada.sobhy@noura-ai.com',
      specialty: 'brain',
      specialtyName: 'Brain Cancer',
      specialtyIcon: '🧠',
      department: 'Brain Oncology',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'DR-2026-004',
      userId: 'DR-2026-004',
      password: doctorPassword,
      role: 'doctor',
      name: 'Dr. Rawda Mohamed',
      email: 'rawda.mohamed@noura-ai.com',
      specialty: 'skin',
      specialtyName: 'Skin Cancer',
      specialtyIcon: '🩺',
      department: 'Skin Oncology',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'NU-2026-001',
      userId: 'NU-2026-001',
      password: nursePassword,
      role: 'nurse',
      name: 'Nurse Sarah',
      email: 'nurse.sarah@noura-ai.com',
      assignedDoctorId: 'DR-2026-001',
      assignedDoctorName: 'Dr. Ahmed Mahmoud',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'NU-2026-002',
      userId: 'NU-2026-002',
      password: nursePassword,
      role: 'nurse',
      name: 'Nurse Leila',
      email: 'nurse.leila@noura-ai.com',
      assignedDoctorId: 'DR-2026-001',
      assignedDoctorName: 'Dr. Ahmed Mahmoud',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'NU-2026-003',
      userId: 'NU-2026-003',
      password: nursePassword,
      role: 'nurse',
      name: 'Nurse Hana',
      email: 'nurse.hana@noura-ai.com',
      assignedDoctorId: 'DR-2026-002',
      assignedDoctorName: 'Dr. Mohamed Abdullah',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'NU-2026-004',
      userId: 'NU-2026-004',
      password: nursePassword,
      role: 'nurse',
      name: 'Nurse Rania',
      email: 'nurse.rania@noura-ai.com',
      assignedDoctorId: 'DR-2026-002',
      assignedDoctorName: 'Dr. Mohamed Abdullah',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'NU-2026-005',
      userId: 'NU-2026-005',
      password: nursePassword,
      role: 'nurse',
      name: 'Nurse Mona',
      email: 'nurse.mona@noura-ai.com',
      assignedDoctorId: 'DR-2026-003',
      assignedDoctorName: 'Dr. Nada Sobhy',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'NU-2026-006',
      userId: 'NU-2026-006',
      password: nursePassword,
      role: 'nurse',
      name: 'Nurse Yara',
      email: 'nurse.yara@noura-ai.com',
      assignedDoctorId: 'DR-2026-003',
      assignedDoctorName: 'Dr. Nada Sobhy',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'NU-2026-007',
      userId: 'NU-2026-007',
      password: nursePassword,
      role: 'nurse',
      name: 'Nurse Dina',
      email: 'nurse.dina@noura-ai.com',
      assignedDoctorId: 'DR-2026-004',
      assignedDoctorName: 'Dr. Rawda Mohamed',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'NU-2026-008',
      userId: 'NU-2026-008',
      password: nursePassword,
      role: 'nurse',
      name: 'Nurse Salma',
      email: 'nurse.salma@noura-ai.com',
      assignedDoctorId: 'DR-2026-004',
      assignedDoctorName: 'Dr. Rawda Mohamed',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'PT-2026-001',
      userId: 'PT-2026-001',
      password: patientPassword,
      role: 'patient',
      name: 'Fatma Ali',
      email: 'fatma@example.com',
      assignedDoctorId: 'DR-2026-001',
      assignedDoctorName: 'Dr. Ahmed Mahmoud',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'PT-2026-002',
      userId: 'PT-2026-002',
      password: patientPassword,
      role: 'patient',
      name: 'Mariam Hussein',
      email: 'mariam@example.com',
      assignedDoctorId: 'DR-2026-002',
      assignedDoctorName: 'Dr. Mohamed Abdullah',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'PT-2026-003',
      userId: 'PT-2026-003',
      password: patientPassword,
      role: 'patient',
      name: 'Sara Mohamed',
      email: 'sara@example.com',
      assignedDoctorId: 'DR-2026-003',
      assignedDoctorName: 'Dr. Nada Sobhy',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'PT-2026-004',
      userId: 'PT-2026-004',
      password: patientPassword,
      role: 'patient',
      name: 'Hoda Kamal',
      email: 'hoda@example.com',
      assignedDoctorId: 'DR-2026-004',
      assignedDoctorName: 'Dr. Rawda Mohamed',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'PT-2026-005',
      userId: 'PT-2026-005',
      password: patientPassword,
      role: 'patient',
      name: 'Nora Adel',
      email: 'nora@example.com',
      assignedDoctorId: 'DR-2026-001',
      assignedDoctorName: 'Dr. Ahmed Mahmoud',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'PT-2026-006',
      userId: 'PT-2026-006',
      password: patientPassword,
      role: 'patient',
      name: 'Aya Samir',
      email: 'aya@example.com',
      assignedDoctorId: 'DR-2026-002',
      assignedDoctorName: 'Dr. Mohamed Abdullah',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'PT-2026-007',
      userId: 'PT-2026-007',
      password: patientPassword,
      role: 'patient',
      name: 'Laila Mostafa',
      email: 'laila@example.com',
      assignedDoctorId: 'DR-2026-003',
      assignedDoctorName: 'Dr. Nada Sobhy',
      status: 'active',
      createdAt: nowIso(),
    },
    {
      id: 'PT-2026-008',
      userId: 'PT-2026-008',
      password: patientPassword,
      role: 'patient',
      name: 'Mona Ibrahim',
      email: 'mona@example.com',
      assignedDoctorId: 'DR-2026-004',
      assignedDoctorName: 'Dr. Rawda Mohamed',
      status: 'active',
      createdAt: nowIso(),
    },
  ];

  return {
    users,
    sessions: [],
    accessRequests: [],
    scans: [
      {
        id: 1,
        patientId: 'PT-2026-001',
        patientName: 'Fatma Ali',
        date: '2026-03-15',
        scanType: 'Medical Scan',
        result: 'Normal',
        confidence: 98.7,
        doctor: 'Dr. Ahmed Mahmoud',
        location: 'Cairo Medical Center',
        doctorReview: 'Results reviewed and confirmed normal.',
        status: 'completed',
        aiAnalysis: true,
        reviewedBy: 'DR-2026-001',
        notes: '',
        fileName: 'scan-001.jpg',
        fileSize: '2.50 MB',
        encryptedImage: null,
        createdAt: nowIso(),
      },
      {
        id: 2,
        patientId: 'PT-2026-002',
        patientName: 'Mariam Hussein',
        date: '2026-03-10',
        scanType: 'Medical Scan',
        result: 'Normal',
        confidence: 96.5,
        doctor: 'Dr. Mohamed Abdullah',
        location: 'Giza Hospital',
        doctorReview: 'All clear. Continue routine screening.',
        status: 'completed',
        aiAnalysis: true,
        reviewedBy: 'DR-2026-002',
        notes: '',
        fileName: 'scan-002.jpg',
        fileSize: '3.10 MB',
        encryptedImage: null,
        createdAt: nowIso(),
      },
    ],
    messages: [
      {
        id: 1,
        senderId: 'DR-2026-001',
        receiverId: 'PT-2026-001',
        content: 'Your scan results look normal. Continue routine screening.',
        createdAt: '2026-03-27T14:30:00.000Z',
        read: true,
      },
      {
        id: 2,
        senderId: 'PT-2026-001',
        receiverId: 'DR-2026-001',
        content: 'Thank you doctor. When should I schedule the next scan?',
        createdAt: '2026-03-27T14:35:00.000Z',
        read: true,
      },
    ],
  };
};

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(buildSeedDb(), null, 2), 'utf-8');
  }
};

const migrateLegacyDb = db => {
  let changed = false;

  db.users = (db.users || []).map(user => {
    if (!user || typeof user !== 'object') return user;

    const normalizedUser = { ...user };
    if (normalizedUser.password && !normalizedUser.passwordHash) {
      Object.assign(normalizedUser, createPasswordHash(normalizedUser.password));
      delete normalizedUser.password;
      changed = true;
    }

    return normalizedUser;
  });

  db.sessions = (db.sessions || []).filter(session => {
    if (!session?.token || !session?.userId) {
      changed = true;
      return false;
    }

    if (!session.createdAt) {
      session.createdAt = nowIso();
      changed = true;
    }

    if (!session.lastSeen) {
      session.lastSeen = session.createdAt;
      changed = true;
    }

    if (!session.expiresAt) {
      session.expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
      changed = true;
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      changed = true;
      return false;
    }

    return true;
  });

  return changed;
};

const readDb = () => {
  ensureDataFile();
  try {
    const db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    if (migrateLegacyDb(db)) writeDb(db);
    return db;
  } catch {
    const seed = buildSeedDb();
    migrateLegacyDb(seed);
    fs.writeFileSync(DATA_FILE, JSON.stringify(seed, null, 2), 'utf-8');
    return seed;
  }
};

const writeDb = db => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
};

const stripPassword = user => {
  if (!user) return null;
  const { password, passwordHash, passwordSalt, passwordVersion, ...safeUser } = user;
  return safeUser;
};

const createToken = () => crypto.randomBytes(24).toString('hex');

const nextNumericId = items => {
  const maxId = items.reduce((max, item) => (Number(item.id) > max ? Number(item.id) : max), 0);
  return maxId + 1;
};

const getUsers = () => readDb().users.filter(user => user.status !== 'deleted').map(stripPassword);

const getUserById = userId => {
  const db = readDb();
  return stripPassword(db.users.find(user => user.id === userId || user.userId === userId) || null);
};

const getRawUserById = userId => {
  const db = readDb();
  return db.users.find(user => user.id === userId || user.userId === userId) || null;
};

const loginUser = ({ identifier, password, role }) => {
  const db = readDb();
  const normalized = safeTrimLower(identifier);

  const user = db.users.find(item => {
    if (item.status === 'deleted') return false;
    if (role && item.role !== role) return false;

    return safeTrimLower(item.userId) === normalized || safeTrimLower(item.email) === normalized;
  });

  if (!user || !verifyPasswordHash(password, user)) return null;

  const token = createToken();
  const session = {
    token,
    userId: user.userId,
    createdAt: nowIso(),
    lastSeen: nowIso(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };

  db.sessions = db.sessions.filter(item => item.userId !== user.userId);
  db.sessions.push(session);
  writeDb(db);

  return {
    token,
    user: {
      ...stripPassword(user),
      sessionId: token,
      loginTime: session.createdAt,
      sessionExpiresAt: session.expiresAt,
    },
  };
};

const getSessionUser = token => {
  if (!token) return null;
  const db = readDb();
  const session = db.sessions.find(item => item.token === token);
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() <= Date.now()) {
    db.sessions = db.sessions.filter(item => item.token !== token);
    writeDb(db);
    return null;
  }

  session.lastSeen = nowIso();
  session.expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
  writeDb(db);

  const user = db.users.find(item => item.userId === session.userId);
  if (!user || user.status === 'deleted') return null;

  return {
    ...stripPassword(user),
    sessionId: session.token,
    loginTime: session.createdAt,
    sessionExpiresAt: session.expiresAt,
  };
};

const logoutSession = token => {
  if (!token) return false;
  const db = readDb();
  const previousLength = db.sessions.length;
  db.sessions = db.sessions.filter(item => item.token !== token);
  writeDb(db);
  return previousLength !== db.sessions.length;
};

const getDoctors = () => getUsers().filter(user => user.role === 'doctor');

const getPatients = () => getUsers().filter(user => user.role === 'patient');

const getNurses = () => getUsers().filter(user => user.role === 'nurse');

const getDoctorById = doctorId =>
  getDoctors().find(user => user.id === doctorId || user.userId === doctorId) || null;

const getPatientById = patientId =>
  getPatients().find(user => user.id === patientId || user.userId === patientId) || null;

const updatePatient = (patientId, data) => {
  const db = readDb();
  const index = db.users.findIndex(
    user =>
      user.role === 'patient' && (user.id === patientId || user.userId === patientId)
  );
  if (index === -1) return null;
  db.users[index] = { ...db.users[index], ...data, updatedAt: nowIso() };
  writeDb(db);
  return stripPassword(db.users[index]);
};

const getScans = ({ patientId } = {}) => {
  const db = readDb();
  const scans = patientId ? db.scans.filter(scan => scan.patientId === patientId) : db.scans;
  return scans
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
};

const getScanById = scanId => {
  const db = readDb();
  return db.scans.find(scan => String(scan.id) === String(scanId)) || null;
};

const createScan = payload => {
  const db = readDb();
  const patient = getRawUserById(payload.patientId);
  const assignedDoctor = patient?.assignedDoctorId ? getRawUserById(patient.assignedDoctorId) : null;
  const outcomes = [
    { result: 'Normal', confidence: 98.1 },
    { result: 'Follow-up', confidence: 94.6 },
    { result: 'Abnormal', confidence: 89.8 },
  ];
  const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];

  const scan = {
    id: nextNumericId(db.scans),
    patientId: payload.patientId,
    patientName: patient?.name || 'Unknown Patient',
    date: new Date().toISOString().slice(0, 10),
    scanType: payload.scanType || 'Medical Scan',
    result: payload.result || outcome.result,
    confidence: payload.confidence || outcome.confidence,
    doctor: assignedDoctor?.name || 'Pending Assignment',
    location: payload.location || 'Noura AI Medical Center',
    doctorReview: payload.doctorReview || null,
    status: payload.status || 'completed',
    aiAnalysis: payload.aiAnalysis !== false,
    reviewedBy: payload.reviewedBy || null,
    notes: payload.notes || '',
    fileName: payload.fileName || 'medical-scan.jpg',
    fileSize: payload.fileSize || '0 MB',
    encryptedImage: payload.encryptedImage || null,
    createdAt: nowIso(),
  };

  db.scans.push(scan);
  writeDb(db);
  return scan;
};

const updateScan = (scanId, data) => {
  const db = readDb();
  const index = db.scans.findIndex(scan => String(scan.id) === String(scanId));
  if (index === -1) return null;
  db.scans[index] = { ...db.scans[index], ...data, updatedAt: nowIso() };
  writeDb(db);
  return db.scans[index];
};

const attachAiResultToScan = (scanId, aiResult) => {
  const db = readDb();
  const index = db.scans.findIndex(scan => String(scan.id) === String(scanId));
  if (index === -1) return null;

  db.scans[index] = {
    ...db.scans[index],
    aiAnalysis: true,
    result: aiResult.prediction || db.scans[index].result,
    confidence:
      typeof aiResult.confidence === 'number' ? aiResult.confidence : db.scans[index].confidence,
    aiResult: {
      prediction: aiResult.prediction || null,
      cancerType: aiResult.cancerType || aiResult.prediction || null,
      confidence: aiResult.confidence ?? null,
      recommendation: aiResult.recommendation || '',
      riskLevel: aiResult.riskLevel || 'Unknown',
      top2: Array.isArray(aiResult.top2) ? aiResult.top2 : [],
      modelVersion: aiResult.modelVersion || 'unknown',
      raw: aiResult.raw || null,
      analyzedAt: aiResult.analyzedAt || nowIso(),
    },
    updatedAt: nowIso(),
  };

  writeDb(db);
  return db.scans[index];
};

const deleteScan = scanId => {
  const db = readDb();
  const nextScans = db.scans.filter(scan => String(scan.id) !== String(scanId));
  if (nextScans.length === db.scans.length) return false;
  db.scans = nextScans;
  writeDb(db);
  return true;
};

const getMessagesForUser = userId => {
  const db = readDb();
  return db.messages
    .filter(message => message.senderId === userId || message.receiverId === userId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const getConversation = (currentUserId, otherUserId) => {
  const db = readDb();
  return db.messages
    .filter(
      message =>
        (message.senderId === currentUserId && message.receiverId === otherUserId) ||
        (message.senderId === otherUserId && message.receiverId === currentUserId)
    )
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

const createMessage = ({ senderId, receiverId, content }) => {
  const db = readDb();
  const message = {
    id: nextNumericId(db.messages),
    senderId,
    receiverId,
    content,
    createdAt: nowIso(),
    read: false,
  };
  db.messages.push(message);
  writeDb(db);
  return message;
};

const markMessageAsRead = messageId => {
  const db = readDb();
  const index = db.messages.findIndex(message => String(message.id) === String(messageId));
  if (index === -1) return null;
  db.messages[index] = { ...db.messages[index], read: true, readAt: nowIso() };
  writeDb(db);
  return db.messages[index];
};

const deleteMessage = messageId => {
  const db = readDb();
  const nextMessages = db.messages.filter(message => String(message.id) !== String(messageId));
  if (nextMessages.length === db.messages.length) return false;
  db.messages = nextMessages;
  writeDb(db);
  return true;
};

const createAccessRequest = ({ patientId, requestingDoctorId, reason }) => {
  const db = readDb();
  const request = {
    id: nextNumericId(db.accessRequests),
    patientId,
    requestingDoctorId,
    reason,
    status: 'pending',
    createdAt: nowIso(),
  };
  db.accessRequests.push(request);
  writeDb(db);
  return request;
};

const getAccessRequests = filter =>
  readDb().accessRequests.filter(request => {
    if (!filter) return true;
    if (filter.patientId && request.patientId !== filter.patientId) return false;
    if (filter.requestingDoctorId && request.requestingDoctorId !== filter.requestingDoctorId)
      return false;
    if (filter.status && request.status !== filter.status) return false;
    return true;
  });

const updateAccessRequest = (requestId, updates) => {
  const db = readDb();
  const index = db.accessRequests.findIndex(request => String(request.id) === String(requestId));
  if (index === -1) return null;

  db.accessRequests[index] = {
    ...db.accessRequests[index],
    ...updates,
    updatedAt: nowIso(),
  };

  writeDb(db);
  return db.accessRequests[index];
};

module.exports = {
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
  getNurses,
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
};
