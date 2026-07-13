import env from '../config/env.js';

/**
 * Production-safe logger
 * In development: Logs everything to console.
 * In production: Only logs errors/warnings to prevent server log bloat and PII leakage.
 */
const logger = {
  info: (...args) => {
    if (env.nodeEnv !== 'production') {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (env.nodeEnv !== 'production') {
      console.warn(...args);
    } else {
      console.warn('[WARN]', args[0]);
    }
  },
  error: (...args) => {
    console.error(...args);
  }
};

export default logger;
