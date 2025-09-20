import axios, { AxiosError } from 'axios';

/**
 * Makes a safe HTTP POST request to a service endpoint.
 * If the service URL is not configured or the request fails, returns fallback data.
 * 
 * @param serviceUrl - The service URL from environment variables
 * @param payload - The request payload
 * @param fallback - Fallback data to return on error
 * @param options - Additional axios options (timeout, headers, etc)
 */
export async function safePost<T>(
  serviceUrl: string | undefined,
  payload: any,
  fallback: T,
  options: {
    timeout?: number;
    headers?: Record<string, string>;
    validateStatus?: (status: number) => boolean;
  } = {}
): Promise<{ status: 'success' | 'error'; message?: string; data: T }> {
  // Log the attempted service URL
  console.log('Attempting to call service:', { serviceUrl });

  // If no service URL is configured, return fallback immediately
  if (!serviceUrl) {
    console.warn('Service URL not configured, using fallback data');
    return { status: 'error', message: 'Service URL not configured', data: fallback };
  }

  try {
    const response = await axios.post(serviceUrl, payload, {
      timeout: options.timeout || 5000,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      validateStatus: options.validateStatus || ((status) => status >= 200 && status < 300)
    });

    return { status: 'success', data: response.data as T };
  } catch (err) {
    const axiosError = err as AxiosError;
    let message = 'Unknown network error';

    if (axiosError.code === 'ECONNABORTED') {
      message = 'Python service timeout - the service may still be starting up';
    } else if (axiosError.response) {
      message = `Python service error: ${axiosError.response.status} ${axiosError.response.statusText}`;
      if (axiosError.response.status === 503) {
        message += ' (Service may still be initializing)';
      }
    } else if (axiosError.request) {
      message = 'Python service unavailable - the service may still be starting up or the port configuration may be incorrect';
    } else if (axiosError.message) {
      message = `Python service error: ${axiosError.message}`;
    }

    // Log detailed error for debugging
    console.error('Network request failed:', {
      url: serviceUrl,
      error: {
        code: axiosError.code,
        status: axiosError.response?.status,
        message: axiosError.message
      }
    });

    return { status: 'error', message, data: fallback };
  }
}