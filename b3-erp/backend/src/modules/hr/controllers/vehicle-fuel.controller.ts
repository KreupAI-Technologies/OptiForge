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
import { VehicleFuelService } from '../services/vehicle-fuel.service';
import { VehicleFuel } from '../entities/vehicle-fuel.entity';

@ApiTags('HR - Vehicle Fuel')
@Controller('hr/vehicle-fuel')
export class VehicleFuelController {
  constructor(private readonly service: VehicleFuelService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<VehicleFuel[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<VehicleFuel> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<VehicleFuel> & { companyId: string },
  ): Promise<VehicleFuel> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<VehicleFuel>,
  ): Promise<VehicleFuel> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
