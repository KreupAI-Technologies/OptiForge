import { Controller, Get, Put, Post, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EmailSettingsService } from '../services/email-settings.service';

@ApiTags('IT Admin - Email Settings')
@Controller('it-admin/email')
export class EmailSettingsController {
  constructor(private readonly service: EmailSettingsService) {}

  @Get('settings')
  @ApiOperation({ summary: 'Get email settings (from SystemConfig key/value)' })
  async getSettings() {
    return this.service.getSettings();
  }

  @Put('settings')
  @ApiOperation({ summary: 'Save email settings (upserts SystemConfig key/value)' })
  async saveSettings(
    @Body() body: { value: any; updatedBy?: string },
  ) {
    return this.service.saveSettings(body?.value, body?.updatedBy);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Email delivery stats (computed from notifications)' })
  @ApiQuery({ name: 'companyId', required: false })
  async stats(@Query('companyId') companyId?: string) {
    return this.service.stats(companyId);
  }

  @Post('test')
  @ApiOperation({ summary: 'Record a test-email attempt (no real SMTP send)' })
  async test(
    @Body()
    body: { toAddress?: string; smtpHost?: string; companyId?: string },
  ) {
    return this.service.sendTest(body ?? {});
  }
}
