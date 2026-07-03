import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Vendor } from '../entities/vendor.entity';
import { VendorService } from '../services/vendor.service';

@Controller('procurement/vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<Vendor>,
  ): Promise<Vendor> {
    return this.vendorService.create(companyId || 'default', data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<{ data: Vendor[]; total: number }> {
    return this.vendorService.findAll(companyId || 'default', {
      status,
      search,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<Vendor> {
    return this.vendorService.findOne(companyId || 'default', id);
  }

  @Put(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<Vendor>,
  ): Promise<Vendor> {
    return this.vendorService.update(companyId || 'default', id, data);
  }

  @Patch(':id')
  patch(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<Vendor>,
  ): Promise<Vendor> {
    return this.vendorService.update(companyId || 'default', id, data);
  }

  @Post(':id/approve')
  approve(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<Vendor> {
    return this.vendorService.approve(companyId || 'default', id);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.vendorService.delete(companyId || 'default', id);
  }
}
