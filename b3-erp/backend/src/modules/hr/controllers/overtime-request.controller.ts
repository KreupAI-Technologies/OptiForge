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
import { OvertimeRequestService } from '../services/overtime-request.service';
import { OvertimeRequest } from '../entities/overtime-request.entity';

@ApiTags('HR - Overtime Requests')
@Controller('hr/overtime-requests')
export class OvertimeRequestController {
  constructor(private readonly service: OvertimeRequestService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<OvertimeRequest[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OvertimeRequest> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<OvertimeRequest> & { companyId: string },
  ): Promise<OvertimeRequest> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<OvertimeRequest>,
  ): Promise<OvertimeRequest> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
