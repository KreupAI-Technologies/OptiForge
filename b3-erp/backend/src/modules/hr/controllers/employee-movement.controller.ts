import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { EmployeeMovementService } from '../services/employee-movement.service';
import { EmployeeMovement } from '../entities/employee-movement.entity';

@ApiTags('HR - Transfers & Promotions')
@Controller('hr/transfers-promotions')
export class EmployeeMovementController {
  constructor(private readonly service: EmployeeMovementService) {}

  @Get()
  @ApiOperation({ summary: 'Get all employee transfers & promotions' })
  @ApiQuery({ name: 'companyId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('companyId') companyId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<EmployeeMovement[]> {
    return this.service.findAll({ companyId, type, status, search });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee movement by ID' })
  findOne(@Param('id') id: string): Promise<EmployeeMovement> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create an employee movement' })
  create(
    @Body() body: Partial<EmployeeMovement> & { companyId?: string },
  ): Promise<EmployeeMovement> {
    return this.service.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an employee movement' })
  update(
    @Param('id') id: string,
    @Body() body: Partial<EmployeeMovement>,
  ): Promise<EmployeeMovement> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an employee movement' })
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
