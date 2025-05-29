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

// Define a type for the Lambda context
interface LambdaContext {
    awsRequestId: string;
    functionName: string;
    [key: string]: unknown;
}

export const handleError = (error: Error, context: unknown) => {
    const errorDetails = formatError(error);
    const typedContext = context as LambdaContext;

    console.error('Error:', {
        ...errorDetails,
        requestId: typedContext.awsRequestId,
        functionName: typedContext.functionName,
    });

    return {
        statusCode: error instanceof ApplicationError ? error.statusCode : 500,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Credentials': true,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...errorDetails.error,
            requestId: typedContext.awsRequestId,
        }),
    };
};

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
