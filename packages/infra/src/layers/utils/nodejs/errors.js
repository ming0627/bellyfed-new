/**
 * Error handling utilities for AWS Lambda functions
 * These utilities provide standardized error handling for Lambda functions
 */
/**
 * Application error class for business logic errors
 * This class extends the standard Error class with additional properties
 */
export class ApplicationError extends Error {
    message;
    _statusCode;
    _code;
    _details;
    /**
     * Create a new application error
     * @param message Error message
     * @param _statusCode HTTP status code (default: 500)
     * @param _code Error code (default: INTERNAL_SERVER_ERROR)
     * @param _details Additional error details
     */
    constructor(message, _statusCode = 500, _code = 'INTERNAL_SERVER_ERROR', _details) {
        super(message);
        this.message = message;
        this._statusCode = _statusCode;
        this._code = _code;
        this._details = _details;
        this.name = 'ApplicationError';
        // This is needed to make instanceof work correctly with TypeScript
        Object.setPrototypeOf(this, ApplicationError.prototype);
    }
    /**
     * Get the HTTP status code
     */
    get statusCode() {
        return this._statusCode;
    }
    /**
     * Get the error code
     */
    get code() {
        return this._code;
    }
    /**
     * Get additional error details
     */
    get details() {
        return this._details;
    }
}
/**
 * Handle an error in a Lambda function
 * @param error Error object
 * @param context Lambda context
 * @returns Formatted error response
 */
export const handleError = (error, context) => {
    const errorDetails = formatError(error);
    const typedContext = context;
    // Log the error with additional context
    console.error('Error:', {
        ...errorDetails,
        requestId: typedContext.awsRequestId,
        functionName: typedContext.functionName,
    });
    // Return a standardized error response
    return {
        statusCode: error instanceof ApplicationError ? error.statusCode : 500,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': 'true',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...errorDetails.error,
            requestId: typedContext.awsRequestId,
        }),
    };
};
/**
 * Format an error for logging and response
 * @param error Error object
 * @returns Formatted error object
 */
export const formatError = (error) => {
    return {
        error: {
            name: error.name,
            message: error.message,
            ...(error instanceof ApplicationError && {
                details: error.details,
                code: error.code,
                statusCode: error.statusCode,
            }),
        },
    };
};
/**
 * Create a validation error
 * @param message Error message
 * @param details Validation details
 * @returns Application error with validation details
 */
export const createValidationError = (message = 'Validation failed', details) => {
    return new ApplicationError(message, 400, 'VALIDATION_ERROR', details);
};
/**
 * Create a not found error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for not found resources
 */
export const createNotFoundError = (message = 'Resource not found', details) => {
    return new ApplicationError(message, 404, 'NOT_FOUND', details);
};
/**
 * Create an unauthorized error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for unauthorized access
 */
export const createUnauthorizedError = (message = 'Unauthorized', details) => {
    return new ApplicationError(message, 401, 'UNAUTHORIZED', details);
};
/**
 * Create a forbidden error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for forbidden access
 */
export const createForbiddenError = (message = 'Forbidden', details) => {
    return new ApplicationError(message, 403, 'FORBIDDEN', details);
};
/**
 * Create a conflict error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for resource conflicts
 */
export const createConflictError = (message = 'Resource conflict', details) => {
    return new ApplicationError(message, 409, 'CONFLICT', details);
};
/**
 * Create a server error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for server errors
 */
export const createServerError = (message = 'Internal server error', details) => {
    return new ApplicationError(message, 500, 'INTERNAL_SERVER_ERROR', details);
};
