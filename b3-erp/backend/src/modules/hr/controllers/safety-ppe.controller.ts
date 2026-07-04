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
import { SafetyPpeService } from '../services/safety-ppe.service';
import { SafetyPpe } from '../entities/safety-ppe.entity';

@ApiTags('HR - Safety PPE')
@Controller('hr/safety-ppe')
export class SafetyPpeController {
  constructor(private readonly service: SafetyPpeService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('recordType') recordType?: string,
  ): Promise<SafetyPpe[]> {
    return this.service.findAll(companyId || 'company-1', recordType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SafetyPpe> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SafetyPpe> & { companyId: string },
  ): Promise<SafetyPpe> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SafetyPpe>,
  ): Promise<SafetyPpe> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
