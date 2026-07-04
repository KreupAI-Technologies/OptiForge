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
import { IotDeviceService } from '../services/iot-device.service';
import { IotDevice } from '../entities/iot-device.entity';

@ApiTags('IoT Devices')
@Controller('iot/devices')
export class IotDeviceController {
  constructor(private readonly service: IotDeviceService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
  ): Promise<IotDevice[]> {
    return this.service.findAll(companyId || 'company-1', { status, type });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IotDevice> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<IotDevice> & { companyId: string },
  ): Promise<IotDevice> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<IotDevice>,
  ): Promise<IotDevice> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
