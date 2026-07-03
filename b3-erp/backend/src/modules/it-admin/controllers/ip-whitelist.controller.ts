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
import { IpWhitelistService } from '../services/ip-whitelist.service';
import { IpWhitelistEntry } from '../entities/ip-whitelist-entry.entity';

@ApiTags('IT Admin - IP Whitelist')
@Controller('it-admin/ip-whitelist')
export class IpWhitelistController {
  constructor(private readonly service: IpWhitelistService) {}

  @Get()
  @ApiOperation({ summary: 'List IP whitelist entries' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<IpWhitelistEntry[]> {
    return this.service.findAll({ companyId, category, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get IP whitelist entry by ID' })
  async findOne(@Param('id') id: string): Promise<IpWhitelistEntry> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create IP whitelist entry' })
  async create(
    @Body() data: Partial<IpWhitelistEntry>,
  ): Promise<IpWhitelistEntry> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update IP whitelist entry' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<IpWhitelistEntry>,
  ): Promise<IpWhitelistEntry> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete IP whitelist entry' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
