import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

/**
 * Stateless CSRF defence for cookie-based auth.
 *
 * Because auth now rides on an HttpOnly cookie, a malicious site could try to
 * make the browser send that cookie on a forged state-changing request. Our
 * layered defence:
 *   1. Cookies are `SameSite=Lax` — the browser won't attach them to most
 *      cross-site sub-requests. (primary)
 *   2. CORS only echoes credentials for the configured frontend origin.
 *   3. This guard — for mutating methods, if the browser sent an `Origin`
 *      (or `Referer`) header, it MUST match the allowlist. (defence-in-depth)
 *
 * Safe methods (GET/HEAD/OPTIONS) are never blocked. Requests with no Origin
 * and no Referer (server-to-server / non-browser API clients, which are not
 * subject to CSRF) are allowed through.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
    private readonly logger = new Logger(CsrfGuard.name);
    private readonly allowedOrigins: string[];

    constructor(private readonly configService: ConfigService) {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const extra = (this.configService.get<string>('CSRF_ALLOWED_ORIGINS') || '')
            .split(',')
            .map((o) => o.trim())
            .filter(Boolean);
        const isProd = this.configService.get<string>('NODE_ENV') === 'production';
        this.allowedOrigins = Array.from(
            new Set([frontendUrl, ...extra, ...(isProd ? [] : ['http://localhost:3000'])]),
        );
    }

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>();
        const method = (req.method || 'GET').toUpperCase();

        // Safe, non-mutating methods can never perform a CSRF-relevant action.
        if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
            return true;
        }

        const origin = req.headers.origin || this.originFromReferer(req.headers.referer);

        // No browser origin → not a browser-driven request (e.g. curl, service
        // integration). Such clients aren't subject to CSRF; allow them.
        if (!origin) {
            return true;
        }

        if (this.allowedOrigins.includes(origin)) {
            return true;
        }

        this.logger.warn(`Blocked cross-origin ${method} from "${origin}" (CSRF guard)`);
        throw new ForbiddenException('Cross-origin request blocked');
    }

    private originFromReferer(referer?: string): string | undefined {
        if (!referer) return undefined;
        try {
            const u = new URL(referer);
            return `${u.protocol}//${u.host}`;
        } catch {
            return undefined;
        }
    }
}
