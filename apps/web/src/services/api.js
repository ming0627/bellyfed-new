/**
 * API Service for making HTTP requests
 * This service provides methods for making GET, POST, PUT, and DELETE requests
 */

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  static isAuthError(error) {
    return (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    );
  }
}

export class ApiService {
  static getHeaders() {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey.trim(),
    };
  }

  static getBaseUrl() {
    return '/api/proxy';
  }

  static async get(path) {
    const response = await fetch(`${this.getBaseUrl()}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies for server-side authentication
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use null
      }

      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    return response.json();
  }

  static async post(path, data) {
    const response = await fetch(`${this.getBaseUrl()}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Include cookies for server-side authentication
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use null
      }

      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    return response.json();
  }

  static async put(path, data) {
    const response = await fetch(`${this.getBaseUrl()}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include', // Include cookies for server-side authentication
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use null
      }

      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    return response.json();
  }

  static async delete(path) {
    const response = await fetch(`${this.getBaseUrl()}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies for server-side authentication
    });

    if (!response.ok) {
      let errorData = null;
      try {
        errorData = await response.json();
      } catch (e) {
        // If response is not JSON, use null
      }

      const errorMessage =
        errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`;
      throw new ApiError(errorMessage, response.status, errorData);
    }

    return response.json();
  }
}

// Default export for compatibility
export const apiService = ApiService;
export default ApiService;