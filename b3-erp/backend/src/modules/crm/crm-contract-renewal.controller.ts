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
import { CrmContractRenewalService } from './services/crm-contract-renewal.service';
import { CrmContractRenewal } from './entities/crm-contract-renewal.entity';

@Controller('crm/contract-renewals')
export class CrmContractRenewalController {
  constructor(private readonly service: CrmContractRenewalService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<CrmContractRenewal>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmContractRenewal>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
