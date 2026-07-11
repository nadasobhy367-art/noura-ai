/* eslint-disable no-console */

const debugEnabled = process.env.REACT_APP_DEBUG_LOGS === 'true';
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  debug: (...args) => {
    if (debugEnabled) console.debug(...args);
  },
  info: (...args) => {
    if (debugEnabled) console.info(...args);
  },
  warn: (...args) => {
    if (debugEnabled || isDevelopment) console.warn(...args);
  },
  error: (...args) => {
    if (debugEnabled || isDevelopment) console.error(...args);
  },
};

export default logger;
