import apiClient from '@/lib/api-client';

/**
 * Auth Service
 * Wraps the NestJS domain-backend `/auth` routes. Uses the shared api-client
 * (axios with `withCredentials`), so the HttpOnly access-token cookie is sent
 * automatically and expired tokens are transparently refreshed.
 */

/** Shape returned by `GET /auth/profile` (see AuthService.getProfile). */
export interface AuthProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  userType: string;
  isSystemAdmin: boolean;
  roles: string[];
  permissions: string[];
}

class AuthService {
  private baseUrl = '/auth';

  /** Fetch the current authenticated user's profile. */
  async getProfile(): Promise<AuthProfile> {
    const { data } = await apiClient.get<AuthProfile>(`${this.baseUrl}/profile`);
    return data;
  }
}

export const authService = new AuthService();
export default authService;
