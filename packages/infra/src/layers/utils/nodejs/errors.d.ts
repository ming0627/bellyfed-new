/**
 * Error handling utilities for AWS Lambda functions
 * These utilities provide standardized error handling for Lambda functions
 */
/**
 * Application error class for business logic errors
 * This class extends the standard Error class with additional properties
 */
export declare class ApplicationError extends Error {
    message: string;
    _statusCode: number;
    _code: string;
    _details?: Record<string, unknown> | undefined;
    /**
     * Create a new application error
     * @param message Error message
     * @param _statusCode HTTP status code (default: 500)
     * @param _code Error code (default: INTERNAL_SERVER_ERROR)
     * @param _details Additional error details
     */
    constructor(message: string, _statusCode?: number, _code?: string, _details?: Record<string, unknown> | undefined);
    /**
     * Get the HTTP status code
     */
    get statusCode(): number;
    /**
     * Get the error code
     */
    get code(): string;
    /**
     * Get additional error details
     */
    get details(): Record<string, unknown> | undefined;
}
/**
 * Handle an error in a Lambda function
 * @param error Error object
 * @param context Lambda context
 * @returns Formatted error response
 */
export declare const handleError: (error: Error, context: unknown) => {
    statusCode: number;
    headers: {
        'Access-Control-Allow-Origin': string;
        'Access-Control-Allow-Credentials': string;
        'Content-Type': string;
    };
    body: string;
};
/**
 * Format an error for logging and response
 * @param error Error object
 * @returns Formatted error object
 */
export declare const formatError: (error: Error) => {
    error: {
        details?: Record<string, unknown> | undefined;
        code?: string | undefined;
        statusCode?: number | undefined;
        name: string;
        message: string;
    };
};
/**
 * Create a validation error
 * @param message Error message
 * @param details Validation details
 * @returns Application error with validation details
 */
export declare const createValidationError: (message?: string, details?: Record<string, unknown>) => ApplicationError;
/**
 * Create a not found error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for not found resources
 */
export declare const createNotFoundError: (message?: string, details?: Record<string, unknown>) => ApplicationError;
/**
 * Create an unauthorized error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for unauthorized access
 */
export declare const createUnauthorizedError: (message?: string, details?: Record<string, unknown>) => ApplicationError;
/**
 * Create a forbidden error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for forbidden access
 */
export declare const createForbiddenError: (message?: string, details?: Record<string, unknown>) => ApplicationError;
/**
 * Create a conflict error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for resource conflicts
 */
export declare const createConflictError: (message?: string, details?: Record<string, unknown>) => ApplicationError;
/**
 * Create a server error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for server errors
 */
export declare const createServerError: (message?: string, details?: Record<string, unknown>) => ApplicationError;
//# sourceMappingURL=errors.d.ts.map