import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../src/modules/auth/auth.service';
import { UserService } from '../../src/modules/it-admin/services/user.service';
import { UserFactory } from '../factories/user.factory';
import { createMockService } from '../utils/test-setup';

jest.mock('bcryptjs');

describe('AuthService', () => {
    let service: AuthService;
    let userService: jest.Mocked<UserService>;
    let jwtService: jest.Mocked<JwtService>;
    let configService: jest.Mocked<ConfigService>;

    beforeEach(async () => {
        userService = createMockService<UserService>(['findByUsername', 'findOne']);
        jwtService = createMockService<JwtService>(['sign', 'verify']);
        configService = createMockService<ConfigService>(['get']);
        // Default: no dedicated refresh secret configured → falls back to JWT_SECRET.
        configService.get.mockImplementation((key: string, def?: any) => {
            if (key === 'JWT_SECRET') return 'test-secret';
            if (key === 'JWT_REFRESH_EXPIRES_IN') return def ?? '7d';
            return def;
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: userService,
                },
                {
                    provide: JwtService,
                    useValue: jwtService,
                },
                {
                    provide: ConfigService,
                    useValue: configService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('validateUser', () => {
        it('should return user info without passwordHash if validation successful', async () => {
            const user = UserFactory.create({ passwordHash: 'hashedPassword' });
            userService.findByUsername.mockResolvedValue(user as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser(user.username, 'password123');

            expect(result).not.toHaveProperty('passwordHash');
            expect(result.username).toBe(user.username);
            expect(userService.findByUsername).toHaveBeenCalledWith(user.username);
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
        });

        it('should return null if password does not match', async () => {
            const user = UserFactory.create({ passwordHash: 'hashedPassword' });
            userService.findByUsername.mockResolvedValue(user as any);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser(user.username, 'wrongPassword');

            expect(result).toBeNull();
        });

        it('should return null if user not found', async () => {
            userService.findByUsername.mockRejectedValue(new NotFoundException('User not found'));

            const result = await service.validateUser('nonexistent', 'anyPassword');

            expect(result).toBeNull();
        });
    });

    describe('getProfile', () => {
        it('should correctly map user roles and permissions', async () => {
            const mockUser = UserFactory.create({
                isSystemAdmin: false,
            });
            // Mock user roles and permissions
            (mockUser as any).userRoles = [
                {
                    role: {
                        code: 'INVENTORY_MANAGER',
                        rolePermissions: [
                            { permission: { code: 'STOCK_CREATE' } },
                            { permission: { code: 'STOCK_DELETE' } },
                        ],
                    },
                },
            ];

            userService.findOne.mockResolvedValue(mockUser as any);

            const profile = await service.getProfile(mockUser.id);

            expect(profile.username).toBe(mockUser.username);
            expect(profile.roles).toContain('INVENTORY_MANAGER');
            expect(profile.permissions).toContain('STOCK_CREATE');
            expect(profile.permissions).toContain('STOCK_DELETE');
            expect(profile.isSystemAdmin).toBe(false);
        });

        it('should grant all permissions (*) to a system admin', async () => {
            const mockUser = UserFactory.create({ isSystemAdmin: true });
            userService.findOne.mockResolvedValue(mockUser as any);

            const profile = await service.getProfile(mockUser.id);

            expect(profile.permissions).toContain('*');
            expect(profile.isSystemAdmin).toBe(true);
        });

        it('should grant SUPER_ADMIN permission to a user with SUPER_ADMIN role', async () => {
            const mockUser = UserFactory.create({ isSystemAdmin: false });
            (mockUser as any).userRoles = [
                {
                    role: {
                        code: 'SUPER_ADMIN',
                        rolePermissions: [],
                    },
                },
            ];
            userService.findOne.mockResolvedValue(mockUser as any);

            const profile = await service.getProfile(mockUser.id);

            expect(profile.roles).toContain('SUPER_ADMIN');
            expect(profile.permissions).toContain('*');
            expect(profile.permissions).toContain('SUPER_ADMIN');
        });
    });

    describe('login', () => {
        it('should return access_token, refresh_token and profile info', async () => {
            const user = { username: 'testuser', id: 'uuid-1' };

            // login calls getProfile which calls userService.findOne
            userService.findOne.mockResolvedValue(UserFactory.create({ id: 'uuid-1', username: 'testuser' }) as any);
            jwtService.sign.mockReturnValue('mock-jwt-token');

            const result = await service.login(user);

            expect(result.access_token).toBe('mock-jwt-token');
            expect(result.refresh_token).toBe('mock-jwt-token');
            expect(result.user.username).toBe('testuser');
            // signed twice: once for access, once for refresh
            expect(jwtService.sign).toHaveBeenCalledTimes(2);
        });
    });

    describe('refreshTokens', () => {
        it('should reject a missing refresh token', async () => {
            await expect(service.refreshTokens(undefined)).rejects.toThrow(UnauthorizedException);
        });

        it('should reject an invalid/expired refresh token', async () => {
            jwtService.verify.mockImplementation(() => {
                throw new Error('jwt expired');
            });

            await expect(service.refreshTokens('bad-token')).rejects.toThrow(UnauthorizedException);
        });

        it('should reject a token that is not of type refresh', async () => {
            jwtService.verify.mockReturnValue({ sub: 'uuid-1', username: 'testuser' } as any); // no type: 'refresh'

            await expect(service.refreshTokens('access-token-as-refresh')).rejects.toThrow(UnauthorizedException);
        });

        it('should mint a rotated pair for a valid refresh token', async () => {
            jwtService.verify.mockReturnValue({ sub: 'uuid-1', username: 'testuser', type: 'refresh' } as any);
            userService.findOne.mockResolvedValue(UserFactory.create({ id: 'uuid-1', username: 'testuser' }) as any);
            jwtService.sign.mockReturnValue('rotated-token');

            const result = await service.refreshTokens('valid-refresh');

            expect(result.access_token).toBe('rotated-token');
            expect(result.refresh_token).toBe('rotated-token');
            expect(result.user.username).toBe('testuser');
        });
    });
});
