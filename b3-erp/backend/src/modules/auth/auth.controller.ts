import { Controller, Post, UseGuards, Request, Get, Res, Req } from '@nestjs/common';
import { Request as ExpressRequest, Response } from 'express';

import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_MAX_AGE = 60 * 60 * 1000; // 1 hour
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /** HttpOnly cookie options — the browser never exposes these to JS, which is
     * what makes cookie storage XSS-safe (unlike localStorage). */
    private cookieOptions(maxAge: number) {
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' as const,
            maxAge,
            path: '/',
        };
    }

    private setAuthCookies(res: Response, tokens: { access_token: string; refresh_token: string }) {
        res.cookie(ACCESS_COOKIE, tokens.access_token, this.cookieOptions(ACCESS_MAX_AGE));
        res.cookie(REFRESH_COOKIE, tokens.refresh_token, this.cookieOptions(REFRESH_MAX_AGE));
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ApiOperation({ summary: 'Login with username and password' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Request() req: any, @Res({ passthrough: true }) res: Response) {
        const result = await this.authService.login(req.user);
        this.setAuthCookies(res, result);
        // Return the user profile only. The tokens live in HttpOnly cookies and
        // are intentionally NOT returned in the body — clients must not persist them.
        return { user: result.user };
    }

    @Public()
    @Post('refresh')
    @ApiOperation({ summary: 'Rotate access + refresh tokens using the refresh cookie' })
    @ApiResponse({ status: 200, description: 'Tokens refreshed' })
    @ApiResponse({ status: 401, description: 'Invalid or missing refresh token' })
    async refresh(@Req() req: ExpressRequest, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies?.[REFRESH_COOKIE];
        const result = await this.authService.refreshTokens(refreshToken);
        this.setAuthCookies(res, result);
        return { user: result.user };
    }

    @Public()
    @Post('logout')
    @ApiOperation({ summary: 'Logout and clear session' })
    @ApiResponse({ status: 200, description: 'Logout successful' })
    async logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie(ACCESS_COOKIE, { path: '/' });
        res.clearCookie(REFRESH_COOKIE, { path: '/' });
        return { message: 'Logged out successfully' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved' })
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.id);
    }
}
