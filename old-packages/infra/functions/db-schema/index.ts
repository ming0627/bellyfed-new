/**
 * Database Schema Lambda Function
 *
 * This Lambda function creates and updates the database schema by executing SQL scripts.
 * It uses direct PostgreSQL connection instead of the RDS Data API for better performance
 * and compatibility with all PostgreSQL features.
 */
import { APIGatewayProxyResult } from 'aws-lambda';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

// Initialize clients
const secretsClient = new SecretsManagerClient({});

// Constants for retry logic
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY_MS = 5000; // 5 seconds

/**
 * Sleep for a specified number of milliseconds
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get database credentials from Secrets Manager
 * @param secretArn - ARN of the secret containing database credentials
 * @returns Database credentials
 */
interface DatabaseCredentials {
    host: string;
    port: number;
    username: string;
    password: string;
    [key: string]: unknown;
}

async function getDatabaseCredentials(secretArn: string): Promise<DatabaseCredentials> {
    const command = new GetSecretValueCommand({
        SecretId: secretArn,
    });

    const response = await secretsClient.send(command);
    if (!response.SecretString) {
        throw new Error('Secret string is empty');
    }

    return JSON.parse(response.SecretString);
}

/**
 * Create a PostgreSQL client
 * @param credentials - Database credentials
 * @param dbName - Database name
 * @returns PostgreSQL client
 */
async function createPgClient(credentials: DatabaseCredentials, dbName: string): Promise<Client> {
    const client = new Client({
        host: credentials.host,
        port: credentials.port,
        user: credentials.username,
        password: credentials.password,
        database: dbName,
        ssl: {
            rejectUnauthorized: false, // Required for Aurora Serverless v2
        },
        connectionTimeoutMillis: 10000,
    });

    return client;
}

/**
 * Execute a single SQL statement with retry logic
 * @param client - PostgreSQL client
 * @param statement - SQL statement to execute
 * @param statementIndex - Index of the statement for logging
 * @param totalStatements - Total number of statements for logging
 */
async function executeStatement(
    client: Client,
    statement: string,
    statementIndex: number,
    totalStatements: number
): Promise<void> {
    let retries = 0;
    let lastError: Error | unknown = null;

    while (retries < MAX_RETRIES) {
        try {
            console.log(
                `Executing statement ${statementIndex}/${totalStatements} (attempt ${retries + 1}/${MAX_RETRIES})`
            );
            await client.query(statement);
            return; // Success, exit the function
        } catch (error: unknown) {
            lastError = error;

            // Check if this is a connection error that might be due to database resuming
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                (error.code === 'ECONNREFUSED' ||
                    error.code === 'ETIMEDOUT' ||
                    error.code === '57P03')
            ) {
                const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, retries);
                console.log(
                    `Database connection issue. Waiting ${delayMs}ms before retry ${retries + 1}/${MAX_RETRIES}`
                );
                await sleep(delayMs);
                retries++;
            } else {
                // For other errors, log detailed information and rethrow
                console.error(`SQL Error in statement: ${statement}`);
                console.error(`Error details: ${JSON.stringify(error)}`);
                throw error;
            }
        }
    }

    // If we've exhausted all retries
    throw new Error(
        `Failed after ${MAX_RETRIES} attempts. Last error: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`
    );
}

/**
 * Execute SQL statements from a file
 * @param client - PostgreSQL client
 * @param filePath - Path to the SQL file
 */
async function executeSqlFile(client: Client, filePath: string): Promise<void> {
    console.log(`Executing SQL file: ${filePath}`);

    // Read SQL file
    const sql = fs.readFileSync(filePath, 'utf8');

    // Split SQL into individual statements - improved to handle multi-line statements
    const statements: string[] = [];
    let currentStatement = '';

    // Split the SQL file into lines for better processing
    const lines = sql.split('\n');

    for (const line of lines) {
        // Skip empty lines and comments
        if (line.trim() === '' || line.trim().startsWith('--')) {
            continue;
        }

        // Add the line to the current statement
        currentStatement += line + '\n';

        // Check if this line ends a statement
        if (line.trim().endsWith(';')) {
            statements.push(currentStatement.trim());
            currentStatement = '';
        }
    }

    // Add the last statement if it doesn't end with a semicolon
    if (currentStatement.trim() !== '') {
        statements.push(currentStatement.trim());
    }

    console.log(`Found ${statements.length} SQL statements to execute in ${filePath}`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        await executeStatement(client, statement, i + 1, statements.length);
    }

    console.log(`Completed executing SQL file: ${filePath}`);
}

/**
 * Execute all SQL files in the schema directory
 * @param client - PostgreSQL client
 * @returns List of executed files
 */
async function executeSchemaDirectory(client: Client): Promise<string[]> {
    const schemaDir = path.join(__dirname, 'schema');
    console.log(`Looking for schema files in: ${schemaDir}`);

    // Check if schema directory exists
    if (!fs.existsSync(schemaDir)) {
        console.log('Schema directory not found, skipping individual schema files');
        return [];
    }

    // Get all SQL files and sort them
    const files = fs
        .readdirSync(schemaDir)
        .filter((file) => file.endsWith('.sql'))
        .sort()
        .map((file) => path.join(schemaDir, file));

    console.log(`Found ${files.length} schema files to execute`);

    // Execute each file
    const executedFiles: string[] = [];
    for (const file of files) {
        await executeSqlFile(client, file);
        executedFiles.push(path.basename(file));
    }

    return executedFiles;
}

/**
 * Main Lambda handler
 */
interface SchemaEvent {
    migrationName?: string;
    specificFile?: string;
    [key: string]: unknown;
}

export const handler = async (event: SchemaEvent): Promise<APIGatewayProxyResult> => {
    console.log('Starting database schema creation/update');
    let client: Client | null = null;

    try {
        // Get environment variables
        const dbSecretArn = process.env.DB_SECRET_ARN;
        const dbName = process.env.DB_NAME;

        if (!dbSecretArn || !dbName) {
            throw new Error('Missing required environment variables');
        }

        console.log(`Using database: ${dbName}`);

        // Get migration name from event or use default
        const migrationName = event?.migrationName || 'all';
        const specificFile = event?.specificFile || null;
        console.log(`Migration name: ${migrationName}`);
        if (specificFile) {
            console.log(`Specific file requested: ${specificFile}`);
        }

        // Get database credentials
        const credentials = await getDatabaseCredentials(dbSecretArn);

        // Create PostgreSQL client
        client = await createPgClient(credentials, dbName);
        await client.connect();
        console.log('Successfully connected to the database');

        // Track executed files
        const executedFiles: string[] = [];
        const schemaDir = path.join(__dirname, 'schema');

        // Check if schema directory exists
        if (!fs.existsSync(schemaDir)) {
            throw new Error('Schema directory not found');
        }

        // If a specific file is requested, run only that file
        if (specificFile) {
            const filePath = path.join(schemaDir, specificFile);
            if (fs.existsSync(filePath)) {
                await executeSqlFile(client, filePath);
                executedFiles.push(specificFile);
            } else {
                throw new Error(`Requested file not found: ${specificFile}`);
            }
        }
        // Run all schema files
        else if (migrationName === 'all') {
            console.log('Running all schema files in order');
            const schemaFiles = await executeSchemaDirectory(client);
            executedFiles.push(...schemaFiles);
        }
        // Run files related to dishes and rankings
        else if (migrationName === 'dishes' || migrationName === 'rankings') {
            const dishFiles = fs
                .readdirSync(schemaDir)
                .filter((file) => file.includes('dish') || file.includes('ranking'))
                .sort()
                .map((file) => path.join(schemaDir, file));

            for (const file of dishFiles) {
                await executeSqlFile(client, file);
                executedFiles.push(path.basename(file));
            }
        }
        // Run files related to restaurants
        else if (migrationName === 'restaurants') {
            const restaurantFiles = fs
                .readdirSync(schemaDir)
                .filter((file) => file.includes('restaurant'))
                .sort()
                .map((file) => path.join(schemaDir, file));

            for (const file of restaurantFiles) {
                await executeSqlFile(client, file);
                executedFiles.push(path.basename(file));
            }
        }
        // Run files related to users
        else if (migrationName === 'users') {
            const userFiles = fs
                .readdirSync(schemaDir)
                .filter((file) => file.includes('user'))
                .sort()
                .map((file) => path.join(schemaDir, file));

            for (const file of userFiles) {
                await executeSqlFile(client, file);
                executedFiles.push(path.basename(file));
            }
        }
        // Run files by pattern match
        else if (migrationName.startsWith('pattern:')) {
            const pattern = migrationName.replace('pattern:', '');
            console.log(`Running files matching pattern: ${pattern}`);

            const matchingFiles = fs
                .readdirSync(schemaDir)
                .filter((file) => file.includes(pattern))
                .sort()
                .map((file) => path.join(schemaDir, file));

            if (matchingFiles.length === 0) {
                throw new Error(`No files found matching pattern: ${pattern}`);
            }

            for (const file of matchingFiles) {
                await executeSqlFile(client, file);
                executedFiles.push(path.basename(file));
            }
        }

        console.log('Database schema creation/update completed successfully');
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({
                message: 'Schema creation/update completed successfully',
                schemasExecuted: executedFiles,
            }),
        };
    } catch (error: unknown) {
        console.error('Error during schema creation/update:', error);

        // Provide more detailed error information
        let errorMessage = 'Unknown error occurred';
        let errorDetails: Record<string, unknown> = {};

        if (error instanceof Error) {
            errorMessage = error.message;

            // Check for specific error types if error has a code property
            if ('code' in error) {
                const typedError = error as Error & { code: string };

                if (typedError.code === 'ECONNREFUSED' || typedError.code === 'ETIMEDOUT') {
                    errorMessage =
                        'Database connection failed. The database may be resuming from auto-pause state.';
                    errorDetails = {
                        type: 'DATABASE_CONNECTION_ERROR',
                        suggestion: 'Wait for the database to fully resume and try again',
                    };
                } else if (typedError.code === '42P01') {
                    errorMessage = 'Relation does not exist. Check table names in SQL.';
                    errorDetails = {
                        type: 'SQL_ERROR',
                        suggestion: 'Review SQL statements for correct table names',
                    };
                } else if (typedError.code === '42703') {
                    errorMessage = 'Column does not exist. Check column names in SQL.';
                    errorDetails = {
                        type: 'SQL_ERROR',
                        suggestion: 'Review SQL statements for correct column names',
                    };
                }
            }
        }

        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
            },
            body: JSON.stringify({
                message: 'Schema creation/update failed',
                error: errorMessage,
                details: errorDetails,
                stack:
                    process.env.NODE_ENV === 'development' && error instanceof Error
                        ? error.stack
                        : undefined,
            }),
        };
    } finally {
        // Close the database connection
        if (client) {
            try {
                await client.end();
                console.log('Database connection closed');
            } catch (error: unknown) {
                console.error('Error closing database connection:', error);
            }
        }
    }
};
