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
import { VehicleService } from '../services/vehicle.service';
import { Vehicle } from '../entities/vehicle.entity';

@ApiTags('HR - Vehicles')
@Controller('hr/vehicles')
export class VehicleController {
  constructor(private readonly service: VehicleService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<Vehicle[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Vehicle> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<Vehicle> & { companyId: string },
  ): Promise<Vehicle> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<Vehicle>,
  ): Promise<Vehicle> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
