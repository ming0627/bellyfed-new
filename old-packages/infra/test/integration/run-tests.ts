import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface IntegrationTestConfig {
    environment: string;
    region: string;
    apiUrl: string;
    apiKey: string;
}

async function getApiKey(environment: string, region: string): Promise<string> {
    const ssmClient = new SSMClient({ region });
    const parameterName = `/bellyfed/${environment}/gateway/${environment}-bellyfed-api-key`;

    try {
        const command = new GetParameterCommand({
            Name: parameterName,
            WithDecryption: true,
        });
        const response = await ssmClient.send(command);
        return response.Parameter?.Value || '';
    } catch (error: unknown) {
        console.error(`Error retrieving API key from SSM: ${error}`);
        throw error;
    }
}

async function runTests(config: IntegrationTestConfig): Promise<void> {
    // Set environment variables for tests
    process.env.API_KEY = config.apiKey;
    process.env.NEXT_PUBLIC_API_KEY = config.apiKey;
    process.env.API_URL = config.apiUrl;
    process.env.NEXT_PUBLIC_API_URL = config.apiUrl;
    process.env.ENVIRONMENT = config.environment;
    process.env.AWS_REGION = config.region;

    try {
        // Run Jest tests with correct config path
        const { stdout, stderr } = await execAsync(
            'npm test -- --config=test/integration/jest.config.js'
        );
        console.log('Test output:', stdout);
        if (stderr) {
            console.error('Test errors:', stderr);
        }
    } catch (error: unknown) {
        console.error('Error running tests:', error);
        throw error;
    } finally {
        // Clean up environment variables
        delete process.env.API_KEY;
        delete process.env.NEXT_PUBLIC_API_KEY;
        delete process.env.API_URL;
        delete process.env.NEXT_PUBLIC_API_URL;
        delete process.env.ENVIRONMENT;
        delete process.env.AWS_REGION;
    }
}

async function main() {
    try {
        // Get configuration from environment or use defaults
        const config: IntegrationTestConfig = {
            environment: process.env.ENVIRONMENT || 'dev',
            region: process.env.AWS_REGION || 'ap-southeast-1',
            apiUrl:
                process.env.API_URL ||
                'https://go2av5pskg.execute-api.ap-southeast-1.amazonaws.com/v1',
            apiKey: process.env.API_KEY || '',
        };

        // If API key is not provided, fetch it from SSM
        if (!config.apiKey) {
            config.apiKey = await getApiKey(config.environment, config.region);
        }

        console.log(`Running integration tests against ${config.apiUrl}`);
        await runTests(config);
        console.log('Integration tests completed successfully');
    } catch (error: unknown) {
        console.error('Integration tests failed:', error);
        process.exit(1);
    }
}

main();
