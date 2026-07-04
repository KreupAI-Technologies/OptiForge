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
import { PayrollCalendarEventService } from '../services/payroll-calendar-event.service';

@ApiTags('HR - PayrollCalendarEvent')
@Controller('hr/payroll-calendar')
export class PayrollCalendarEventController {
  constructor(private readonly service: PayrollCalendarEventService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new payroll-calendar event' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'PayrollCalendarEvent created successfully',
  })
  async create(@Body() createDto: any): Promise<any> {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payroll-calendar events' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of payroll-calendar events',
  })
  async findAll(@Query() filters: any): Promise<any[]> {
    return this.service.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payroll-calendar event by ID' })
  @ApiParam({ name: 'id', description: 'PayrollCalendarEvent ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PayrollCalendarEvent details',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'PayrollCalendarEvent not found' })
  async findOne(@Param('id') id: string): Promise<any> {
    return this.service.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payroll-calendar event' })
  @ApiParam({ name: 'id', description: 'PayrollCalendarEvent ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PayrollCalendarEvent updated successfully',
  })
  async update(
    @Param('id') id: string,
    @Body() updateDto: any,
  ): Promise<any> {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete payroll-calendar event' })
  @ApiParam({ name: 'id', description: 'PayrollCalendarEvent ID' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'PayrollCalendarEvent deleted successfully',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }
}
