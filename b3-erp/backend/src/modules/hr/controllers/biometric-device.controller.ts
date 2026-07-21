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
import { BiometricDeviceService } from '../services/biometric-device.service';
import { BiometricDevice } from '../entities/biometric-device.entity';

@ApiTags('HR - Biometric Devices')
@Controller('hr/biometric-devices')
export class BiometricDeviceController {
  constructor(private readonly service: BiometricDeviceService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<BiometricDevice[]> {
    return this.service.findAll(companyId || 'company-1', { status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<BiometricDevice> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<BiometricDevice> & { companyId?: string },
  ): Promise<BiometricDevice> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<BiometricDevice>,
  ): Promise<BiometricDevice> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
