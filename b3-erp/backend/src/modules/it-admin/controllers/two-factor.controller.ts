import { Controller, Get, Put, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  TwoFactorService,
  TwoFactorEnrollmentStatus,
} from '../services/two-factor.service';
import { TwoFactorSetting } from '../entities/two-factor-setting.entity';
import { UpdateTwoFactorSettingDto } from '../dto/update-two-factor-setting.dto';

@ApiTags('IT Admin - Two-Factor Auth')
@Controller('it-admin/two-factor')
export class TwoFactorController {
  constructor(private readonly service: TwoFactorService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get 2FA org settings for company' })
  @ApiQuery({ name: 'companyId', required: false })
  async getSettings(
    @Query('companyId') companyId?: string,
  ): Promise<TwoFactorSetting> {
    return this.service.getSettings(companyId);
  }

  @Put('settings')
  @ApiOperation({ summary: 'Upsert 2FA org settings for company' })
  @ApiQuery({ name: 'companyId', required: false })
  async saveSettings(
    @Body() data: UpdateTwoFactorSettingDto,
    @Query('companyId') companyId?: string,
  ): Promise<TwoFactorSetting> {
    return this.service.saveSettings(data, companyId);
  }

  @Get('enrollments')
  @ApiOperation({ summary: 'Per-user 2FA enrollment statuses' })
  @ApiQuery({ name: 'companyId', required: false })
  async listEnrollments(
    @Query('companyId') companyId?: string,
  ): Promise<TwoFactorEnrollmentStatus[]> {
    return this.service.listEnrollments(companyId);
  }

  @Post('enrollments/:userId/reminder')
  @ApiOperation({ summary: 'Send (record) a 2FA enrollment reminder' })
  @ApiQuery({ name: 'companyId', required: false })
  async sendReminder(
    @Param('userId') userId: string,
    @Query('companyId') companyId?: string,
  ): Promise<{ message: string; sentAt: string }> {
    return this.service.sendReminder(userId, companyId);
  }

  @Post('enrollments/:userId/reset')
  @ApiOperation({ summary: "Reset (clear) a user's 2FA enrollment" })
  @ApiQuery({ name: 'companyId', required: false })
  async resetEnrollment(
    @Param('userId') userId: string,
    @Query('companyId') companyId?: string,
  ): Promise<TwoFactorEnrollmentStatus> {
    return this.service.resetEnrollment(userId, companyId);
  }

  @Post('enrollments/:userId/backup-codes')
  @ApiOperation({ summary: 'Generate new backup codes for a user' })
  @ApiQuery({ name: 'companyId', required: false })
  async generateBackupCodes(
    @Param('userId') userId: string,
    @Body() body?: { count?: number },
    @Query('companyId') companyId?: string,
  ): Promise<{ codes: string[]; generatedAt: string }> {
    return this.service.generateBackupCodes(userId, companyId, body?.count);
  }
}
