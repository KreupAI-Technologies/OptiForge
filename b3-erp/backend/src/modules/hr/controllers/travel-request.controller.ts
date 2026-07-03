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
import { TravelRequestService } from '../services/travel-request.service';
import { TravelRequest } from '../entities/travel-request.entity';

@ApiTags('HR - Travel Requests')
@Controller('hr/travel-requests')
export class TravelRequestController {
  constructor(private readonly service: TravelRequestService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<TravelRequest[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TravelRequest> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<TravelRequest> & { companyId: string },
  ): Promise<TravelRequest> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<TravelRequest>,
  ): Promise<TravelRequest> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
