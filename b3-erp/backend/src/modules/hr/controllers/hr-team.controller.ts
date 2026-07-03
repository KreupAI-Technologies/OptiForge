import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HrTeamService } from '../services/hr-team.service';
import { HrTeam } from '../entities/hr-team.entity';

@ApiTags('HR - HrTeam')
@Controller('hr/teams')
export class HrTeamController {
  constructor(private readonly service: HrTeamService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<HrTeam[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<HrTeam> {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() body: Partial<HrTeam> & { companyId: string }): Promise<HrTeam> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: Partial<HrTeam>): Promise<HrTeam> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
