import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CsrfGuard } from './csrf.guard';

describe('CsrfGuard', () => {
    const makeConfig = (overrides: Record<string, string> = {}) =>
        ({
            get: (key: string) =>
                ({ FRONTEND_URL: 'https://app.example.com', NODE_ENV: 'production', ...overrides }[key]),
        }) as unknown as ConfigService;

    const ctx = (method: string, headers: Record<string, string> = {}): ExecutionContext =>
        ({
            switchToHttp: () => ({ getRequest: () => ({ method, headers }) }),
        }) as unknown as ExecutionContext;

    const guard = new CsrfGuard(makeConfig());

    it('allows safe methods regardless of origin', () => {
        expect(guard.canActivate(ctx('GET', { origin: 'https://evil.com' }))).toBe(true);
        expect(guard.canActivate(ctx('HEAD', { origin: 'https://evil.com' }))).toBe(true);
        expect(guard.canActivate(ctx('OPTIONS', {}))).toBe(true);
    });

    it('allows mutating requests with no Origin/Referer (non-browser clients)', () => {
        expect(guard.canActivate(ctx('POST', {}))).toBe(true);
        expect(guard.canActivate(ctx('DELETE', {}))).toBe(true);
    });

    it('allows mutating requests from an allowed Origin', () => {
        expect(guard.canActivate(ctx('POST', { origin: 'https://app.example.com' }))).toBe(true);
    });

    it('blocks mutating requests from a foreign Origin', () => {
        expect(() => guard.canActivate(ctx('POST', { origin: 'https://evil.com' }))).toThrow(ForbiddenException);
    });

    it('falls back to the Referer host when Origin is absent', () => {
        expect(guard.canActivate(ctx('PUT', { referer: 'https://app.example.com/some/page' }))).toBe(true);
        expect(() => guard.canActivate(ctx('PUT', { referer: 'https://evil.com/x' }))).toThrow(ForbiddenException);
    });

    it('permits localhost in non-production', () => {
        const devGuard = new CsrfGuard(makeConfig({ NODE_ENV: 'development' }));
        expect(devGuard.canActivate(ctx('POST', { origin: 'http://localhost:3000' }))).toBe(true);
    });
});
