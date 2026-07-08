import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { EstimationBomImportSession } from '../entities/bom-import-session.entity';
import {
  BomImportInput,
  BomImportSessionService,
} from '../services/bom-import-session.service';

@Controller('estimation/bom-import')
export class BomImportSessionController {
  constructor(
    private readonly bomImportSessionService: BomImportSessionService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: BomImportInput,
  ): Promise<EstimationBomImportSession> {
    return this.bomImportSessionService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('estimateId') estimateId?: string,
  ): Promise<EstimationBomImportSession[]> {
    return this.bomImportSessionService.findAll(companyId, estimateId);
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<EstimationBomImportSession> {
    return this.bomImportSessionService.findOne(companyId, id);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.bomImportSessionService.delete(companyId, id);
  }
}
