import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UserSessionService } from '../services/user-session.service';

@ApiTags('IT Admin - User Sessions')
@Controller('it-admin/sessions')
export class UserSessionController {
  constructor(private readonly sessionService: UserSessionService) {}

  @Get()
  @ApiOperation({
    summary: 'List all active sessions across all users (admin console)',
  })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'device', required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active sessions with owning-user details',
  })
  async listAll(
    @Query('status') status?: string,
    @Query('device') device?: string,
  ): Promise<any[]> {
    return this.sessionService.listAllActiveSessions({ status, device });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Global session statistics for the admin console' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Aggregate session statistics',
  })
  async stats(): Promise<any> {
    return this.sessionService.getGlobalStatistics();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Session created successfully',
  })
  async create(
    @Body()
    body: {
      userId: string;
      ipAddress: string;
      userAgent: string;
      expiresInMinutes?: number;
    },
  ): Promise<any> {
    return this.sessionService.createSession(
      body.userId,
      body.ipAddress,
      body.userAgent,
      body.expiresInMinutes,
    );
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Get session by token' })
  @ApiParam({ name: 'token', description: 'Session token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session details',
  })
  async findByToken(@Param('token') token: string): Promise<any> {
    return this.sessionService.findByToken(token);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get active sessions for user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of active sessions',
  })
  async getActiveSessions(@Param('userId') userId: string): Promise<any[]> {
    return this.sessionService.getActiveSessions(userId);
  }

  @Patch(':id/activity')
  @ApiOperation({ summary: 'Update session activity' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Activity updated',
  })
  async updateActivity(@Param('id') id: string): Promise<any> {
    await this.sessionService.updateActivity(id);
    return { message: 'Activity updated' };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout session by token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Logged out successfully',
  })
  async logoutByToken(@Body() body: { token: string }): Promise<any> {
    await this.sessionService.logoutByToken(body.token);
    return { message: 'Logged out successfully' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout session' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session logged out successfully',
  })
  async logout(@Param('id') id: string): Promise<any> {
    await this.sessionService.logout(id);
    return { message: 'Session logged out' };
  }

  @Post(':id/terminate')
  @ApiOperation({ summary: 'Terminate session (force logout)' })
  @ApiParam({ name: 'id', description: 'Session ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session terminated successfully',
  })
  async terminate(
    @Param('id') id: string,
    @Body() body: { terminatedBy: string; reason: string },
  ): Promise<any> {
    await this.sessionService.terminateSession(
      id,
      body.terminatedBy,
      body.reason,
    );
    return { message: 'Session terminated' };
  }

  @Post('user/:userId/terminate-all')
  @ApiOperation({ summary: 'Terminate all user sessions' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'All sessions terminated',
  })
  async terminateAllUserSessions(
    @Param('userId') userId: string,
    @Body() body: { terminatedBy: string; reason: string },
  ): Promise<any> {
    const count = await this.sessionService.terminateAllUserSessions(
      userId,
      body.terminatedBy,
      body.reason,
    );
    return { message: `${count} sessions terminated` };
  }

  @Post('cleanup')
  @ApiOperation({ summary: 'Clean up expired sessions' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Expired sessions cleaned',
  })
  async cleanExpiredSessions(): Promise<any> {
    const count = await this.sessionService.cleanExpiredSessions();
    return { message: `${count} expired sessions cleaned` };
  }

  @Get('statistics/:userId?')
  @ApiOperation({ summary: 'Get session statistics' })
  @ApiParam({ name: 'userId', required: false, description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Session statistics',
  })
  async getStatistics(@Param('userId') userId?: string): Promise<any> {
    return this.sessionService.getSessionStatistics(userId);
  }
}
