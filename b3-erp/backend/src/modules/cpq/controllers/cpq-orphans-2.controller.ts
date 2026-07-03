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
  CPQConfigStep,
  CPQIntegrationEndpoint,
  CPQNotificationSettingRow,
  CPQPermissionRole,
  CPQQuoteVersionRow,
  CPQWorkflowRequest,
} from '../entities/cpq-orphans-2.entity';
import {
  CPQConfigStepService,
  CPQIntegrationEndpointService,
  CPQNotificationSettingRowService,
  CPQPermissionRoleService,
  CPQQuoteVersionRowService,
  CPQWorkflowRequestService,
} from '../services/cpq-orphans-2.service';

@Controller('cpq/workflow-requests')
export class CPQWorkflowRequestController {
  constructor(private readonly service: CPQWorkflowRequestService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('requestType') requestType?: string,
    @Query('status') status?: string,
  ): Promise<CPQWorkflowRequest[]> {
    return this.service.findAll(companyId, { requestType, status });
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQWorkflowRequest>,
  ): Promise<CPQWorkflowRequest> {
    return this.service.create(companyId, data);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<CPQWorkflowRequest>,
  ): Promise<CPQWorkflowRequest> {
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

@Controller('cpq/quote-versions-list')
export class CPQQuoteVersionRowController {
  constructor(private readonly service: CPQQuoteVersionRowService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('quoteNumber') quoteNumber?: string,
    @Query('status') status?: string,
  ): Promise<CPQQuoteVersionRow[]> {
    return this.service.findAll(companyId, { quoteNumber, status });
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQQuoteVersionRow>,
  ): Promise<CPQQuoteVersionRow> {
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

@Controller('cpq/notification-settings')
export class CPQNotificationSettingRowController {
  constructor(private readonly service: CPQNotificationSettingRowService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('settingType') settingType?: string,
  ): Promise<CPQNotificationSettingRow[]> {
    return this.service.findAll(companyId, { settingType });
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQNotificationSettingRow>,
  ): Promise<CPQNotificationSettingRow> {
    return this.service.create(companyId, data);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<CPQNotificationSettingRow>,
  ): Promise<CPQNotificationSettingRow> {
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

@Controller('cpq/permission-roles')
export class CPQPermissionRoleController {
  constructor(private readonly service: CPQPermissionRoleService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQPermissionRole[]> {
    return this.service.findAll(companyId);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQPermissionRole>,
  ): Promise<CPQPermissionRole> {
    return this.service.create(companyId, data);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<CPQPermissionRole>,
  ): Promise<CPQPermissionRole> {
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

@Controller('cpq/integration-endpoints')
export class CPQIntegrationEndpointController {
  constructor(private readonly service: CPQIntegrationEndpointService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('system') system?: string,
    @Query('status') status?: string,
  ): Promise<CPQIntegrationEndpoint[]> {
    return this.service.findAll(companyId, { system, status });
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQIntegrationEndpoint>,
  ): Promise<CPQIntegrationEndpoint> {
    return this.service.create(companyId, data);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<CPQIntegrationEndpoint>,
  ): Promise<CPQIntegrationEndpoint> {
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

@Controller('cpq/config-steps')
export class CPQConfigStepController {
  constructor(private readonly service: CPQConfigStepService) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQConfigStep[]> {
    return this.service.findAll(companyId);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQConfigStep>,
  ): Promise<CPQConfigStep> {
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
