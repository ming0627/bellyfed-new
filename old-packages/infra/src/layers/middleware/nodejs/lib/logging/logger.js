/**
 * Centralized logging utility for Lambda functions
 *
 * Features:
 * 1. Structured JSON logging with consistent format
 * 2. Log level filtering (debug, info, warn, error)
 * 3. Request ID tracking for correlation
 * 4. Environment-aware logging (verbose in dev, minimal in prod)
 * 5. Error stack trace formatting
 * 6. Performance metrics
 */

export const LOG_LEVELS = {
    DEBUG: 'debug',
    INFO: 'info',
    WARN: 'warn',
    ERROR: 'error',
};

// Map log level strings to numeric values for comparison
const LOG_LEVEL_VALUES = {
    [LOG_LEVELS.DEBUG]: 0,
    [LOG_LEVELS.INFO]: 1,
    [LOG_LEVELS.WARN]: 2,
    [LOG_LEVELS.ERROR]: 3,
};

// Default configuration
const DEFAULT_CONFIG = {
    logLevel: process.env.LOG_LEVEL || LOG_LEVELS.INFO,
    enableVerboseLogging: process.env.ENABLE_VERBOSE_LOGGING === 'true',
    environment: process.env.ENVIRONMENT || 'dev',
    service: process.env.AWS_LAMBDA_FUNCTION_NAME || 'unknown',
};

export class Logger {
    constructor(config = {}) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.requestId = null;
        this.startTime = null;
    }

    /**
     * Set the request ID for correlation
     * @param {string} requestId - The request ID from the Lambda context
     */
    setRequestId(requestId) {
        this.requestId = requestId;
        return this;
    }

    /**
     * Start timing for performance metrics
     */
    startTimer() {
        this.startTime = Date.now();
        return this;
    }

    /**
     * Get elapsed time since startTimer was called
     * @returns {number} Elapsed time in milliseconds
     */
    getElapsedTime() {
        if (!this.startTime) {
            return 0;
        }
        return Date.now() - this.startTime;
    }

    /**
     * Log a message at DEBUG level
     * @param {string} message - The log message
     * @param {object} data - Additional data to include in the log
     */
    debug(message, data = {}) {
        this._log(LOG_LEVELS.DEBUG, message, data);
        return this;
    }

    /**
     * Log a message at INFO level
     * @param {string} message - The log message
     * @param {object} data - Additional data to include in the log
     */
    info(message, data = {}) {
        this._log(LOG_LEVELS.INFO, message, data);
        return this;
    }

    /**
     * Log a message at WARN level
     * @param {string} message - The log message
     * @param {object} data - Additional data to include in the log
     */
    warn(message, data = {}) {
        this._log(LOG_LEVELS.WARN, message, data);
        return this;
    }

    /**
     * Log a message at ERROR level
     * @param {string} message - The log message
     * @param {object|Error} dataOrError - Additional data or an Error object
     */
    error(message, dataOrError = {}) {
        let data = dataOrError;

        // Handle Error objects
        if (dataOrError instanceof Error) {
            data = {
                error: {
                    name: dataOrError.name,
                    message: dataOrError.message,
                    stack: dataOrError.stack,
                },
                ...data,
            };
        }

        this._log(LOG_LEVELS.ERROR, message, data);
        return this;
    }

    /**
     * Internal logging method
     * @private
     */
    _log(level, message, data = {}) {
        // Check if this log level should be logged
        if (LOG_LEVEL_VALUES[level] < LOG_LEVEL_VALUES[this.config.logLevel]) {
            return;
        }

        const timestamp = new Date().toISOString();
        const baseLog = {
            timestamp,
            level,
            message,
            service: this.config.service,
            environment: this.config.environment,
        };

        // Add request ID if available
        if (this.requestId) {
            baseLog.requestId = this.requestId;
        }

        // Add elapsed time if timer was started
        if (this.startTime) {
            baseLog.elapsedMs = this.getElapsedTime();
        }

        // Add additional data
        const logData = {
            ...baseLog,
            ...(this.config.enableVerboseLogging ? data : {}),
        };

        // Log as JSON
        console.log(JSON.stringify(logData));
    }

    /**
     * Create a middleware function for Lambda handlers
     * @param {Function} handler - The Lambda handler function
     * @returns {Function} The wrapped handler function
     */
    middleware(handler) {
        return async (event, context) => {
            // Set request ID and start timer
            this.setRequestId(context.awsRequestId).startTimer();

            // Log the incoming event in dev environment
            if (this.config.environment === 'dev' && this.config.enableVerboseLogging) {
                this.debug('Lambda invocation started', { event });
            } else {
                this.info('Lambda invocation started');
            }

            try {
                // Execute the handler
                const result = await handler(event, context);

                // Log the result in dev environment
                if (this.config.environment === 'dev' && this.config.enableVerboseLogging) {
                    this.debug('Lambda invocation completed', { result });
                } else {
                    this.info('Lambda invocation completed', {
                        elapsedMs: this.getElapsedTime(),
                    });
                }

                return result;
            } catch (error) {
                // Log the error
                this.error('Lambda invocation failed', error);

                // Rethrow the error
                throw error;
            }
        };
    }
}

// Export a singleton instance
export const logger = new Logger();
