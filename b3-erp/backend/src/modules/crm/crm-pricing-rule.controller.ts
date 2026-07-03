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
import { CrmPricingRuleService } from './services/crm-pricing-rule.service';
import { CrmPricingRule } from './entities/crm-pricing-rule.entity';

@Controller('crm/pricing-rules')
export class CrmPricingRuleController {
  constructor(private readonly service: CrmPricingRuleService) {}

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
  create(@Body() data: Partial<CrmPricingRule>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmPricingRule>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
