import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CustomerAcceptanceService } from '../services/customer-acceptance.service';
import { CustomerAcceptanceEntity } from '../entities/customer-acceptance.entity';

@Controller('project-management/customer-acceptance')
export class CustomerAcceptanceController {
  constructor(private readonly service: CustomerAcceptanceService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string, @Query('overallStatus') overallStatus?: string) {
    return this.service.findAll(companyId || 'default', overallStatus);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<CustomerAcceptanceEntity>) {
    return this.service.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<CustomerAcceptanceEntity>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
