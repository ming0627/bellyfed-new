/**
 * Logger Utility
 *
 * This module is a wrapper around the debugLogger to provide a simpler interface
 * for logging throughout the application. It uses a default category for all logs
 * and exposes a simplified API for common logging operations.
 */

import * as debugLogger from './debugLogger.js';

// Create a default category for logs that don't specify one
const DEFAULT_CATEGORY = 'App';

/**
 * The logger object provides methods for different log levels.
 */
const logger = {
  /**
   * Log an error message
   * @param message The log message
   * @param data Optional data to include in the log
   */
  error: (message: string, data?: any): void => {
    debugLogger.error(DEFAULT_CATEGORY, message, data);
  },

  /**
   * Log a warning message
   * @param message The log message
   * @param data Optional data to include in the log
   */
  warn: (message: string, data?: any): void => {
    debugLogger.warn(DEFAULT_CATEGORY, message, data);
  },

  /**
   * Log an info message
   * @param message The log message
   * @param data Optional data to include in the log
   */
  info: (message: string, data?: any): void => {
    debugLogger.info(DEFAULT_CATEGORY, message, data);
  },

  /**
   * Log a debug message
   * @param message The log message
   * @param data Optional data to include in the log
   */
  debug: (message: string, data?: any): void => {
    debugLogger.debug(DEFAULT_CATEGORY, message, data);
  },

  /**
   * Log a trace message
   * @param message The log message
   * @param data Optional data to include in the log
   */
  trace: (message: string, data?: any): void => {
    debugLogger.trace(DEFAULT_CATEGORY, message, data);
  },

  /**
   * Set the current log level
   * @param level The log level to set
   */
  setLogLevel: debugLogger.setLogLevel,

  /**
   * Get the current log level
   * @returns The current log level
   */
  getLogLevel: debugLogger.getLogLevel,

  /**
   * Enable or disable logging to the server
   * @param enable Whether to enable logging to the server
   */
  enableServerLogging: debugLogger.enableServerLogging,

  /**
   * Enable or disable logging to storage (alias for enableServerLogging)
   * @param enable Whether to enable logging to storage
   */
  enableStorageLogging: debugLogger.enableStorageLogging,

  /**
   * Get all logs from server
   * @returns An array of log entries
   */
  getLogs: debugLogger.getLogs,

  /**
   * Clear all logs from server
   */
  clearLogs: debugLogger.clearLogs,

  /**
   * Export logs as a JSON file
   */
  exportLogs: debugLogger.exportLogs,

  /**
   * Set the user ID for tracking logs
   * @param id The user ID
   */
  setUserId: debugLogger.setUserId,

  /**
   * Get the current user ID
   * @returns The current user ID
   */
  getUserId: debugLogger.getUserId,

  /**
   * Set the session ID for tracking logs
   * @param id The session ID
   */
  setSessionId: debugLogger.setSessionId,

  /**
   * Get the current session ID
   * @returns The current session ID
   */
  getSessionId: debugLogger.getSessionId,

  /**
   * Generate a unique session ID
   * @returns A unique session ID
   */
  generateSessionId: debugLogger.generateSessionId,

  /**
   * Retry sending failed logs to the server
   * @returns The number of logs successfully sent
   */
  retryFailedLogs: debugLogger.retryFailedLogs,

  /**
   * Configure the logger
   * @param config The configuration to apply
   */
  configure: debugLogger.configure,

  /**
   * Log level constants
   */
  LogLevel: debugLogger.LogLevel,

  /**
   * Log level names
   */
  LogLevelNames: debugLogger.LogLevelNames,
};

export default logger;
