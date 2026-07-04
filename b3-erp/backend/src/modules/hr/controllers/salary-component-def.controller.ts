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
import { SalaryComponentDefService } from '../services/salary-component-def.service';

@ApiTags('HR - SalaryComponent')
@Controller('hr/salary-components')
export class SalaryComponentDefController {
  constructor(private readonly service: SalaryComponentDefService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new salary-component' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'SalaryComponent created successfully',
  })
  async create(@Body() createDto: any): Promise<any> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all salary-components' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of salary-components',
  })
  async findAll(@Query() filters: any): Promise<any[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salary-component by ID' })
  @ApiParam({ name: 'id', description: 'SalaryComponent ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SalaryComponent details',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'SalaryComponent not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update salary-component' })
  @ApiParam({ name: 'id', description: 'SalaryComponent ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'SalaryComponent updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ): Promise<any> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete salary-component' })
  @ApiParam({ name: 'id', description: 'SalaryComponent ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'SalaryComponent deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
