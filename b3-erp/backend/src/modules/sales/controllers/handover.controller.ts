import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { HandoverService } from '../services/handover.service';
import { Handover } from '../entities/handover.entity';

@Controller('sales/handovers')
export class HandoverController {
  constructor(private readonly service: HandoverService) {}

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ companyId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<Handover>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<Handover>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
