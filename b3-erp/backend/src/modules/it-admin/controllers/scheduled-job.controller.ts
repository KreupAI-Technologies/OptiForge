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
import { ScheduledJobService } from '../services/scheduled-job.service';
import { ScheduledJob } from '../entities/scheduled-job.entity';

@ApiTags('IT Admin - Scheduled Jobs')
@Controller('it-admin/scheduled-jobs')
export class ScheduledJobController {
  constructor(private readonly service: ScheduledJobService) {}

  @Get()
  @ApiOperation({ summary: 'List scheduled jobs' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  async findAll(
    @Query('companyId') companyId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<ScheduledJob[]> {
    return this.service.findAll({ companyId, type, status });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get scheduled job by ID' })
  async findOne(@Param('id') id: string): Promise<ScheduledJob> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create scheduled job' })
  async create(@Body() data: Partial<ScheduledJob>): Promise<ScheduledJob> {
    return this.service.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update scheduled job' })
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ScheduledJob>,
  ): Promise<ScheduledJob> {
    return this.service.update(id, data);
  }

  @Post(':id/run')
  @ApiOperation({ summary: 'Run a scheduled job immediately' })
  async run(@Param('id') id: string): Promise<ScheduledJob> {
    return this.service.run(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete scheduled job' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
