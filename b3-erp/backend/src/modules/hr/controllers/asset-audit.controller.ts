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
import { AssetAuditService } from '../services/asset-audit.service';
import { AssetAudit } from '../entities/asset-audit.entity';

@ApiTags('HR - Asset Audits')
@Controller('hr/asset-audits')
export class AssetAuditController {
  constructor(private readonly service: AssetAuditService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('auditType') auditType?: string,
  ): Promise<AssetAudit[]> {
    return this.service.findAll(companyId || 'company-1', auditType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AssetAudit> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AssetAudit> & { companyId: string },
  ): Promise<AssetAudit> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AssetAudit>,
  ): Promise<AssetAudit> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
