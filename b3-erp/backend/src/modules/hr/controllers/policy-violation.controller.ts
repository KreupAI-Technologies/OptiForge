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
import { PolicyViolationService } from '../services/policy-violation.service';
import { PolicyViolation } from '../entities/policy-violation.entity';

@ApiTags('HR - Policy Violations')
@Controller('hr/policy-violations')
export class PolicyViolationController {
  constructor(private readonly service: PolicyViolationService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<PolicyViolation[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<PolicyViolation> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<PolicyViolation> & { companyId: string },
  ): Promise<PolicyViolation> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<PolicyViolation>,
  ): Promise<PolicyViolation> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
