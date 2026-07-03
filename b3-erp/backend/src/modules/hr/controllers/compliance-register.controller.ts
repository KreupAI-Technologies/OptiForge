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
import { ComplianceRegisterService } from '../services/compliance-register.service';
import { ComplianceRegister } from '../entities/compliance-register.entity';

@ApiTags('HR - Compliance Registers')
@Controller('hr/compliance-registers')
export class ComplianceRegisterController {
  constructor(private readonly service: ComplianceRegisterService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('entryType') entryType?: string,
  ): Promise<ComplianceRegister[]> {
    return this.service.findAll(companyId || 'company-1', entryType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ComplianceRegister> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ComplianceRegister> & { companyId: string },
  ): Promise<ComplianceRegister> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ComplianceRegister>,
  ): Promise<ComplianceRegister> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
