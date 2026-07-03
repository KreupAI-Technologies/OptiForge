import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HrDocumentService } from '../services/hr-document.service';
import { HrDocument } from '../entities/hr-document.entity';

@ApiTags('HR - Documents')
@Controller('hr/documents')
export class HrDocumentController {
  constructor(private readonly service: HrDocumentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('docCategory') docCategory?: string,
  ): Promise<HrDocument[]> {
    return this.service.findAll(companyId || 'company-1', docCategory);
  }

  @Get('summary')
  summary(
    @Query('companyId') companyId: string,
    @Query('docCategory') docCategory?: string,
  ) {
    return this.service.summary(companyId || 'company-1', docCategory);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<HrDocument> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<HrDocument> & { companyId: string },
  ): Promise<HrDocument> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<HrDocument>,
  ): Promise<HrDocument> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
