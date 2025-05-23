// Export all utility functions and types from this file
// This file will be expanded as we migrate utilities from the existing project

export * from './types/index.js';
export * from './imageCompression.js';
export * from './auth.js';
export * from './countryRouteHelpers.js';
export * from './events.js';
export * from './apiConfig.js';
export * from './authRedirect.js';
export * from './config/countries.js';
export * from './aws.js';
export * from './csrfProtection.js';
export * from './date.js';
export * from './db.js';
export * from './environment.js';
export * from './environmentHandler.js';
export * from './hydrationFix.js';
export * from './image.js';
export * from './postgres.js';
export * from './serverAuth.js';

// Export shared utilities with explicit exports to avoid naming conflicts
export {
  // Rename formatDate to sharedFormatDate to avoid conflict with date.js
  formatDate as sharedFormatDate,
  formatCurrency,
  formatCurrencyWithSymbol,
  getCurrencySymbol,
  currencyConfigs,
  truncateText,
  generateId,
  isValidEmail,
  isValidPhoneNumber,
  delay,
  formatNumber,
  formatPercentage,
  capitalize,
  toTitleCase,
} from './shared/index.js';

// Export debugLogger with explicit exports to avoid naming conflicts
export {
  LogLevel,
  LogLevelNames,
  configure as configureLogger,
  setLogLevel,
  getLogLevel,
  enableServerLogging,
  enableStorageLogging,
  setSessionId,
  getSessionId,
  generateSessionId,
  log,
  error as logError,
  warn as logWarn,
  info as logInfo,
  debug as logDebug,
  trace as logTrace,
  getLogs,
  clearLogs,
  exportLogs,
  retryFailedLogs,
  // Rename getUserId to avoid conflict with auth.js
  setUserId as setLoggerUserId,
  getUserId as getLoggerUserId,
} from './debugLogger.js';

// Export logger as a default export
export { default as logger } from './logger.js';

// Export country utilities with explicit exports to avoid naming conflicts
export {
  getCountryFromContext,
  getCountryConfig,
  getDefaultCountryCode,
  getSupportedCountryCodes,
  isValidCountryCode,
  getCountryName,
  getCountryCurrency,
  getCountryFlagUrl,
  getCountryTopReviewers,
  getCountryTopDishes,
  getCountryTopLocations,
  // Rename extractCountryCode to avoid conflict with authRedirect.js
  extractCountryCode as extractCountryCodeFromPath,
} from './country.js';

// Utility functions
