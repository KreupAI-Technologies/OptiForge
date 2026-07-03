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
import { StationeryService } from '../services/stationery.service';
import { Stationery } from '../entities/stationery.entity';

@ApiTags('HR - Stationery')
@Controller('hr/stationery')
export class StationeryController {
  constructor(private readonly service: StationeryService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
  ): Promise<Stationery[]> {
    return this.service.findAll(companyId || 'company-1', category);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Stationery> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<Stationery> & { companyId: string },
  ): Promise<Stationery> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<Stationery>,
  ): Promise<Stationery> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
