// Shared TypesenseClient utility for Lambda functions
// Provides a consistent way to access Typesense from Lambda functions

import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';
import Typesense from 'typesense';

// Initialize AWS clients
const ssmClient = new SSMClient({});

// Environment variables
const ENVIRONMENT = process.env.ENVIRONMENT || 'dev';

/**
 * TypesenseConfiguration interface
 */
export interface TypesenseConfiguration {
    host: string;
    port: number;
    protocol: string;
    apiKey: string;
}

/**
 * Get Typesense configuration from SSM Parameter Store
 * @returns TypesenseConfiguration object
 */
export async function getTypesenseConfig(): Promise<TypesenseConfiguration> {
    try {
        // Get Typesense host
        const hostParam = await ssmClient.send(
            new GetParameterCommand({
                Name: `/bellyfed/${ENVIRONMENT}/typesense/client/host`,
            })
        );

        // Get Typesense port
        const portParam = await ssmClient.send(
            new GetParameterCommand({
                Name: `/bellyfed/${ENVIRONMENT}/typesense/client/port`,
            })
        );

        // Get Typesense protocol
        const protocolParam = await ssmClient.send(
            new GetParameterCommand({
                Name: `/bellyfed/${ENVIRONMENT}/typesense/client/protocol`,
            })
        );

        // Get Typesense API key
        const apiKeyParam = await ssmClient.send(
            new GetParameterCommand({
                Name: `/bellyfed/${ENVIRONMENT}/typesense/client/api-key`,
            })
        );

        return {
            host: hostParam.Parameter?.Value || 'localhost',
            port: parseInt(portParam.Parameter?.Value || '8108'),
            protocol: protocolParam.Parameter?.Value || 'http',
            apiKey: apiKeyParam.Parameter?.Value || 'xyz',
        };
    } catch (error: unknown) {
        console.error('Error getting Typesense configuration:', error);
        throw error;
    }
}

/**
 * Get Typesense client instance
 * @param connectionTimeoutSeconds Optional connection timeout in seconds
 * @returns Typesense.Client instance
 */
export async function getTypesenseClient(connectionTimeoutSeconds = 5): Promise<any> {
    const config = await getTypesenseConfig();

    return new Typesense.Client({
        nodes: [
            {
                host: config.host,
                port: config.port,
                protocol: config.protocol,
            },
        ],
        apiKey: config.apiKey,
        connectionTimeoutSeconds,
    });
}
