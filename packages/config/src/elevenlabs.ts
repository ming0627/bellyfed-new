/**
 * ElevenLabs API configuration
 * This file contains configuration for the ElevenLabs API
 */

/**
 * ElevenLabs API configuration
 */
export const ELEVENLABS_CONFIG = {
  /**
   * ElevenLabs API key
   * This is used for text-to-speech functionality
   */
  API_KEY:
    process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ||
    'sk_e5dec60fb3310061bd55826a6d9d94a6e849c008f83fa1c4',
};

/**
 * Get the ElevenLabs API key
 * @returns The ElevenLabs API key
 */
export function getElevenLabsApiKey(): string {
  return ELEVENLABS_CONFIG.API_KEY;
}

/**
 * Check if the ElevenLabs API key is valid
 * @returns True if the API key is valid, false otherwise
 */
export function hasValidElevenLabsApiKey(): boolean {
  return !!ELEVENLABS_CONFIG.API_KEY && ELEVENLABS_CONFIG.API_KEY.length > 0;
}
