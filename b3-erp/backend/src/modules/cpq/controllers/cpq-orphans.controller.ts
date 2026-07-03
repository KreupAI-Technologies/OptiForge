import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CPQCodeListItem,
  CPQCompatibilityEntry,
  CPQConfigRuleItem,
  CPQCrossSellRule,
  CPQIntegrationSyncLog,
  CPQRecommendation,
} from '../entities/cpq-orphans.entity';
import {
  CPQCodeListItemService,
  CPQCompatibilityEntryService,
  CPQConfigRuleItemService,
  CPQCrossSellRuleService,
  CPQIntegrationSyncLogService,
  CPQRecommendationService,
} from '../services/cpq-orphans.service';

@Controller('cpq/config-rules')
export class CPQConfigRuleItemController {
  constructor(private readonly service: CPQConfigRuleItemService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<CPQConfigRuleItem[]> {
    return this.service.findAll(companyId, { type, status });
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQConfigRuleItem>,
  ): Promise<CPQConfigRuleItem> {
    return this.service.create(companyId, data);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<CPQConfigRuleItem>,
  ): Promise<CPQConfigRuleItem> {
    return this.service.update(companyId, id, data);
  }

  @Delete(':id')
  remove(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.remove(companyId, id);
  }
}

@Controller('cpq/compatibility-entries')
export class CPQCompatibilityEntryController {
  constructor(private readonly service: CPQCompatibilityEntryService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQCompatibilityEntry[]> {
    return this.service.findAll(companyId);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQCompatibilityEntry>,
  ): Promise<CPQCompatibilityEntry> {
    return this.service.create(companyId, data);
  }

  @Delete(':id')
  remove(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.remove(companyId, id);
  }
}

@Controller('cpq/cross-sell-rules')
export class CPQCrossSellRuleController {
  constructor(private readonly service: CPQCrossSellRuleService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQCrossSellRule[]> {
    return this.service.findAll(companyId);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQCrossSellRule>,
  ): Promise<CPQCrossSellRule> {
    return this.service.create(companyId, data);
  }

  @Delete(':id')
  remove(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.remove(companyId, id);
  }
}

@Controller('cpq/recommendations')
export class CPQRecommendationController {
  constructor(private readonly service: CPQRecommendationService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('customerId') customerId?: string,
    @Query('priority') priority?: string,
  ): Promise<CPQRecommendation[]> {
    return this.service.findAll(companyId, { customerId, priority });
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQRecommendation>,
  ): Promise<CPQRecommendation> {
    return this.service.create(companyId, data);
  }

  @Delete(':id')
  remove(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.remove(companyId, id);
  }
}

@Controller('cpq/code-lists')
export class CPQCodeListItemController {
  constructor(private readonly service: CPQCodeListItemService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('listType') listType?: string,
  ): Promise<CPQCodeListItem[]> {
    return this.service.findAll(companyId, { listType });
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQCodeListItem>,
  ): Promise<CPQCodeListItem> {
    return this.service.create(companyId, data);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<CPQCodeListItem>,
  ): Promise<CPQCodeListItem> {
    return this.service.update(companyId, id, data);
  }

  @Delete(':id')
  remove(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.service.remove(companyId, id);
  }
}

@Controller('cpq/integration-sync-logs')
export class CPQIntegrationSyncLogController {
  constructor(private readonly service: CPQIntegrationSyncLogService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('system') system?: string,
    @Query('status') status?: string,
  ): Promise<CPQIntegrationSyncLog[]> {
    return this.service.findAll(companyId, { system, status });
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQIntegrationSyncLog>,
  ): Promise<CPQIntegrationSyncLog> {
    return this.service.create(companyId, data);
  }
}
