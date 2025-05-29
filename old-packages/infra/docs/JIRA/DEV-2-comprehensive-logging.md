# DEV-2: Implement Comprehensive Logging

## Summary

Implement a comprehensive logging system across all components.

## Description

The current logging approach is inconsistent and lacks important context, making it difficult to troubleshoot issues. This task involves implementing a comprehensive logging system across all components.

## Acceptance Criteria

- [ ] Create a logging library with standardized log levels
- [ ] Implement structured logging with JSON format
- [ ] Add request context to all logs
- [ ] Implement correlation IDs for request tracing
- [ ] Add performance metrics to logs
- [ ] Update existing code to use the new logging approach
- [ ] Create documentation for the logging standards

## Technical Details

The implementation should include:

1. **Logging Library**:

    ```typescript
    // Create logging library
    import * as winston from 'winston';

    export enum LogLevel {
        ERROR = 'error',
        WARN = 'warn',
        INFO = 'info',
        DEBUG = 'debug',
    }

    export interface LogContext {
        requestId?: string;
        userId?: string;
        path?: string;
        method?: string;
        statusCode?: number;
        duration?: number;
        [key: string]: any;
    }

    export class Logger {
        private logger: winston.Logger;

        constructor(serviceName: string) {
            this.logger = winston.createLogger({
                level: process.env.LOG_LEVEL || 'info',
                format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
                defaultMeta: { service: serviceName },
                transports: [new winston.transports.Console()],
            });
        }

        log(level: LogLevel, message: string, context?: LogContext) {
            this.logger.log(level, message, context);
        }

        error(message: string, context?: LogContext) {
            this.log(LogLevel.ERROR, message, context);
        }

        warn(message: string, context?: LogContext) {
            this.log(LogLevel.WARN, message, context);
        }

        info(message: string, context?: LogContext) {
            this.log(LogLevel.INFO, message, context);
        }

        debug(message: string, context?: LogContext) {
            this.log(LogLevel.DEBUG, message, context);
        }
    }
    ```

2. **Request Logging Middleware**:

    ```typescript
    // Create request logging middleware
    import { Request, Response, NextFunction } from 'express';
    import { v4 as uuidv4 } from 'uuid';
    import { Logger, LogLevel } from './logger';

    export const requestLoggingMiddleware = (logger: Logger) => {
        return (req: Request, res: Response, next: NextFunction) => {
            const requestId = req.headers['x-request-id'] || uuidv4();
            const startTime = Date.now();

            // Add request ID to response headers
            res.setHeader('x-request-id', requestId);

            // Add request context to request object
            req.context = {
                requestId,
                startTime,
            };

            // Log request
            logger.info(`${req.method} ${req.path}`, {
                requestId,
                method: req.method,
                path: req.path,
                query: req.query,
                headers: {
                    'user-agent': req.headers['user-agent'],
                    'content-type': req.headers['content-type'],
                },
                userId: req.user?.id,
            });

            // Log response
            res.on('finish', () => {
                const duration = Date.now() - startTime;
                const level = res.statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;

                logger.log(level, `${req.method} ${req.path} ${res.statusCode}`, {
                    requestId,
                    method: req.method,
                    path: req.path,
                    statusCode: res.statusCode,
                    duration,
                    userId: req.user?.id,
                });
            });

            next();
        };
    };
    ```

3. **Performance Metrics**:

    ```typescript
    // Create performance metrics
    export const measurePerformance = <T>(
        logger: Logger,
        operation: string,
        fn: () => Promise<T>,
        context?: LogContext
    ): Promise<T> => {
        const startTime = Date.now();

        return fn()
            .then((result) => {
                const duration = Date.now() - startTime;

                logger.info(`${operation} completed`, {
                    ...context,
                    operation,
                    duration,
                });

                return result;
            })
            .catch((error) => {
                const duration = Date.now() - startTime;

                logger.error(`${operation} failed`, {
                    ...context,
                    operation,
                    duration,
                    error: {
                        message: error.message,
                        stack: error.stack,
                    },
                });

                throw error;
            });
    };
    ```

## Benefits

- Consistent logging across all components
- Better context for troubleshooting
- Improved request tracing
- Performance metrics for optimization
- Easier to identify and fix issues
- Improved developer experience

## Priority

High

## Estimated Story Points

8

## Dependencies

None - can be implemented independently of other tasks

## Attachments

- [Lambda Standards](../DEVELOPMENT/standards/lambda-standards.md)
