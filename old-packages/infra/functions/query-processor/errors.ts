/**
 * Application Error class for handling standardized errors
 *
 * This provides a consistent error format throughout the application with status codes
 * and optional details for better error reporting.
 */
export class ApplicationError extends Error {
    constructor(
        public message: string,
        public _statusCode: number = 500,
        public _code: string = 'INTERNAL_SERVER_ERROR',
        public _details?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'ApplicationError';
    }

    // Getters to access the prefixed properties
    get statusCode(): number {
        return this._statusCode;
    }

    get code(): string {
        return this._code;
    }

    get details(): Record<string, unknown> | undefined {
        return this._details;
    }
}

/**
 * Format errors to a standardized structure for API responses
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
