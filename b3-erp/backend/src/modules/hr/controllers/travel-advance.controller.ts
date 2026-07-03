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
import { TravelAdvanceService } from '../services/travel-advance.service';
import { TravelAdvance } from '../entities/travel-advance.entity';

@ApiTags('HR - Travel Advances')
@Controller('hr/travel-advances')
export class TravelAdvanceController {
  constructor(private readonly service: TravelAdvanceService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<TravelAdvance[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TravelAdvance> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<TravelAdvance> & { companyId: string },
  ): Promise<TravelAdvance> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<TravelAdvance>,
  ): Promise<TravelAdvance> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
