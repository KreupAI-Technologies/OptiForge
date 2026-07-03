import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../it-admin/services/user.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
    ) { }

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
            access_token: this.jwtService.sign(payload),
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
