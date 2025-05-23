/**
 * Error handling utilities for AWS Lambda functions
 * These utilities provide standardized error handling for Lambda functions
 */

/**
 * Application error class for business logic errors
 * This class extends the standard Error class with additional properties
 */
export class ApplicationError extends Error {
  /**
   * Create a new application error
   * @param message Error message
   * @param _statusCode HTTP status code (default: 500)
   * @param _code Error code (default: INTERNAL_SERVER_ERROR)
   * @param _details Additional error details
   */
  constructor(
    public message: string,
    public _statusCode: number = 500,
    public _code: string = 'INTERNAL_SERVER_ERROR',
    public _details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApplicationError';
    
    // This is needed to make instanceof work correctly with TypeScript
    Object.setPrototypeOf(this, ApplicationError.prototype);
  }

  /**
   * Get the HTTP status code
   */
  get statusCode(): number {
    return this._statusCode;
  }

  /**
   * Get the error code
   */
  get code(): string {
    return this._code;
  }

  /**
   * Get additional error details
   */
  get details(): Record<string, unknown> | undefined {
    return this._details;
  }
}

/**
 * Lambda context interface
 */
interface LambdaContext {
  /**
   * AWS request ID
   */
  awsRequestId: string;
  
  /**
   * Lambda function name
   */
  functionName: string;
  
  /**
   * Additional context properties
   */
  [key: string]: unknown;
}

/**
 * Handle an error in a Lambda function
 * @param error Error object
 * @param context Lambda context
 * @returns Formatted error response
 */
export const handleError = (error: Error, context: unknown) => {
  const errorDetails = formatError(error);
  const typedContext = context as LambdaContext;

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
export const formatError = (error: Error) => {
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
export const createValidationError = (
  message: string = 'Validation failed',
  details?: Record<string, unknown>
): ApplicationError => {
  return new ApplicationError(
    message,
    400,
    'VALIDATION_ERROR',
    details
  );
};

/**
 * Create a not found error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for not found resources
 */
export const createNotFoundError = (
  message: string = 'Resource not found',
  details?: Record<string, unknown>
): ApplicationError => {
  return new ApplicationError(
    message,
    404,
    'NOT_FOUND',
    details
  );
};

/**
 * Create an unauthorized error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for unauthorized access
 */
export const createUnauthorizedError = (
  message: string = 'Unauthorized',
  details?: Record<string, unknown>
): ApplicationError => {
  return new ApplicationError(
    message,
    401,
    'UNAUTHORIZED',
    details
  );
};

/**
 * Create a forbidden error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for forbidden access
 */
export const createForbiddenError = (
  message: string = 'Forbidden',
  details?: Record<string, unknown>
): ApplicationError => {
  return new ApplicationError(
    message,
    403,
    'FORBIDDEN',
    details
  );
};

/**
 * Create a conflict error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for resource conflicts
 */
export const createConflictError = (
  message: string = 'Resource conflict',
  details?: Record<string, unknown>
): ApplicationError => {
  return new ApplicationError(
    message,
    409,
    'CONFLICT',
    details
  );
};

/**
 * Create a server error
 * @param message Error message
 * @param details Additional details
 * @returns Application error for server errors
 */
export const createServerError = (
  message: string = 'Internal server error',
  details?: Record<string, unknown>
): ApplicationError => {
  return new ApplicationError(
    message,
    500,
    'INTERNAL_SERVER_ERROR',
    details
  );
};
