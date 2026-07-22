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
import { SupplierDiversityProgram } from '../entities/supplier-diversity-program.entity';
import { SupplierDiversityProgramService } from '../services/supplier-diversity-program.service';

@Controller('procurement/diversity-programs')
export class SupplierDiversityProgramController {
  constructor(
    private readonly service: SupplierDiversityProgramService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SupplierDiversityProgram>,
  ): Promise<SupplierDiversityProgram> {
    return this.service.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('supplierId') supplierId?: string,
  ): Promise<SupplierDiversityProgram[]> {
    return this.service.findAll(companyId, { category, status, supplierId });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<SupplierDiversityProgram> {
    return this.service.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<SupplierDiversityProgram>,
  ): Promise<SupplierDiversityProgram> {
    return this.service.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.delete(companyId, id);
  }
}
