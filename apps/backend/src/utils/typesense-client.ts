/**
 * Typesense Client Utility
 * 
 * This utility provides a consistent way to access Typesense from the backend services.
 * It handles configuration and client initialization.
 */

import Typesense from 'typesense';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

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
    // For local development, use environment variables if available
    if (process.env.TYPESENSE_HOST && process.env.TYPESENSE_API_KEY) {
      return {
        host: process.env.TYPESENSE_HOST,
        port: parseInt(process.env.TYPESENSE_PORT || '8108'),
        protocol: process.env.TYPESENSE_PROTOCOL || 'http',
        apiKey: process.env.TYPESENSE_API_KEY,
      };
    }

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

// Cache for Typesense client to avoid creating a new client for each request
let typesenseClientCache: Typesense.Client | null = null;

/**
 * Get Typesense client instance
 * @param connectionTimeoutSeconds Optional connection timeout in seconds
 * @returns Typesense.Client instance
 */
export async function getTypesenseClient(connectionTimeoutSeconds = 5): Promise<Typesense.Client> {
  // Return cached client if available
  if (typesenseClientCache) {
    return typesenseClientCache;
  }

  const config = await getTypesenseConfig();

  typesenseClientCache = new Typesense.Client({
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

  return typesenseClientCache;
}

/**
 * Reset the Typesense client cache
 * Useful for testing or when configuration changes
 */
export function resetTypesenseClientCache(): void {
  typesenseClientCache = null;
}

/**
 * Dish document interface
 */
export interface DishDocument {
  id: string;
  name: string;
  description?: string;
  price: number;
  dish_type: string;
  restaurant_id: string;
  restaurant_name: string;
  tags?: string[];
  image_url?: string;
  average_rank: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Search parameters interface
 */
export interface SearchParams {
  q?: string;
  query_by?: string;
  filter_by?: string;
  sort_by?: string;
  per_page?: number;
  page?: number;
}

/**
 * Search dishes in Typesense
 * @param params Search parameters
 * @returns Search results
 */
export async function searchDishes(params: SearchParams): Promise<any> {
  const client = await getTypesenseClient();
  return client.collections('dishes').documents().search(params);
}

/**
 * Get dish by ID from Typesense
 * @param id Dish ID
 * @returns Dish document
 */
export async function getDishById(id: string): Promise<DishDocument> {
  const client = await getTypesenseClient();
  return client.collections('dishes').documents(id).retrieve();
}

/**
 * Get dishes by restaurant ID from Typesense
 * @param restaurantId Restaurant ID
 * @param limit Number of dishes to return
 * @param page Page number
 * @returns Search results
 */
export async function getDishesByRestaurantId(
  restaurantId: string,
  limit = 20,
  page = 1
): Promise<any> {
  const searchParams: SearchParams = {
    q: '*',
    filter_by: `restaurant_id:=${restaurantId} && is_available:=true`,
    sort_by: 'average_rank:desc',
    per_page: limit,
    page,
  };

  return searchDishes(searchParams);
}

/**
 * Get dishes by dish type from Typesense
 * @param dishType Dish type
 * @param limit Number of dishes to return
 * @param page Page number
 * @returns Search results
 */
export async function getDishesByType(
  dishType: string,
  limit = 20,
  page = 1
): Promise<any> {
  const searchParams: SearchParams = {
    q: '*',
    filter_by: `dish_type:=${dishType} && is_available:=true`,
    sort_by: 'average_rank:desc',
    per_page: limit,
    page,
  };

  return searchDishes(searchParams);
}

/**
 * Get dishes by tags from Typesense
 * @param tags Array of tags
 * @param limit Number of dishes to return
 * @param page Page number
 * @returns Search results
 */
export async function getDishesByTags(
  tags: string[],
  limit = 20,
  page = 1
): Promise<any> {
  if (!tags.length) {
    throw new Error('At least one tag is required');
  }

  const tagFilter = tags.map((tag) => `tags:=${tag}`).join(' || ');
  
  const searchParams: SearchParams = {
    q: '*',
    filter_by: `(${tagFilter}) && is_available:=true`,
    sort_by: 'average_rank:desc',
    per_page: limit,
    page,
  };

  return searchDishes(searchParams);
}
