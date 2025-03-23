/**
 * Centralized logger utility for the application
 * In production: uses structured logging without sensitive data
 * In development: provides detailed console output
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// Safely stringify objects, redacting sensitive fields
const safeStringify = (obj) => {
  if (typeof obj !== 'object' || obj === null) return String(obj);
  
  // Create a copy to avoid modifying the original
  const sanitized = { ...obj };
  
  // List of sensitive fields to redact
  const sensitiveFields = [
    'password', 'token', 'secret', 'apiKey', 'api_key', 
    'apiSecret', 'api_secret', 'key', 'authorization',
    'email', 'phone', 'address', 'creditCard', 'ssn'
  ];
  
  // Redact sensitive information
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }

  
  
  try {
    return JSON.stringify(sanitized);
  } catch (error) {
    return '[Object cannot be stringified]';
  }
};

// Log levels
const logLevels = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

// Logger implementation
const logger = {
  error: (message, data) => {
    if (isDevelopment) {
      console.error(`ERROR: ${message}`, data);
    } else {
      // In production, use structured logging without sensitive data
      console.error(JSON.stringify({
        level: logLevels.ERROR,
        message,
        timestamp: new Date().toISOString(),
        data: data ? safeStringify(data) : undefined,
      }));
    }
  },
  
  warn: (message, data) => {
    if (isDevelopment) {
      console.warn(`WARN: ${message}`, data);
    } else {
      console.warn(JSON.stringify({
        level: logLevels.WARN,
        message,
        timestamp: new Date().toISOString(),
        data: data ? safeStringify(data) : undefined,
      }));
    }
  },
  
  info: (message, data) => {
    if (isDevelopment) {
      console.info(`INFO: ${message}`, data);
    } else {
      console.info(JSON.stringify({
        level: logLevels.INFO,
        message,
        timestamp: new Date().toISOString(),
        data: data ? safeStringify(data) : undefined,
      }));
    }
  },
  
  debug: (message, data) => {
    // Only log debug in development
    if (isDevelopment) {
      console.debug(`DEBUG: ${message}`, data);
    }
  }
};

export default logger; 