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
import { ComplianceReturnService } from '../services/compliance-return.service';
import { ComplianceReturn } from '../entities/compliance-return.entity';

@ApiTags('HR - Compliance Returns')
@Controller('hr/compliance-returns')
export class ComplianceReturnController {
  constructor(private readonly service: ComplianceReturnService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('returnType') returnType?: string,
  ): Promise<ComplianceReturn[]> {
    return this.service.findAll(companyId || 'company-1', returnType);
  }

  @Get('summary')
  summary(
    @Query('companyId') companyId: string,
    @Query('returnType') returnType?: string,
  ) {
    return this.service.summary(companyId || 'company-1', returnType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ComplianceReturn> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ComplianceReturn> & { companyId: string },
  ): Promise<ComplianceReturn> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ComplianceReturn>,
  ): Promise<ComplianceReturn> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
