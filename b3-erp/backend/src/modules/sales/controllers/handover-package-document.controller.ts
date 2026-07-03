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
import { HandoverPackageDocumentService } from '../services/handover-package-document.service';
import { HandoverPackageDocument } from '../entities/handover-package-document.entity';

@Controller('sales/handover-packages')
export class HandoverPackageDocumentController {
  constructor(private readonly service: HandoverPackageDocumentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ companyId, projectId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() data: Partial<HandoverPackageDocument>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() data: Partial<HandoverPackageDocument>,
  ) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
