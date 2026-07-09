import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RFQTemplate } from '../entities/rfq-template.entity';
import { RFQTemplateService } from '../services/rfq-template.service';

@ApiTags('Procurement - RFQ Templates')
@Controller('procurement/rfq/templates')
export class RFQTemplateController {
  constructor(private readonly templateService: RFQTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'List RFQ/RFP templates' })
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<RFQTemplate[]> {
    return this.templateService.findAll(companyId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an RFQ/RFP template' })
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<RFQTemplate>,
  ): Promise<RFQTemplate> {
    return this.templateService.create(companyId, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an RFQ/RFP template' })
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.templateService.delete(companyId, id);
  }
}
