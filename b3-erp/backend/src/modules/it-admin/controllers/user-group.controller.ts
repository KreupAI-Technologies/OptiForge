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
import { UserGroupService } from '../services/user-group.service';
import { UserGroup } from '../entities/user-group.entity';

@ApiTags('IT Admin - User Groups')
@Controller('it-admin/user-groups')
export class UserGroupController {
  constructor(private readonly service: UserGroupService) {}

  @Get()
  @ApiOperation({ summary: 'List user groups' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ): Promise<UserGroup[]> {
    return this.service.findAll({ companyId, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user group by ID' })
  async findOne(@Param('id') id: string): Promise<UserGroup> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create user group' })
  async create(@Body() data: Partial<UserGroup>): Promise<UserGroup> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user group' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<UserGroup>,
  ): Promise<UserGroup> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user group' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
