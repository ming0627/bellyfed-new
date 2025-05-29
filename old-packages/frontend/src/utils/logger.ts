/**
 * Logger Utility
 *
 * This module is a wrapper around the debugLogger to provide a simpler interface
 * for logging throughout the application.
 */

import * as debugLogger from './debugLogger';

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
   * Enable or disable logging to localStorage
   * @param enable Whether to enable logging to localStorage
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
};

export default logger;
