import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
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

    beforeEach(async () => {
        userService = createMockService<UserService>(['findByUsername', 'findOne']);
        jwtService = createMockService<JwtService>(['sign']);

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
        it('should return access_token and profile info', async () => {
            const user = { username: 'testuser', id: 'uuid-1' };
            const profile = {
                id: 'uuid-1',
                username: 'testuser',
                isSystemAdmin: false,
                permissions: ['READ']
            };

            // Mock getProfile (which is a private method but we can mock finding the user)
            // Actually login calls getProfile which calls userService.findOne
            userService.findOne.mockResolvedValue(UserFactory.create({ id: 'uuid-1', username: 'testuser' }) as any);
            jwtService.sign.mockReturnValue('mock-jwt-token');

            const result = await service.login(user);

            expect(result.access_token).toBe('mock-jwt-token');
            expect(result.user.username).toBe('testuser');
            expect(jwtService.sign).toHaveBeenCalled();
        });
    });
});
