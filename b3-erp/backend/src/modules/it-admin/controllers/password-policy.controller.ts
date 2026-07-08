import {
  Controller,
  Get,
  Put,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import {
  PasswordPolicyService,
  UserPasswordStatus,
} from '../services/password-policy.service';
import { PasswordPolicy } from '../entities/password-policy.entity';

@ApiTags('IT Admin - Password Policy')
@Controller('it-admin/password-policy')
export class PasswordPolicyController {
  constructor(private readonly service: PasswordPolicyService) {}

  @Get()
  @ApiOperation({ summary: 'Get password policy for company' })
  @ApiQuery({ name: 'companyId', required: false })
  async get(@Query('companyId') companyId?: string): Promise<PasswordPolicy> {
    return this.service.get(companyId);
  }

  @Get('user-status')
  @ApiOperation({ summary: 'Per-user password status (derived from users)' })
  @ApiQuery({ name: 'companyId', required: false })
  async getUserStatuses(
    @Query('companyId') companyId?: string,
  ): Promise<UserPasswordStatus[]> {
    return this.service.getUserPasswordStatuses(companyId);
  }

  @Put()
  @ApiOperation({ summary: 'Upsert password policy for company' })
  @ApiQuery({ name: 'companyId', required: false })
  async upsert(
    @Body() data: Partial<PasswordPolicy>,
    @Query('companyId') companyId?: string,
  ): Promise<PasswordPolicy> {
    return this.service.upsert(data, companyId);
  }
}
