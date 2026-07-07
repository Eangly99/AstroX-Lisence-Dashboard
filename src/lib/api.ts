import { getSession } from 'next-auth/react';

const API_BASE_URL = typeof window === 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : '';

async function getAuthToken() {
  if (typeof window === 'undefined') {
    try {
      const { auth } = await import('./auth');
      const session = await auth();
      return session?.apiToken || null;
    } catch {
      return null;
    }
  } else {
    try {
      const session = await getSession();
      return session?.apiToken || null;
    } catch {
      return null;
    }
  }
}

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 300;
const TIMEOUT_MS = 10000;

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (typeof window === 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is required for server-side fetches but is not set.');
  }
  const token = await getAuthToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body !== undefined && options.body !== null && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  let attempts = 0;

  while (true) {
    attempts++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    let abortListener: (() => void) | null = null;
    if (options.signal) {
      if (options.signal.aborted) {
        clearTimeout(timeoutId);
        throw options.signal.reason || new Error('Request aborted');
      }
      abortListener = () => controller.abort();
      options.signal.addEventListener('abort', abortListener);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        const isTransientStatus = [502, 503, 504].includes(response.status);
        if (isTransientStatus && attempts <= MAX_RETRIES) {
          const delay = INITIAL_DELAY_MS * Math.pow(2, attempts - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        let errorMsg = 'An error occurred';
        try {
          const errorData = await response.json();
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch {
          errorMsg = response.statusText || errorMsg;
        }
        throw new Error(errorMsg);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (err: any) {
      const isTimeout = err.name === 'AbortError' && (!options.signal || !options.signal.aborted);
      const isUserAborted = options.signal?.aborted;

      if (isUserAborted) {
        throw options.signal.reason || new Error('Request aborted');
      }

      const isNetworkError =
        err.name === 'TypeError' ||
        err.message?.includes('fetch failed') ||
        err.message?.includes('network') ||
        err.message?.includes('Failed to fetch');

      const shouldRetry = (isTimeout || isNetworkError) && attempts <= MAX_RETRIES;

      if (shouldRetry) {
        const delay = INITIAL_DELAY_MS * Math.pow(2, attempts - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      if (isTimeout) {
        throw new Error(`Request timed out after ${TIMEOUT_MS}ms`);
      }
      if (isNetworkError) {
        throw new Error('Network connection failed. Please check your internet connection or server status.');
      }
      throw err;
    } finally {
      clearTimeout(timeoutId);
      if (options.signal && abortListener) {
        options.signal.removeEventListener('abort', abortListener);
      }
    }
  }
}
export default apiFetch;
