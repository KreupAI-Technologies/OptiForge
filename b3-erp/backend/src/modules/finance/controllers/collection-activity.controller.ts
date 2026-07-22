import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CollectionActivityService } from '../services/collection-activity.service';
import { CollectionActivity } from '../entities/collection-activity.entity';

@ApiTags('Finance - Collections')
@Controller('finance/collection-activities')
export class CollectionActivityController {
  constructor(private readonly service: CollectionActivityService) {}

  @Get()
  @ApiOperation({ summary: 'List collection activities (optionally by receivable)' })
  findAll(
    @Query('receivableId') receivableId?: string,
  ): Promise<CollectionActivity[]> {
    if (receivableId) {
      return this.service.findByReceivable(receivableId);
    }
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get collection activity by id' })
  findOne(@Param('id') id: string): Promise<CollectionActivity> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Record a collection activity' })
  create(
    @Body() dto: Partial<CollectionActivity>,
  ): Promise<CollectionActivity> {
    return this.service.create(dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete collection activity' })
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.remove(id);
  }
}
