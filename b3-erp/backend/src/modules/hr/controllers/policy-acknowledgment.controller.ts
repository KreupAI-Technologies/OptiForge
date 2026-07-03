import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PolicyAcknowledgmentService } from '../services/policy-acknowledgment.service';
import { PolicyAcknowledgment } from '../entities/policy-acknowledgment.entity';

@ApiTags('HR - PolicyAcknowledgment')
@Controller('hr/policy-acknowledgments')
export class PolicyAcknowledgmentController {
  constructor(private readonly service: PolicyAcknowledgmentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<PolicyAcknowledgment[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PolicyAcknowledgment> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<PolicyAcknowledgment> & { companyId: string },
  ): Promise<PolicyAcknowledgment> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<PolicyAcknowledgment>,
  ): Promise<PolicyAcknowledgment> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
