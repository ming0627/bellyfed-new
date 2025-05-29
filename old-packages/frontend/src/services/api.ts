export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static isAuthError(error: unknown): error is ApiError {
    return (
      error instanceof ApiError &&
      (error.status === 401 || error.status === 403)
    );
  }
}

export class ApiService {
  private static getHeaders(): Record<string, string> {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY || '';

    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey.trim(),
    };
  }

  private static getBaseUrl(): string {
    return '/api/proxy';
  }

  static async get<T>(path: string): Promise<T> {
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

  static async post<T>(path: string, data?: any): Promise<T> {
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

  static async put<T>(path: string, data?: any): Promise<T> {
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

  static async delete<T>(path: string): Promise<T> {
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
