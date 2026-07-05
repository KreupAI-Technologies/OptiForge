import { SetMetadata } from '@nestjs/common';

/**
 * Metadata key used by the global JwtAuthGuard to detect routes that should
 * bypass authentication.
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or an entire controller) as publicly accessible, bypassing the
 * global JWT authentication guard.
 *
 * Use sparingly — the platform is default-deny. Only auth entry points
 * (login/logout), health checks, and other genuinely anonymous endpoints
 * should be annotated.
 *
 * @example
 *   @Public()
 *   @Post('login')
 *   login() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
