/**
 * Debug Logger Utility
 *
 * This module provides functions for logging debug information
 * to help diagnose and troubleshoot authentication issues.
 */

// Define log levels
export const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4,
  // Add a reverse mapping for string representation
  0: 'ERROR',
  1: 'WARN',
  2: 'INFO',
  3: 'DEBUG',
  4: 'TRACE',
} as const;

// Default log level - can be overridden
let currentLogLevel: number = LogLevel.INFO;

// Enable or disable logging to localStorage
let logToStorage = true;

// Maximum number of log entries to keep in localStorage (not currently used)
// const MAX_LOG_ENTRIES = 1000;

// Define the type for log levels
export type LogLevelType = typeof LogLevel[keyof typeof LogLevel];

// Log entry type
interface LogEntry {
  timestamp: string;
  level: number;
  category: string;
  message: string;
  data?: any;
}

/**
 * Set the current log level
 * @param level The log level to set
 */
export const setLogLevel = (level: number): void => {
  currentLogLevel = level;
  log(LogLevel.INFO, 'Logger', `Log level set to ${LogLevel[level]}`);
};

/**
 * Enable or disable logging to localStorage
 * @param enable Whether to enable logging to localStorage
 */
export const enableStorageLogging = (enable: boolean): void => {
  logToStorage = enable;
  log(
    LogLevel.INFO,
    'Logger',
    `Storage logging ${enable ? 'enabled' : 'disabled'}`,
  );
};

/**
 * Get the current log level
 * @returns The current log level
 */
export const getLogLevel = (): number => {
  return currentLogLevel;
};

/**
 * Log a message at the specified level
 * @param level The log level
 * @param category The log category
 * @param message The log message
 * @param data Optional data to include in the log
 */
export const log = (
  level: number,
  category: string,
  message: string,
  data?: any,
): void => {
  // Only log if the level is less than or equal to the current log level
  if (level > currentLogLevel) {
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

  // Format the log message
  const formattedMessage = `[${entry.timestamp}] [${LogLevel[level]}] [${category}] ${message}`;

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

  // Log to server if enabled
  if (logToStorage && typeof window !== 'undefined') {
    try {
      // Send log to server API
      fetch('/api/debug-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
        credentials: 'include',
      }).catch((error) => {
        console.error('Failed to log to server:', error);
      });
    } catch (error: unknown) {
      console.error('Failed to log to server:', error);
    }
  }
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
    const response = await fetch('/api/debug-logs', {
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
    await fetch('/api/debug-logs', {
      method: 'DELETE',
      credentials: 'include',
    });

    log(LogLevel.INFO, 'Logger', 'Logs cleared');
  } catch (error: unknown) {
    console.error('Failed to clear logs from server:', error);
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
  }
};

// Initialize logger
if (typeof window !== 'undefined') {
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
    enableStorageLogging(false);
  }

  // Log initial information
  info('Logger', 'Debug logger initialized', {
    level: LogLevel[currentLogLevel],
    storageLogging: logToStorage,
    userAgent: navigator.userAgent,
    url: window.location.href,
  });
}

// Export default object for convenience
export default {
  setLogLevel,
  enableStorageLogging,
  getLogLevel,
  log,
  error,
  warn,
  info,
  debug,
  trace,
  getLogs,
  clearLogs,
  exportLogs,
  LogLevel,
};
