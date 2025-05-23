import { useState, useCallback } from 'react';
import { ApiService, ApiError } from '@bellyfed/services';

/**
 * Interface for API request options
 */
export interface ApiRequestOptions {
  /**
   * Whether to show loading state
   */
  showLoading?: boolean;

  /**
   * Custom error handler
   */
  onError?: (error: ApiError) => void;

  /**
   * Custom success handler
   */
  onSuccess?: <T>(data: T) => void;
}

/**
 * Interface for API request state
 */
export interface ApiRequestState {
  /**
   * Whether the request is loading
   */
  isLoading: boolean;

  /**
   * The error that occurred during the request, if any
   */
  error: ApiError | null;

  /**
   * Whether the request was successful
   */
  isSuccess: boolean;
}

/**
 * Interface for API request methods
 */
export interface ApiRequestMethods {
  /**
   * Make a GET request
   * @param path - The API path
   * @param options - Request options
   * @returns A promise that resolves to the response data
   */
  get: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;

  /**
   * Make a POST request
   * @param path - The API path
   * @param data - The request data
   * @param options - Request options
   * @returns A promise that resolves to the response data
   */
  post: <T>(path: string, data?: any, options?: ApiRequestOptions) => Promise<T>;

  /**
   * Make a PUT request
   * @param path - The API path
   * @param data - The request data
   * @param options - Request options
   * @returns A promise that resolves to the response data
   */
  put: <T>(path: string, data?: any, options?: ApiRequestOptions) => Promise<T>;

  /**
   * Make a DELETE request
   * @param path - The API path
   * @param options - Request options
   * @returns A promise that resolves to the response data
   */
  delete: <T>(path: string, options?: ApiRequestOptions) => Promise<T>;

  /**
   * Reset the request state
   */
  reset: () => void;
}

/**
 * Hook for making API requests with state management
 *
 * @returns API request state and methods
 */
export function useApi(): ApiRequestState & ApiRequestMethods {
  const [state, setState] = useState<ApiRequestState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  /**
   * Reset the request state
   */
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      isSuccess: false,
    });
  }, []);

  /**
   * Make a GET request
   */
  const get = useCallback(async <T>(
    path: string,
    options?: ApiRequestOptions
  ): Promise<T> => {
    const { showLoading = true, onError, onSuccess } = options || {};

    if (showLoading) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const data = await ApiService.get<T>(path);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isSuccess: true,
      }));

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      const apiError = error instanceof ApiError
        ? error
        : new ApiError(
            error instanceof Error ? error.message : 'Unknown error',
            500,
            null
          );

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError,
        isSuccess: false,
      }));

      if (onError) {
        onError(apiError);
      }

      throw apiError;
    }
  }, []);

  /**
   * Make a POST request
   */
  const post = useCallback(async <T>(
    path: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> => {
    const { showLoading = true, onError, onSuccess } = options || {};

    if (showLoading) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const responseData = await ApiService.post<T>(path, data);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isSuccess: true,
      }));

      if (onSuccess) {
        onSuccess(responseData);
      }

      return responseData;
    } catch (error) {
      const apiError = error instanceof ApiError
        ? error
        : new ApiError(
            error instanceof Error ? error.message : 'Unknown error',
            500,
            null
          );

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError,
        isSuccess: false,
      }));

      if (onError) {
        onError(apiError);
      }

      throw apiError;
    }
  }, []);

  /**
   * Make a PUT request
   */
  const put = useCallback(async <T>(
    path: string,
    data?: any,
    options?: ApiRequestOptions
  ): Promise<T> => {
    const { showLoading = true, onError, onSuccess } = options || {};

    if (showLoading) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const responseData = await ApiService.put<T>(path, data);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isSuccess: true,
      }));

      if (onSuccess) {
        onSuccess(responseData);
      }

      return responseData;
    } catch (error) {
      const apiError = error instanceof ApiError
        ? error
        : new ApiError(
            error instanceof Error ? error.message : 'Unknown error',
            500,
            null
          );

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError,
        isSuccess: false,
      }));

      if (onError) {
        onError(apiError);
      }

      throw apiError;
    }
  }, []);

  /**
   * Make a DELETE request
   */
  const deleteRequest = useCallback(async <T>(
    path: string,
    options?: ApiRequestOptions
  ): Promise<T> => {
    const { showLoading = true, onError, onSuccess } = options || {};

    if (showLoading) {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
    }

    try {
      const data = await ApiService.delete<T>(path);

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        isSuccess: true,
      }));

      if (onSuccess) {
        onSuccess(data);
      }

      return data;
    } catch (error) {
      const apiError = error instanceof ApiError
        ? error
        : new ApiError(
            error instanceof Error ? error.message : 'Unknown error',
            500,
            null
          );

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: apiError,
        isSuccess: false,
      }));

      if (onError) {
        onError(apiError);
      }

      throw apiError;
    }
  }, []);

  return {
    ...state,
    get,
    post,
    put,
    delete: deleteRequest,
    reset,
  };
}
