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
import { ApiTags } from '@nestjs/swagger';
import { VehicleAssignmentService } from '../services/vehicle-assignment.service';
import { VehicleAssignment } from '../entities/vehicle-assignment.entity';

@ApiTags('HR - Vehicle Assignments')
@Controller('hr/vehicle-assignments')
export class VehicleAssignmentController {
  constructor(private readonly service: VehicleAssignmentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<VehicleAssignment[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<VehicleAssignment> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<VehicleAssignment> & { companyId: string },
  ): Promise<VehicleAssignment> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<VehicleAssignment>,
  ): Promise<VehicleAssignment> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
