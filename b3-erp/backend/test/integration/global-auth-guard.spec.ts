import { Controller, Get, INestApplication } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
// supertest has no bundled types and @types/supertest is not a dependency;
// require keeps this test dependency-free.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const request = require('supertest');

import { JwtAuthGuard } from '../../src/modules/auth/guards/jwt-auth.guard';
import { JwtStrategy } from '../../src/modules/auth/strategies/jwt.strategy';
import { Public } from '../../src/common/decorators/public.decorator';

/**
 * End-to-end proof that the global JwtAuthGuard enforces default-deny:
 *  - an un-annotated route rejects anonymous callers with 401
 *  - a @Public()-annotated route is reachable without a token
 *
 * This is the safety net for P0-SEC-01 — if someone removes the global guard
 * registration or the @Public plumbing, this test fails.
 */
@Controller('probe')
class ProbeController {
    @Get('protected')
    protected() {
        return { ok: true };
    }

    @Public()
    @Get('open')
    open() {
        return { ok: true };
    }
}

describe('Global JwtAuthGuard (integration)', () => {
    let app: INestApplication;

    beforeAll(async () => {
        process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-for-guard-integration';

        const moduleRef = await Test.createTestingModule({
            imports: [ConfigModule.forRoot({ isGlobal: true }), PassportModule],
            controllers: [ProbeController],
            providers: [JwtStrategy, { provide: APP_GUARD, useClass: JwtAuthGuard }],
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app?.close();
    });

    it('rejects an anonymous request to a non-public route with 401', () => {
        return request(app.getHttpServer()).get('/probe/protected').expect(401);
    });

    it('allows an anonymous request to a @Public() route with 200', () => {
        return request(app.getHttpServer()).get('/probe/open').expect(200, { ok: true });
    });
});
