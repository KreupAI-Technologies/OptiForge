import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ITILService } from '../services/itil.service';

const DEFAULT_COMPANY = 'default-company-id';

/**
 * ITILController exposes the (previously provider-only) ITILService so the
 * frontend ITILService (support.service.ts) endpoints
 * `/support/itil/{incidents,problems,changes}` resolve instead of 404-ing.
 * Persistence is Prisma (itil_incidents / itil_problems / itil_changes).
 */
@ApiTags('Support ITIL')
@Controller('support/itil')
export class ITILController {
  constructor(private readonly service: ITILService) {}

  // ---------------------------------------------------------------- Incidents
  @Get('incidents')
  getIncidents(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getIncidents(companyId || DEFAULT_COMPANY, {
      status,
      priority,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('incidents/:id')
  getIncident(@Param('id') id: string) {
    return this.service.getIncidentById(id);
  }

  @Post('incidents')
  createIncident(
    @Body() body: Parameters<ITILService['createIncident']>[0] & { companyId?: string },
  ) {
    return this.service.createIncident({
      ...body,
      companyId: body.companyId || DEFAULT_COMPANY,
    });
  }

  @Put('incidents/:id')
  updateIncident(
    @Param('id') id: string,
    @Body() body: Parameters<ITILService['updateIncident']>[1],
  ) {
    return this.service.updateIncident(id, body);
  }

  // ----------------------------------------------------------------- Problems
  @Get('problems')
  getProblems(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getProblems(companyId || DEFAULT_COMPANY, {
      status,
      priority,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('problems/:id')
  getProblem(@Param('id') id: string) {
    return this.service.getProblemById(id);
  }

  @Post('problems')
  createProblem(
    @Body() body: Parameters<ITILService['createProblem']>[0] & { companyId?: string },
  ) {
    return this.service.createProblem({
      ...body,
      companyId: body.companyId || DEFAULT_COMPANY,
    });
  }

  @Put('problems/:id')
  updateProblem(
    @Param('id') id: string,
    @Body() body: Parameters<ITILService['updateProblem']>[1],
  ) {
    return this.service.updateProblem(id, body);
  }

  // ------------------------------------------------------------------ Changes
  @Get('changes')
  getChanges(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getChanges(companyId || DEFAULT_COMPANY, {
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('changes/:id')
  getChange(@Param('id') id: string) {
    return this.service.getChangeById(id);
  }

  @Post('changes')
  createChange(
    @Body() body: Parameters<ITILService['createChange']>[0] & { companyId?: string },
  ) {
    return this.service.createChange({
      ...body,
      companyId: body.companyId || DEFAULT_COMPANY,
    });
  }

  @Put('changes/:id')
  updateChange(
    @Param('id') id: string,
    @Body() body: Parameters<ITILService['updateChange']>[1],
  ) {
    return this.service.updateChange(id, body);
  }

  @Post('changes/:id/approve')
  async approveChange(
    @Param('id') id: string,
    @Body() body: { approver?: string; notes?: string },
  ) {
    // Mark the change approved (single-step approval used by the CAB UI).
    return this.service.updateChange(id, {
      status: 'scheduled',
      reviewNotes: body?.notes,
      reviewedBy: body?.approver,
    });
  }

  // ---------------------------------------------------------------- Dashboard
  @Get('dashboard')
  getDashboard(@Query('companyId') companyId: string) {
    return this.service.getITILDashboard(companyId || DEFAULT_COMPANY);
  }
}
