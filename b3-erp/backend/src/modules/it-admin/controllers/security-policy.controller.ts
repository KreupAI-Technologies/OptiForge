import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { SecurityPolicyService } from '../services/security-policy.service';
import { SecurityPolicy } from '../entities/security-policy.entity';

@ApiTags('IT Admin - Security Policies')
@Controller('it-admin/security-policies')
export class SecurityPolicyController {
  constructor(private readonly service: SecurityPolicyService) {}

  @Get()
  @ApiOperation({ summary: 'List security policies' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('type') type?: string,
  ): Promise<SecurityPolicy[]> {
    return this.service.findAll({ companyId, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get security policy by ID' })
  async findOne(@Param('id') id: string): Promise<SecurityPolicy> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create security policy' })
  async create(@Body() data: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update security policy' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<SecurityPolicy>,
  ): Promise<SecurityPolicy> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete security policy' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
