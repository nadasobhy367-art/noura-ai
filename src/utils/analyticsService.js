import { API_BASE_URL } from '../config/api';

const AUDIT_LOGS_KEY = 'noura_audit_logs';
const ACTIVE_SESSIONS_KEY = 'noura_active_sessions';
const CLIENT_IP_KEY = 'noura_client_ip';
const MAX_LOGS = 3000;

const safeJsonParse = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const getStoredLogs = () => safeJsonParse(localStorage.getItem(AUDIT_LOGS_KEY), []);

const setStoredLogs = logs => {
  localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
};

const getActiveSessions = () => safeJsonParse(localStorage.getItem(ACTIVE_SESSIONS_KEY), {});

const setActiveSessions = sessions => {
  localStorage.setItem(ACTIVE_SESSIONS_KEY, JSON.stringify(sessions));
};

const getCurrentUser = () => safeJsonParse(sessionStorage.getItem('secure_user'), null);
const getAuthToken = () => sessionStorage.getItem('auth_token');

const postToApi = async (path, payload) => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

const getFromApi = async path => {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: {
        ...(getAuthToken() ? { Authorization: `Bearer ${getAuthToken()}` } : {}),
      },
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
};

const fireAndForget = promise => {
  Promise.resolve(promise).catch(() => {});
};

const getClientIp = () => {
  const existing = localStorage.getItem(CLIENT_IP_KEY);
  if (existing) return existing;

  const randomPart = Math.floor(Math.random() * 200) + 20;
  const generated = `10.0.0.${randomPart}`;
  localStorage.setItem(CLIENT_IP_KEY, generated);
  return generated;
};

const getDevice = () => {
  const ua = navigator.userAgent || '';
  if (/mobile/i.test(ua)) return 'Mobile';
  if (/tablet|ipad/i.test(ua)) return 'Tablet';
  return 'Desktop';
};

export const logAuditEvent = ({
  action,
  status = 'success',
  details = '',
  user = null,
  sessionId = null,
  metadata = {},
}) => {
  if (!action) return null;

  const currentUser = user || getCurrentUser();
  const now = new Date();
  const entry = {
    id: `${now.getTime()}_${Math.random().toString(36).slice(2, 9)}`,
    timestamp: now.toISOString(),
    userId: currentUser?.userId || currentUser?.id || 'unknown',
    userName: currentUser?.name || 'Unknown',
    role: currentUser?.role || 'unknown',
    action,
    status,
    details,
    ip: getClientIp(),
    device: getDevice(),
    route: window.location.pathname,
    sessionId: sessionId || currentUser?.sessionId || null,
    metadata,
  };

  const logs = getStoredLogs();
  logs.unshift(entry);
  setStoredLogs(logs);

  fireAndForget(postToApi('/logs/audit', { entry }));
  return entry;
};

export const startUserSession = userData => {
  if (!userData?.sessionId) return;

  const session = {
    sessionId: userData.sessionId,
    userId: userData.userId || userData.id,
    userName: userData.name || 'Unknown',
    role: userData.role || 'unknown',
    loginTime: userData.loginTime || new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };

  const sessions = getActiveSessions();
  sessions[userData.sessionId] = session;
  setActiveSessions(sessions);

  fireAndForget(postToApi('/logs/session/start', { session }));
};

export const endCurrentSession = (reason = 'manual_logout') => {
  const currentUser = getCurrentUser();
  if (!currentUser?.sessionId) return;

  const sessions = getActiveSessions();
  const started = sessions[currentUser.sessionId];
  const loginTime = started?.loginTime || currentUser.loginTime || new Date().toISOString();
  const durationMs = Math.max(0, Date.now() - new Date(loginTime).getTime());
  const durationMinutes = Math.round(durationMs / 60000);

  delete sessions[currentUser.sessionId];
  setActiveSessions(sessions);
  fireAndForget(postToApi('/logs/session/end', { sessionId: currentUser.sessionId }));

  logAuditEvent({
    action: 'LOGOUT',
    status: 'success',
    details: `User logged out (${reason}) after ${durationMinutes} min`,
    user: currentUser,
    sessionId: currentUser.sessionId,
    metadata: { reason, durationMinutes },
  });
};

export const getAuditLogs = () => getStoredLogs();

export const getActiveUsersCount = () => Object.keys(getActiveSessions()).length;

export const getHourlyLoad = (logs = getStoredLogs()) => {
  const result = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    active: 0,
    logins: 0,
  }));

  logs.forEach(log => {
    if (!log?.timestamp) return;
    const hour = new Date(log.timestamp).getHours();
    if (Number.isNaN(hour)) return;

    if (log.action === 'LOGIN' && log.status === 'success') {
      result[hour].logins += 1;
      result[hour].active += 1;
    }
  });

  return result;
};

export const getDailyActivity = (days = 7, logs = getStoredLogs()) => {
  const today = new Date();
  const byDay = {};

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    byDay[key] = {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      events: 0,
      failed: 0,
    };
  }

  logs.forEach(log => {
    const key = (log.timestamp || '').slice(0, 10);
    if (!byDay[key]) return;
    byDay[key].events += 1;
    if (log.status === 'failed') byDay[key].failed += 1;
  });

  return Object.values(byDay);
};

export const getActionBreakdown = (logs = getStoredLogs()) => {
  const actionMap = {};
  logs.forEach(log => {
    const action = log.action || 'UNKNOWN';
    actionMap[action] = (actionMap[action] || 0) + 1;
  });

  return Object.entries(actionMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
};

export const exportLogsCsv = (logs = getStoredLogs()) => {
  const headers = [
    'timestamp',
    'userId',
    'userName',
    'role',
    'action',
    'status',
    'details',
    'ip',
    'device',
    'route',
  ];

  const escapeCsv = value => `"${String(value || '').replace(/"/g, '""')}"`;
  const rows = logs.map(log =>
    [
      log.timestamp,
      log.userId,
      log.userName,
      log.role,
      log.action,
      log.status,
      log.details,
      log.ip,
      log.device,
      log.route,
    ]
      .map(escapeCsv)
      .join(',')
  );

  return [headers.join(','), ...rows].join('\n');
};

export const fetchAuditLogs = async () => {
  const remote = await getFromApi('/logs/audit');
  const logs = Array.isArray(remote?.logs) ? remote.logs : getStoredLogs();
  if (Array.isArray(remote?.logs)) setStoredLogs(remote.logs);
  return logs;
};

export const fetchAnalyticsSummary = async () => {
  const remote = await getFromApi('/analytics/summary');
  if (remote?.summary) return remote;

  const localLogs = getStoredLogs();
  const summary = {
    totalEvents: localLogs.length,
    activeUsers: getActiveUsersCount(),
    successLogins: localLogs.filter(l => l.action === 'LOGIN' && l.status === 'success').length,
    failedLogins: localLogs.filter(l => l.action === 'LOGIN_FAILED' || l.status === 'failed')
      .length,
    uploadsCount: localLogs.filter(l => String(l.action || '').includes('UPLOAD')).length,
    peakHour: getHourlyLoad(localLogs).reduce(
      (best, current) => (current.logins > best.logins ? current : best),
      { hour: '00:00', logins: 0 }
    ),
  };

  return {
    summary,
    hourlyLoad: getHourlyLoad(localLogs),
    dailyActivity: getDailyActivity(7, localLogs),
    actionBreakdown: getActionBreakdown(localLogs),
  };
};

const DEMO_RECOGNITION_EVENTS = [
  {
    name: 'Sara',
    confidence: 0.5260901358226606,
    timestamp: '2026-04-12T12:40:57',
    bbox: [289, 43, 458, 277],
    received_at: '2026-04-12 12:40:57',
  },
  {
    name: 'Sara',
    confidence: 0.5385128604894636,
    timestamp: '2026-04-12T12:40:58',
    bbox: [288, 42, 458, 279],
    received_at: '2026-04-12 12:40:57',
  },
  {
    name: 'Sara',
    confidence: 0.5697156789629512,
    timestamp: '2026-04-12T12:40:58',
    bbox: [285, 45, 455, 281],
    received_at: '2026-04-12 12:40:58',
  },
  {
    name: 'Sara',
    confidence: 0.6003866256763826,
    timestamp: '2026-04-12T12:40:59',
    bbox: [286, 46, 457, 283],
    received_at: '2026-04-12 12:40:58',
  },
  {
    name: 'Sara',
    confidence: 0.6125031984272858,
    timestamp: '2026-04-12T12:40:59',
    bbox: [289, 45, 458, 282],
    received_at: '2026-04-12 12:40:59',
  },
  {
    name: 'Sara',
    confidence: 0.6029403860259817,
    timestamp: '2026-04-12T12:41:00',
    bbox: [288, 46, 458, 283],
    received_at: '2026-04-12 12:41:00',
  },
  {
    name: 'Sara',
    confidence: 0.6002313067117369,
    timestamp: '2026-04-12T12:41:01',
    bbox: [288, 46, 458, 283],
    received_at: '2026-04-12 12:41:00',
  },
  {
    name: 'Sara',
    confidence: 0.5896869576036576,
    timestamp: '2026-04-12T12:41:01',
    bbox: [287, 46, 457, 283],
    received_at: '2026-04-12 12:41:01',
  },
  {
    name: 'Sara',
    confidence: 0.6234396698718103,
    timestamp: '2026-04-12T12:41:01',
    bbox: [286, 45, 456, 282],
    received_at: '2026-04-12 12:41:01',
  },
  {
    name: 'Sara',
    confidence: 0.6102959216365968,
    timestamp: '2026-04-12T12:41:02',
    bbox: [286, 45, 456, 283],
    received_at: '2026-04-12 12:41:02',
  },
  {
    name: 'Sara',
    confidence: 0.6212090578902179,
    timestamp: '2026-04-12T12:41:02',
    bbox: [286, 45, 457, 283],
    received_at: '2026-04-12 12:41:02',
  },
  {
    name: 'Sara',
    confidence: 0.5933333141181834,
    timestamp: '2026-04-12T12:41:03',
    bbox: [286, 45, 456, 283],
    received_at: '2026-04-12 12:41:03',
  },
];

export const fetchRecognitionEvents = async () => {
  const remote = await getFromApi('/recognition/events');
  if (Array.isArray(remote?.events) && remote.events.length > 0) {
    return remote.events;
  }

  return DEMO_RECOGNITION_EVENTS;
};
