import { config } from '@/lib/config';

// Base API URL — reads from env variable set in .env.local
const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? config.apiUrl ?? 'http://localhost:3001/api/v1';

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

/** Structured API error with HTTP status code and body message */
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Parse a failed Response into an ApiError.
 * Attempts to read a JSON { message } body first, falls back to statusText.
 */
async function parseError(response: Response): Promise<ApiError> {
    let message = response.statusText || `HTTP ${response.status}`;
    try {
        const body = await response.json();
        if (body?.message) message = Array.isArray(body.message) ? body.message.join('; ') : body.message;
    } catch {
        // keep statusText fallback
    }
    return new ApiError(response.status, message);
}

/** Redirect to login when the server returns 401 */
function handle401(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        window.location.href = '/login';
    }
}

/** Shared fetch options used on every request */
function baseOptions(): RequestInit {
    return {
        credentials: 'include',          // send HttpOnly JWT cookie automatically
        headers: { 'Content-Type': 'application/json' },
    };
}

export class ApiClient {
    private baseUrl: string;

    constructor(baseUrl = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        if (response.status === 401) {
            handle401();
            throw new ApiError(401, 'Unauthorized');
        }
        if (!response.ok) {
            throw await parseError(response);
        }
        return response.json() as Promise<ApiResponse<T>>;
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'GET',
            ...baseOptions(),
        });
        return this.handleResponse<T>(response);
    }

    async post<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            ...baseOptions(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<T>(response);
    }

    async put<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PUT',
            ...baseOptions(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<T>(response);
    }

    async patch<T>(endpoint: string, data: unknown): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'PATCH',
            ...baseOptions(),
            body: JSON.stringify(data),
        });
        return this.handleResponse<T>(response);
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'DELETE',
            ...baseOptions(),
        });
        return this.handleResponse<T>(response);
    }

    /** Generic request method for flexible HTTP calls */
    async request<T>(options: {
        url: string;
        method: string;
        data?: unknown;
        headers?: Record<string, string>;
    }): Promise<ApiResponse<T>> {
        const response = await fetch(`${this.baseUrl}${options.url}`, {
            method: options.method,
            ...baseOptions(),
            body: options.data ? JSON.stringify(options.data) : undefined,
            headers: {
                ...baseOptions().headers,
                ...options.headers,
            },
        });
        return this.handleResponse<T>(response);
    }
}

export const apiClient = new ApiClient();
