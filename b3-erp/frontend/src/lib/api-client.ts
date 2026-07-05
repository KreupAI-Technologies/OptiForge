import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Auth is carried by an HttpOnly `access_token` cookie set by the backend on
  // login. `withCredentials` makes the browser attach that cookie to every
  // request. We deliberately do NOT read a token from localStorage — an
  // HttpOnly cookie is not reachable by JS, which is what makes it XSS-safe.
  withCredentials: true,
});

// Response interceptor: transparently refresh an expired access token once.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 → the access-token cookie is missing/expired. Hit /auth/refresh, which
    // validates the refresh cookie and re-sets rotated auth cookies, then retry.
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        // Cookies are now refreshed; replay the original request (cookie re-sent).
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed → session is truly over. Clear cached profile and bounce
        // to login. No tokens to clear — they live only in HttpOnly cookies.
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
