/**
 * Debug Logger Utility
 *
 * This module provides enhanced logging capabilities specifically for debugging purposes.
 * It extends the basic logger with additional debugging features and better error tracking.
 */

import { getEnvironmentName, isDevelopmentEnvironment } from './environment.js'

/**
 * Log levels enum
 */
export const LogLevel = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5,
  OFF: 6
}

/**
 * Log level names
 */
export const LogLevelNames = {
  [LogLevel.TRACE]: 'TRACE',
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL',
  [LogLevel.OFF]: 'OFF'
}

/**
 * Logger configuration
 */
export const LoggerConfig = {
  logLevel: isDevelopmentEnvironment() ? LogLevel.DEBUG : LogLevel.INFO,
  logToConsole: true,
  logToServer: false,
  includeStackTrace: isDevelopmentEnvironment(),
  includeSessionId: true,
  includeUserId: false,
  includeTimestamp: true,
  includeCategory: true,
  serverEndpoint: '/api/logs',
  maxRetries: 3,
  retryDelay: 1000
}

// Current configuration
let config = { ...LoggerConfig }

// Session ID for tracking logs from the same session
let sessionId = undefined

// User ID for tracking logs from the same user
let userId = undefined

// Queue for logs that failed to send to the server
const failedLogs = []

// In-memory log storage for debugging
const logStorage = []
const maxStoredLogs = 1000

/**
 * Generate a unique session ID
 * @returns {string} A unique session ID
 */
export function generateSessionId() {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substr(2, 9)
  return `${timestamp}-${random}`
}

/**
 * Configure the debug logger
 * @param {object} newConfig The new configuration to apply
 */
export function configure(newConfig) {
  config = { ...config, ...newConfig }
  log(LogLevel.INFO, 'DebugLogger', 'Debug logger configuration updated', newConfig)
}

/**
 * Set the current log level
 * @param {number} level The log level to set
 */
export function setLogLevel(level) {
  config.logLevel = level
  log(LogLevel.INFO, 'DebugLogger', `Log level set to ${LogLevelNames[level]}`)
}

/**
 * Get the current log level
 * @returns {number} The current log level
 */
export function getLogLevel() {
  return config.logLevel
}

/**
 * Enable or disable logging to the server
 * @param {boolean} enable Whether to enable logging to the server
 */
export function enableServerLogging(enable) {
  config.logToServer = enable
  log(LogLevel.INFO, 'DebugLogger', `Server logging ${enable ? 'enabled' : 'disabled'}`)
}

/**
 * Set the user ID for tracking logs
 * @param {string} id The user ID
 */
export function setUserId(id) {
  userId = id
  log(LogLevel.INFO, 'DebugLogger', `User ID set to ${id}`)
}

/**
 * Get the current user ID
 * @returns {string|undefined} The current user ID
 */
export function getUserId() {
  return userId
}

/**
 * Set the session ID for tracking logs
 * @param {string} id The session ID
 */
export function setSessionId(id) {
  sessionId = id
  log(LogLevel.INFO, 'DebugLogger', `Session ID set to ${id}`)
}

/**
 * Get the current session ID
 * @returns {string|undefined} The current session ID
 */
export function getSessionId() {
  return sessionId
}

/**
 * Get stack trace information
 * @returns {string} Stack trace string
 */
function getStackTrace() {
  try {
    throw new Error()
  } catch (error) {
    return error.stack || 'Stack trace not available'
  }
}

/**
 * Log a message at the specified level
 * @param {number} level The log level
 * @param {string} category The log category
 * @param {string} message The log message
 * @param {any} data Optional data to include in the log
 */
export function log(level, category, message, data) {
  // Only log if the level is greater than or equal to the current log level
  if (level < config.logLevel) {
    return
  }

  // Create the log entry
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    levelName: LogLevelNames[level],
    category,
    message,
    data,
    environment: getEnvironmentName()
  }

  // Add session ID if enabled and available
  if (config.includeSessionId && sessionId) {
    entry.sessionId = sessionId
  }

  // Add user ID if enabled and available
  if (config.includeUserId && userId) {
    entry.userId = userId
  }

  // Add stack trace for errors and if enabled
  if (config.includeStackTrace && (level >= LogLevel.ERROR || isDevelopmentEnvironment())) {
    entry.stackTrace = getStackTrace()
  }

  // Store log in memory
  storeLog(entry)

  // Log to console if enabled
  if (config.logToConsole) {
    logToConsole(entry)
  }

  // Send to server if enabled
  if (config.logToServer) {
    sendLogToServer(entry)
  }
}

/**
 * Log to console with enhanced formatting
 * @param {object} entry The log entry
 */
function logToConsole(entry) {
  const { level, levelName, category, message, data, timestamp } = entry
  
  // Choose console method and styling based on log level
  let consoleMethod = 'log'
  let emoji = '📝'
  let color = '#666'
  let bgColor = 'transparent'

  switch (level) {
    case LogLevel.TRACE:
      consoleMethod = 'debug'
      emoji = '🔍'
      color = '#999'
      break
    case LogLevel.DEBUG:
      consoleMethod = 'debug'
      emoji = '🐛'
      color = '#0066cc'
      break
    case LogLevel.INFO:
      consoleMethod = 'info'
      emoji = 'ℹ️'
      color = '#0066cc'
      break
    case LogLevel.WARN:
      consoleMethod = 'warn'
      emoji = '⚠️'
      color = '#ff9900'
      bgColor = '#fff3cd'
      break
    case LogLevel.ERROR:
      consoleMethod = 'error'
      emoji = '❌'
      color = '#cc0000'
      bgColor = '#f8d7da'
      break
    case LogLevel.FATAL:
      consoleMethod = 'error'
      emoji = '💀'
      color = '#990000'
      bgColor = '#f5c6cb'
      break
  }

  // Format the log message with enhanced styling
  const timeStr = config.includeTimestamp ? `[${new Date(timestamp).toLocaleTimeString()}]` : ''
  const categoryStr = config.includeCategory ? `[${category}]` : ''
  const prefix = `${emoji} ${timeStr} ${categoryStr} ${levelName}:`

  // Enhanced console styling
  const style = `color: ${color}; background-color: ${bgColor}; padding: 2px 4px; border-radius: 3px; font-weight: bold;`

  // Log to console with data
  if (data !== undefined) {
    console[consoleMethod](`%c${prefix} ${message}`, style, data)
  } else {
    console[consoleMethod](`%c${prefix} ${message}`, style)
  }

  // Log stack trace for errors in development
  if (entry.stackTrace && isDevelopmentEnvironment() && level >= LogLevel.ERROR) {
    console.groupCollapsed('Stack Trace')
    console.log(entry.stackTrace)
    console.groupEnd()
  }
}

/**
 * Store log in memory for debugging
 * @param {object} entry The log entry
 */
function storeLog(entry) {
  logStorage.push(entry)
  
  // Remove old logs if we exceed the maximum
  if (logStorage.length > maxStoredLogs) {
    logStorage.shift()
  }
}

/**
 * Send log to server
 * @param {object} entry The log entry
 */
async function sendLogToServer(entry) {
  if (typeof fetch === 'undefined') return

  try {
    const response = await fetch(config.serverEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(entry),
    })

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`)
    }
  } catch (error) {
    // Add to failed logs queue for retry
    failedLogs.push(entry)
    
    // Log the error (but don't send to server to avoid infinite loop)
    console.error('Failed to send log to server:', error)
  }
}

/**
 * Get all stored logs
 * @returns {Array} An array of log entries
 */
export function getLogs() {
  return [...logStorage]
}

/**
 * Clear all stored logs
 */
export function clearLogs() {
  logStorage.length = 0
  log(LogLevel.INFO, 'DebugLogger', 'Log storage cleared')
}

/**
 * Export logs as a JSON file
 */
export function exportLogs() {
  if (typeof window === 'undefined') return

  const logs = getLogs()
  const dataStr = JSON.stringify(logs, null, 2)
  const dataBlob = new Blob([dataStr], { type: 'application/json' })
  
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement('a')
  link.href = url
  link.download = `bellyfed-debug-logs-${new Date().toISOString().split('T')[0]}.json`
  link.click()
  
  URL.revokeObjectURL(url)
}

/**
 * Retry sending failed logs to the server
 * @returns {Promise<number>} The number of logs successfully sent
 */
export async function retryFailedLogs() {
  let successCount = 0
  const logsToRetry = [...failedLogs]
  failedLogs.length = 0

  for (const entry of logsToRetry) {
    try {
      await sendLogToServer(entry)
      successCount++
    } catch (error) {
      // Re-add to failed logs if retry fails
      failedLogs.push(entry)
    }
  }

  log(LogLevel.INFO, 'DebugLogger', `Retried ${logsToRetry.length} failed logs, ${successCount} successful`)
  return successCount
}

// Convenience methods for different log levels
export const trace = (category, message, data) => log(LogLevel.TRACE, category, message, data)
export const debug = (category, message, data) => log(LogLevel.DEBUG, category, message, data)
export const info = (category, message, data) => log(LogLevel.INFO, category, message, data)
export const warn = (category, message, data) => log(LogLevel.WARN, category, message, data)
export const error = (category, message, data) => log(LogLevel.ERROR, category, message, data)
export const fatal = (category, message, data) => log(LogLevel.FATAL, category, message, data)

/**
 * Initialize the debug logger
 */
export function initializeDebugLogger() {
  if (typeof window === 'undefined') return

  // Generate session ID if not already set
  if (!sessionId) {
    sessionId = generateSessionId()
  }

  // Log initial information
  info('DebugLogger', 'Debug logger initialized', {
    level: LogLevelNames[config.logLevel],
    serverLogging: config.logToServer,
    userAgent: navigator.userAgent,
    url: window.location.href,
    sessionId,
    environment: getEnvironmentName()
  })
}

// Default logger instance with simplified interface
const debugLogger = {
  trace: (message, data) => trace('Debug', message, data),
  debug: (message, data) => debug('Debug', message, data),
  info: (message, data) => info('Debug', message, data),
  warn: (message, data) => warn('Debug', message, data),
  error: (message, data) => error('Debug', message, data),
  fatal: (message, data) => fatal('Debug', message, data),
  
  // Configuration methods
  configure,
  setLogLevel,
  getLogLevel,
  enableServerLogging,
  setUserId,
  getUserId,
  setSessionId,
  getSessionId,
  generateSessionId,
  getLogs,
  clearLogs,
  exportLogs,
  retryFailedLogs,
  initializeDebugLogger,
  
  // Constants
  LogLevel,
  LogLevelNames
}

export default debugLogger
