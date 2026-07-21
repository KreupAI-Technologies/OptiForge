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
import { CleanupTaskService } from '../services/cleanup-task.service';
import { CleanupTask } from '../entities/cleanup-task.entity';

@ApiTags('IT Admin - Database Cleanup')
@Controller('it-admin/cleanup-tasks')
export class CleanupTaskController {
  constructor(private readonly service: CleanupTaskService) {}

  @Get()
  @ApiOperation({ summary: 'List cleanup tasks (seeds defaults on first read)' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'category', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('category') category?: string,
  ): Promise<CleanupTask[]> {
    return this.service.findAll({ companyId, category });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cleanup task by ID' })
  async findOne(@Param('id') id: string): Promise<CleanupTask> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cleanup task' })
  async create(@Body() data: Partial<CleanupTask>): Promise<CleanupTask> {
    return this.service.create(data);
  }

  @Post('run/:id')
  @ApiOperation({ summary: 'Run a cleanup task (stamps lastRunAt, returns summary)' })
  async run(@Param('id') id: string) {
    return this.service.run(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update / toggle cleanup task' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<CleanupTask>,
  ): Promise<CleanupTask> {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete cleanup task' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
