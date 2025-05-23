/**
 * OpenAI API configuration
 * This file contains configuration for the OpenAI API
 */

/**
 * OpenAI API configuration
 */
export const OPENAI_CONFIG = {
  /**
   * OpenAI API key
   * This is used for AI-powered features like food query analysis
   */
  API_KEY: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  
  /**
   * Default model to use for OpenAI API calls
   */
  DEFAULT_MODEL: 'gpt-4-turbo',
  
  /**
   * Maximum number of tokens to generate
   */
  MAX_TOKENS: 1000,
  
  /**
   * Temperature for OpenAI API calls
   * Higher values mean more random completions
   */
  TEMPERATURE: 0.7,
};

/**
 * Get the OpenAI API key
 * @returns The OpenAI API key
 */
export function getOpenAIApiKey(): string {
  return OPENAI_CONFIG.API_KEY;
}

/**
 * Check if the OpenAI API key is valid
 * @returns True if the API key is valid, false otherwise
 */
export function hasValidOpenAIApiKey(): boolean {
  return !!OPENAI_CONFIG.API_KEY && OPENAI_CONFIG.API_KEY.length > 0;
}

/**
 * Get the default OpenAI model
 * @returns The default OpenAI model
 */
export function getDefaultOpenAIModel(): string {
  return OPENAI_CONFIG.DEFAULT_MODEL;
}
