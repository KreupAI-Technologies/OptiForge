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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import {
  JobCostSheetService,
  CreateJobCostSheetDto,
  UpdateJobCostSheetDto,
} from '../services/job-cost-sheet.service';

@ApiTags('Finance - Job Cost Sheets')
@Controller('finance/cost-sheets')
export class JobCostSheetController {
  constructor(private readonly service: JobCostSheetService) {}

  @Get()
  @ApiOperation({ summary: 'List job cost sheets (estimated vs actual)' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'projectType', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiResponse({ status: HttpStatus.OK, description: 'List of job cost sheets' })
  async findAll(
    @Query('status') status?: string,
    @Query('projectType') projectType?: string,
    @Query('search') search?: string,
  ): Promise<any[]> {
    return this.service.findAll({ status, projectType, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a job cost sheet by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Job cost sheet details' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a job cost sheet' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Created' })
  async create(@Body() dto: CreateJobCostSheetDto): Promise<any> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a job cost sheet' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Updated' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateJobCostSheetDto,
  ): Promise<any> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a job cost sheet' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
