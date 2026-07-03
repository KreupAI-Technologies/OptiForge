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
import { AccessPolicyService } from '../services/access-policy.service';
import { AccessPolicyDef } from '../entities/access-policy.entity';

@ApiTags('IT Admin - Access Policies')
@Controller('it-admin/access-policies')
export class AccessPolicyController {
  constructor(private readonly service: AccessPolicyService) {}

  @Get()
  @ApiOperation({ summary: 'List access policies' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'type', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('type') type?: string,
  ): Promise<AccessPolicyDef[]> {
    return this.service.findAll({ companyId, type });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get access policy by ID' })
  async findOne(@Param('id') id: string): Promise<AccessPolicyDef> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create access policy' })
  async create(
    @Body() data: Partial<AccessPolicyDef>,
  ): Promise<AccessPolicyDef> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update access policy' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<AccessPolicyDef>,
  ): Promise<AccessPolicyDef> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete access policy' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
