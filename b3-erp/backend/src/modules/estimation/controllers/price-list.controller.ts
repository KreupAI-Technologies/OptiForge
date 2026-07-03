import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PriceList } from '../entities/price-list.entity';
import { PriceListService } from '../services/price-list.service';

@Controller('estimation/price-lists')
export class PriceListController {
  constructor(private readonly priceListService: PriceListService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<PriceList>,
  ): Promise<PriceList> {
    return this.priceListService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('priceType') priceType?: string,
  ): Promise<PriceList[]> {
    return this.priceListService.findAll(companyId, { status, priceType });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<PriceList> {
    return this.priceListService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<PriceList>,
  ): Promise<PriceList> {
    return this.priceListService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.priceListService.delete(companyId, id);
  }
}
