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
import { HrPolicyService } from '../services/hr-policy.service';
import { HrPolicy } from '../entities/hr-policy.entity';

@ApiTags('HR - Policies')
@Controller('hr/policies')
export class HrPolicyController {
  constructor(private readonly service: HrPolicyService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
  ): Promise<HrPolicy[]> {
    return this.service.findAll(companyId || 'company-1', { category, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<HrPolicy> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<HrPolicy> & { companyId: string },
  ): Promise<HrPolicy> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<HrPolicy>,
  ): Promise<HrPolicy> {
    return this.service.update(id, body);
  }

  @Post(':id/publish')
  publish(
    @Param('id') id: string,
    @Body() body: { publishedBy?: string },
  ): Promise<HrPolicy> {
    return this.service.publish(id, body?.publishedBy);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
