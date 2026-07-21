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
import { LicenseUserService } from '../services/license-user.service';
import { LicenseUser } from '../entities/license-user.entity';

@ApiTags('IT Admin - License Users')
@Controller('it-admin/license-users')
export class LicenseUserController {
  constructor(private readonly service: LicenseUserService) {}

  @Get()
  @ApiOperation({ summary: 'List license users' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'licenseType', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('licenseType') licenseType?: string,
  ): Promise<LicenseUser[]> {
    return this.service.findAll({ companyId, status, licenseType });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get license user by ID' })
  async findOne(@Param('id') id: string): Promise<LicenseUser> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create license user' })
  async create(@Body() data: Partial<LicenseUser>): Promise<LicenseUser> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update license user' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<LicenseUser>,
  ): Promise<LicenseUser> {
    return this.service.update(id, data);
  }

  @Post(':id/renew')
  @ApiOperation({ summary: 'Renew a user license (extend validity)' })
  async renew(
    @Param('id') id: string,
    @Body() body?: { months?: number },
  ): Promise<LicenseUser> {
    return this.service.renew(id, body?.months ?? 12);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete license user' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
