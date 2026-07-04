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
import { AttendancePolicyService } from '../services/attendance-policy.service';

@ApiTags('HR - AttendancePolicy')
@Controller('hr/attendance-policies')
export class AttendancePolicyController {
  constructor(private readonly service: AttendancePolicyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new attendance-policy' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'AttendancePolicy created successfully',
  })
  async create(@Body() createDto: any): Promise<any> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all attendance-policies' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of attendance-policies',
  })
  async findAll(@Query() filters: any): Promise<any[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance-policy by ID' })
  @ApiParam({ name: 'id', description: 'AttendancePolicy ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'AttendancePolicy details',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'AttendancePolicy not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update attendance-policy' })
  @ApiParam({ name: 'id', description: 'AttendancePolicy ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'AttendancePolicy updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ): Promise<any> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete attendance-policy' })
  @ApiParam({ name: 'id', description: 'AttendancePolicy ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'AttendancePolicy deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
