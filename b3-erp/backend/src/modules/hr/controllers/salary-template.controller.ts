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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';
import { SalaryTemplateService } from '../services/salary-template.service';

@ApiTags('HR - SalaryTemplate')
@Controller('hr/salary-templates')
export class SalaryTemplateController {
  constructor(private readonly service: SalaryTemplateService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new salary-template' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'SalaryTemplate created successfully',
  })
  async create(@Body() createDto: any): Promise<any> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all salary-templates' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of salary-templates',
  })
  async findAll(@Query() filters: any): Promise<any[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salary-template by ID' })
  @ApiParam({ name: 'id', description: 'SalaryTemplate ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SalaryTemplate details',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'SalaryTemplate not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update salary-template' })
  @ApiParam({ name: 'id', description: 'SalaryTemplate ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SalaryTemplate updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ): Promise<any> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete salary-template' })
  @ApiParam({ name: 'id', description: 'SalaryTemplate ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'SalaryTemplate deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
