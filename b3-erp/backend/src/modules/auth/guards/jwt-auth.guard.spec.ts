import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { JwtAuthGuard } from './jwt-auth.guard';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

/**
 * Verifies the global-guard contract: @Public() routes bypass authentication,
 * everything else falls through to Passport's JWT check.
 */
describe('JwtAuthGuard', () => {
    const makeContext = (): ExecutionContext => {
        const handler = () => undefined;
        const klass = class {};
        return {
            getHandler: () => handler,
            getClass: () => klass,
            switchToHttp: () => ({
                getRequest: () => ({ headers: {}, cookies: {} }),
                getResponse: () => ({}),
                getNext: () => undefined,
            }),
        } as unknown as ExecutionContext;
    };

    it('allows a route annotated with @Public() through without a token', () => {
        const reflector = new Reflector();
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
        const guard = new JwtAuthGuard(reflector);

        expect(guard.canActivate(makeContext())).toBe(true);
    });

    it('delegates to Passport (does not auto-allow) for a non-public route', () => {
        const reflector = new Reflector();
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
        const guard = new JwtAuthGuard(reflector);

        // Passport's canActivate returns a Promise, never a bare `true`, so a
        // non-public route must not short-circuit to `true`. Swallow the async
        // rejection (no valid token in the mock request) — we only assert here
        // that authentication was actually attempted rather than bypassed.
        const result = guard.canActivate(makeContext());
        expect(result).not.toBe(true);
        Promise.resolve(result as Promise<boolean>).catch(() => undefined);
    });

    it('reads the IS_PUBLIC_KEY metadata from handler and class', () => {
        const reflector = new Reflector();
        const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
        const guard = new JwtAuthGuard(reflector);
        const ctx = makeContext();

        guard.canActivate(ctx);

        expect(spy).toHaveBeenCalledWith(IS_PUBLIC_KEY, [ctx.getHandler(), ctx.getClass()]);
    });
});
