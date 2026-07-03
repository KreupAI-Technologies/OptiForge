import {
  Controller,
  Get,
  Put,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PasswordPolicyService } from '../services/password-policy.service';
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
