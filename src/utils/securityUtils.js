import CryptoJS from 'crypto-js';
import { logger } from './logger';

const SECRET_KEY =
  process.env.REACT_APP_SECRET_KEY ||
  sessionStorage.getItem('noura_runtime_secret') ||
  (() => {
    const runtimeSecret = globalThis.crypto?.randomUUID?.() || `runtime-${Date.now()}`;
    sessionStorage.setItem('noura_runtime_secret', runtimeSecret);
    return runtimeSecret;
  })();

// ==================== ENCRYPTION FUNCTIONS ====================
export const encryptData = data => {
  try {
    const jsonString = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
    return encrypted;
  } catch {
    return null;
  }
};

export const decryptData = encryptedData => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch {
    return null;
  }
};

// ==================== SECURE STORAGE FUNCTIONS ====================
export const secureSetItem = (key, data) => {
  try {
    const encrypted = encryptData(data);
    if (encrypted) {
      localStorage.setItem(`noura_${key}`, encrypted);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

export const secureGetItem = key => {
  try {
    if (key === 'user') {
      const sessionUser = sessionStorage.getItem('secure_user');
      return sessionUser ? JSON.parse(sessionUser) : null;
    }

    const encrypted = localStorage.getItem(`noura_${key}`);
    if (!encrypted) return null;

    const decrypted = decryptData(encrypted);
    return decrypted;
  } catch {
    return null;
  }
};

export const secureRemoveItem = key => {
  try {
    if (key === 'user') {
      sessionStorage.removeItem('secure_user');
      return true;
    }
    localStorage.removeItem(`noura_${key}`);
    return true;
  } catch {
    return false;
  }
};

export const secureClearAll = () => {
  try {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('noura_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    sessionStorage.clear();
    return true;
  } catch {
    return false;
  }
};

// ==================== PASSWORD HASHING ====================
export const hashPassword = password => {
  try {
    return CryptoJS.SHA256(password + SECRET_KEY).toString();
  } catch {
    return null;
  }
};

export const verifyPassword = (password, hashedPassword) => {
  try {
    const hash = hashPassword(password);
    return hash === hashedPassword;
  } catch {
    return false;
  }
};

// ==================== SESSION MANAGEMENT ====================
export const createSessionToken = userData => {
  try {
    const timestamp = Date.now();
    const expiresIn = parseInt(process.env.REACT_APP_SESSION_TIMEOUT, 10) || 5 * 60 * 1000;
    const sessionData = {
      ...userData,
      timestamp,
      expiresAt: timestamp + expiresIn,
    };
    return encryptData(sessionData);
  } catch {
    return null;
  }
};

export const validateSessionToken = token => {
  try {
    const sessionData = decryptData(token);
    if (!sessionData) return null;

    if (Date.now() > sessionData.expiresAt) {
      logger.warn('Session expired');
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
};

// ==================== AUTO LOGOUT ====================
export const setupAutoLogout = (logoutCallback, timeout = 5 * 60 * 1000) => {
  let timeoutId;

  const resetTimer = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      logger.warn('Auto-logout: Session expired due to inactivity');
      logoutCallback();
    }, timeout);
  };

  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimer, true);
  });

  resetTimer();

  return () => {
    clearTimeout(timeoutId);
    events.forEach(event => {
      document.removeEventListener(event, resetTimer, true);
    });
  };
};

// ==================== XSS PROTECTION ====================
export const sanitizeInput = input => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeObject = obj => {
  if (typeof obj !== 'object' || obj === null) return obj;

  const sanitized = {};
  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = sanitizeInput(obj[key]);
    } else if (typeof obj[key] === 'object') {
      sanitized[key] = sanitizeObject(obj[key]);
    } else {
      sanitized[key] = obj[key];
    }
  }
  return sanitized;
};

const securityUtils = {
  encryptData,
  decryptData,
  secureSetItem,
  secureGetItem,
  secureRemoveItem,
  secureClearAll,
  hashPassword,
  verifyPassword,
  createSessionToken,
  validateSessionToken,
  setupAutoLogout,
  sanitizeInput,
  sanitizeObject,
};

export default securityUtils;
