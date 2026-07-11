const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'analytics-db.json');
const MAX_LOGS = 5000;
const MAX_RECOGNITION_EVENTS = 1000;

const defaultDb = () => ({
  auditLogs: [],
  recognitionEvents: [],
  sessions: {},
});

const ensureDataFile = () => {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultDb(), null, 2), 'utf-8');
  }
};

const readDb = () => {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
      recognitionEvents: Array.isArray(parsed.recognitionEvents) ? parsed.recognitionEvents : [],
      sessions: parsed.sessions && typeof parsed.sessions === 'object' ? parsed.sessions : {},
    };
  } catch {
    return defaultDb();
  }
};

const writeDb = db => {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
};

const addAuditLog = entry => {
  const db = readDb();
  db.auditLogs.unshift(entry);
  db.auditLogs = db.auditLogs.slice(0, MAX_LOGS);
  writeDb(db);
  return entry;
};

const startSession = session => {
  if (!session || !session.sessionId) return;
  const db = readDb();
  db.sessions[session.sessionId] = {
    sessionId: session.sessionId,
    userId: session.userId || 'unknown',
    userName: session.userName || 'Unknown',
    role: session.role || 'unknown',
    loginTime: session.loginTime || new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };
  writeDb(db);
};

const endSession = sessionId => {
  if (!sessionId) return;
  const db = readDb();
  if (db.sessions[sessionId]) {
    delete db.sessions[sessionId];
    writeDb(db);
  }
};

const getAuditLogs = () => readDb().auditLogs;

const normalizeRecognitionEvent = entry => {
  const bbox = Array.isArray(entry?.bbox) ? entry.bbox.slice(0, 4).map(value => Number(value) || 0) : [];
  return {
    name: String(entry?.name || 'Unknown').trim() || 'Unknown',
    confidence: Number(entry?.confidence || 0),
    timestamp: String(entry?.timestamp || new Date().toISOString()),
    bbox,
    received_at: String(entry?.received_at || new Date().toISOString().replace('T', ' ').slice(0, 19)),
  };
};

const addRecognitionEvents = entries => {
  const incoming = Array.isArray(entries) ? entries : [entries];
  const normalized = incoming
    .filter(Boolean)
    .map(normalizeRecognitionEvent)
    .filter(entry => entry.bbox.length === 4);

  if (normalized.length === 0) return [];

  const db = readDb();
  db.recognitionEvents.push(...normalized);
  db.recognitionEvents = db.recognitionEvents.slice(-MAX_RECOGNITION_EVENTS);
  writeDb(db);
  return normalized;
};

const getRecognitionEvents = () => readDb().recognitionEvents;

const getActiveSessionsCount = () => Object.keys(readDb().sessions).length;

const getHourlyLoad = logs => {
  const rows = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    logins: 0,
  }));

  logs.forEach(log => {
    if (!log || !log.timestamp) return;
    const hour = new Date(log.timestamp).getHours();
    if (Number.isNaN(hour)) return;
    if (log.action === 'LOGIN' && log.status === 'success') rows[hour].logins += 1;
  });

  return rows;
};

const getDailyActivity = (logs, days = 7) => {
  const today = new Date();
  const map = {};

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    map[key] = {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      events: 0,
      failed: 0,
    };
  }

  logs.forEach(log => {
    const key = (log.timestamp || '').slice(0, 10);
    if (!map[key]) return;
    map[key].events += 1;
    if (log.status === 'failed') map[key].failed += 1;
  });

  return Object.values(map);
};

const getActionBreakdown = logs => {
  const counts = {};
  logs.forEach(log => {
    const action = log.action || 'UNKNOWN';
    counts[action] = (counts[action] || 0) + 1;
  });

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
};

const getAnalyticsSnapshot = () => {
  const logs = getAuditLogs();
  const successLogins = logs.filter(l => l.action === 'LOGIN' && l.status === 'success').length;
  const failedLogins = logs.filter(l => l.action === 'LOGIN_FAILED' || l.status === 'failed').length;
  const uploadsCount = logs.filter(l => String(l.action || '').includes('UPLOAD')).length;
  const activeUsers = getActiveSessionsCount();
  const hourlyLoad = getHourlyLoad(logs);
  const peakHour = hourlyLoad.reduce(
    (best, current) => (current.logins > best.logins ? current : best),
    { hour: '00:00', logins: 0 }
  );

  return {
    summary: {
      totalEvents: logs.length,
      activeUsers,
      successLogins,
      failedLogins,
      uploadsCount,
      peakHour,
    },
    hourlyLoad,
    dailyActivity: getDailyActivity(logs, 7),
    actionBreakdown: getActionBreakdown(logs),
    logs,
  };
};

module.exports = {
  addAuditLog,
  addRecognitionEvents,
  endSession,
  getAnalyticsSnapshot,
  getAuditLogs,
  getRecognitionEvents,
  startSession,
};
