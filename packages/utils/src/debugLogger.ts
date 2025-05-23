/**
 * Debug Logger Utility
 *
 * This module provides functions for logging debug information
 * to help diagnose and troubleshoot issues in the application.
 * It supports multiple log levels, categories, and can send logs
 * to the server for persistent storage.
 */

/**
 * Log Level enum
 * Defines the available log levels
 */
export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

/**
 * Log Level Names
 * Maps log level numbers to their string representations
 */
export const LogLevelNames: Record<LogLevel, string> = {
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.TRACE]: 'TRACE',
};

/**
 * Log Entry interface
 * Represents a log entry
 */
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  sessionId?: string;
  userId?: string;
}

/**
 * Logger Configuration interface
 * Represents the configuration for the logger
 */
export interface LoggerConfig {
  logLevel: LogLevel;
  logToServer: boolean;
  logToConsole: boolean;
  serverEndpoint: string;
  includeSessionId: boolean;
  includeUserId: boolean;
  maxRetries: number;
  retryDelay: number;
}

// Default configuration
const defaultConfig: LoggerConfig = {
  logLevel: LogLevel.INFO,
  logToServer: true,
  logToConsole: true,
  serverEndpoint: '/api/debug-logs',
  includeSessionId: true,
  includeUserId: true,
  maxRetries: 3,
  retryDelay: 1000,
};

// Current configuration
let config: LoggerConfig = { ...defaultConfig };

// Session ID for tracking logs from the same session
let sessionId: string | undefined;

// User ID for tracking logs from the same user
let userId: string | undefined;

// Queue for logs that failed to send to the server
const failedLogs: LogEntry[] = [];

/**
 * Configure the logger
 * @param newConfig The new configuration to apply
 */
export const configure = (newConfig: Partial<LoggerConfig>): void => {
  config = { ...config, ...newConfig };
  log(LogLevel.INFO, 'Logger', 'Logger configuration updated', newConfig);
};

/**
 * Set the current log level
 * @param level The log level to set
 */
export const setLogLevel = (level: LogLevel): void => {
  config.logLevel = level;
  log(LogLevel.INFO, 'Logger', `Log level set to ${LogLevelNames[level]}`);
};

/**
 * Enable or disable logging to the server
 * @param enable Whether to enable logging to the server
 */
export const enableServerLogging = (enable: boolean): void => {
  config.logToServer = enable;
  log(
    LogLevel.INFO,
    'Logger',
    `Server logging ${enable ? 'enabled' : 'disabled'}`,
  );
};

/**
 * Get the current log level
 * @returns The current log level
 */
export const getLogLevel = (): LogLevel => {
  return config.logLevel;
};

/**
 * Set the user ID for tracking logs
 * @param id The user ID
 */
export const setUserId = (id: string): void => {
  userId = id;
  log(LogLevel.INFO, 'Logger', `User ID set to ${id}`);
};

/**
 * Get the current user ID
 * @returns The current user ID
 */
export const getUserId = (): string | undefined => {
  return userId;
};

/**
 * Set the session ID for tracking logs
 * @param id The session ID
 */
export const setSessionId = (id: string): void => {
  sessionId = id;
  log(LogLevel.INFO, 'Logger', `Session ID set to ${id}`);
};

/**
 * Get the current session ID
 * @returns The current session ID
 */
export const getSessionId = (): string | undefined => {
  return sessionId;
};

/**
 * Generate a unique session ID
 * @returns A unique session ID
 */
export const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Log a message at the specified level
 * @param level The log level
 * @param category The log category
 * @param message The log message
 * @param data Optional data to include in the log
 */
export const log = (
  level: LogLevel,
  category: string,
  message: string,
  data?: any,
): void => {
  // Only log if the level is less than or equal to the current log level
  if (level > config.logLevel) {
    return;
  }

  // Create the log entry
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    category,
    message,
    data,
  };

  // Add session ID if enabled and available
  if (config.includeSessionId && sessionId) {
    entry.sessionId = sessionId;
  }

  // Add user ID if enabled and available
  if (config.includeUserId && userId) {
    entry.userId = userId;
  }

  // Log to console if enabled
  if (config.logToConsole) {
    // Format the log message
    const formattedMessage = `[${entry.timestamp}] [${LogLevelNames[level]}] [${category}] ${message}`;

    // Log to console with appropriate level
    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(formattedMessage, data || '');
        break;
    }
  }

  // Log to server if enabled
  if (config.logToServer && typeof window !== 'undefined') {
    sendLogToServer(entry).catch((error) => {
      console.error('Failed to log to server:', error);
      // Add to failed logs queue
      failedLogs.push(entry);
    });
  }
};

/**
 * Send a log entry to the server
 * @param entry The log entry to send
 * @param retryCount The current retry count
 */
export const sendLogToServer = async (
  entry: LogEntry,
  retryCount: number = 0,
): Promise<void> => {
  try {
    const response = await fetch(config.serverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
  } catch (error: unknown) {
    // Retry if we haven't exceeded the maximum retry count
    if (retryCount < config.maxRetries) {
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, config.retryDelay));
      // Retry with incremented retry count
      await sendLogToServer(entry, retryCount + 1);
    } else {
      // Rethrow the error if we've exceeded the maximum retry count
      throw error;
    }
  }
};

/**
 * Retry sending failed logs to the server
 * @returns The number of logs successfully sent
 */
export const retryFailedLogs = async (): Promise<number> => {
  if (failedLogs.length === 0) {
    return 0;
  }

  let successCount = 0;
  const logsToRetry = [...failedLogs];
  failedLogs.length = 0; // Clear the queue

  for (const entry of logsToRetry) {
    try {
      await sendLogToServer(entry);
      successCount++;
    } catch (error: unknown) {
      // Add back to the queue
      failedLogs.push(entry);
    }
  }

  return successCount;
};

/**
 * Log an error message
 * @param category The log category
 * @param message The log message
 * @param data Optional data to include in the log
 */
export const error = (category: string, message: string, data?: any): void => {
  log(LogLevel.ERROR, category, message, data);
};

/**
 * Log a warning message
 * @param category The log category
 * @param message The log message
 * @param data Optional data to include in the log
 */
export const warn = (category: string, message: string, data?: any): void => {
  log(LogLevel.WARN, category, message, data);
};

/**
 * Log an info message
 * @param category The log category
 * @param message The log message
 * @param data Optional data to include in the log
 */
export const info = (category: string, message: string, data?: any): void => {
  log(LogLevel.INFO, category, message, data);
};

/**
 * Log a debug message
 * @param category The log category
 * @param message The log message
 * @param data Optional data to include in the log
 */
export const debug = (category: string, message: string, data?: any): void => {
  log(LogLevel.DEBUG, category, message, data);
};

/**
 * Log a trace message
 * @param category The log category
 * @param message The log message
 * @param data Optional data to include in the log
 */
export const trace = (category: string, message: string, data?: any): void => {
  log(LogLevel.TRACE, category, message, data);
};

/**
 * Get all logs from server
 * @returns An array of log entries
 */
export const getLogs = async (): Promise<LogEntry[]> => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const response = await fetch(config.serverEndpoint, {
      method: 'GET',
      credentials: 'include',
    });

    if (response.ok) {
      return await response.json();
    }

    return [];
  } catch (error: unknown) {
    console.error('Failed to get logs from server:', error);
    return [];
  }
};

/**
 * Clear all logs from server
 */
export const clearLogs = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    await fetch(config.serverEndpoint, {
      method: 'DELETE',
      credentials: 'include',
    });

    log(LogLevel.INFO, 'Logger', 'Logs cleared');
  } catch (error: unknown) {
    console.error('Failed to clear logs from server:', error);
    throw error;
  }
};

/**
 * Export logs as a JSON file
 */
export const exportLogs = async (): Promise<void> => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const logs = await getLogs();
    const blob = new Blob([JSON.stringify(logs, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug_logs_${new Date().toISOString().replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    log(LogLevel.INFO, 'Logger', 'Logs exported');
  } catch (error: unknown) {
    console.error('Failed to export logs:', error);
    throw error;
  }
};

// For backward compatibility
export const enableStorageLogging = enableServerLogging;

// Initialize logger
if (typeof window !== 'undefined') {
  // Generate a session ID
  sessionId = generateSessionId();

  // Check if debug mode is enabled via URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const debugParam = urlParams.get('debug');

  if (debugParam === 'trace') {
    setLogLevel(LogLevel.TRACE);
  } else if (debugParam === 'debug') {
    setLogLevel(LogLevel.DEBUG);
  } else if (debugParam === 'info') {
    setLogLevel(LogLevel.INFO);
  } else if (debugParam === 'warn') {
    setLogLevel(LogLevel.WARN);
  } else if (debugParam === 'error') {
    setLogLevel(LogLevel.ERROR);
  } else if (debugParam === 'none') {
    setLogLevel(LogLevel.ERROR);
    enableServerLogging(false);
  }

  // Log initial information
  info('Logger', 'Debug logger initialized', {
    level: LogLevelNames[config.logLevel],
    serverLogging: config.logToServer,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId,
  });
}

// Export default object for convenience
export default {
  configure,
  setLogLevel,
  getLogLevel,
  enableServerLogging,
  enableStorageLogging, // Alias for backward compatibility
  setUserId,
  getUserId,
  setSessionId,
  getSessionId,
  generateSessionId,
  log,
  error,
  warn,
  info,
  debug,
  trace,
  getLogs,
  clearLogs,
  exportLogs,
  retryFailedLogs,
  LogLevel,
  LogLevelNames,
};
