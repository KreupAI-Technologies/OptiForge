import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CrmCustomerService } from './services/crm-customer.service';
import { CrmCustomer } from './entities/crm-customer.entity';

@Controller('crm/customers')
export class CrmCustomerController {
  constructor(private readonly service: CrmCustomerService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get('hierarchy')
  getHierarchy(@Query('companyId') companyId?: string) {
    return this.service.getHierarchy(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<CrmCustomer>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmCustomer>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
