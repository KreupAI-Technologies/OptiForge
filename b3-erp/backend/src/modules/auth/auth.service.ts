import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../it-admin/services/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /** Secret used to sign/verify long-lived refresh tokens. Falls back to the
     * access-token secret if a dedicated one is not configured. */
    private get refreshSecret(): string {
        return (
            this.configService.get<string>('JWT_REFRESH_SECRET') ||
            this.configService.get<string>('JWT_SECRET') ||
            ''
        );
    }

    private get refreshExpiresIn(): string {
        return this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    }

    async validateUser(username: string, pass: string): Promise<any> {
        try {
            const user = await this.userService.findByUsername(username);
            if (user && await bcrypt.compare(pass, user.passwordHash)) {
                const { passwordHash, ...result } = user;
                return result;
            }
        } catch (error) {
            // User not found or other error
        }
        return null;
    }

    async login(user: any) {
        const fullUser = await this.getProfile(user.id);
        const payload = {
            username: user.username,
            sub: user.id,
            isSystemAdmin: fullUser.isSystemAdmin,
            permissions: fullUser.permissions
        };

        return {
            ...this.issueTokens(payload),
            user: fullUser,
        };
    }

    /** Sign a short-lived access token and a long-lived refresh token from the
     * same identity payload. The refresh token carries `type: 'refresh'` so it
     * cannot be replayed as an access token. */
    private issueTokens(payload: Record<string, any>) {
        const { type, iat, exp, ...identity } = payload;
        return {
            access_token: this.jwtService.sign(identity),
            refresh_token: this.jwtService.sign(
                { ...identity, type: 'refresh' },
                { secret: this.refreshSecret, expiresIn: this.refreshExpiresIn },
            ),
        };
    }

    /** Verify a refresh token and mint a rotated access/refresh pair. Throws
     * UnauthorizedException on a missing, invalid, expired, or wrong-type token. */
    async refreshTokens(refreshToken?: string) {
        if (!refreshToken) {
            throw new UnauthorizedException('Missing refresh token');
        }

        let decoded: any;
        try {
            decoded = this.jwtService.verify(refreshToken, { secret: this.refreshSecret });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        if (decoded.type !== 'refresh') {
            throw new UnauthorizedException('Provided token is not a refresh token');
        }

        // Re-hydrate current identity so permission changes take effect on refresh.
        const fullUser = await this.getProfile(decoded.sub);
        const payload = {
            username: decoded.username,
            sub: decoded.sub,
            isSystemAdmin: fullUser.isSystemAdmin,
            permissions: fullUser.permissions,
        };

        return {
            ...this.issueTokens(payload),
            user: fullUser,
        };
    }

    async getProfile(userId: string) {
        // Fetch user with full permissions
        const user = await this.userService.findOne(userId);
        const permissions = new Set<string>();
        const roles = user.userRoles?.map(ur => ur.role?.code).filter(Boolean) || [];

        if (user && user.userRoles) {
            user.userRoles.forEach(ur => {
                if (ur.role && ur.role.rolePermissions) {
                    ur.role.rolePermissions.forEach(rp => {
                        if (rp.permission) {
                            permissions.add(rp.permission.code);
                        }
                    });
                }
            });
        }

        const isSystemAdmin = user?.isSystemAdmin || roles.includes('SUPER_ADMIN');

        if (isSystemAdmin) {
            permissions.add('*');
            if (roles.includes('SUPER_ADMIN')) {
                permissions.add('SUPER_ADMIN');
            }
        }

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            userType: user.userType,
            isSystemAdmin: isSystemAdmin,
            roles,
            permissions: Array.from(permissions),
        };
    }
}
