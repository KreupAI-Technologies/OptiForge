import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ActivityRecordService } from './services/activity-record.service';
import { ActivityRecord } from './entities/activity-record.entity';

@Controller('crm/activity-records')
export class ActivityRecordController {
  constructor(private readonly service: ActivityRecordService) {}

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ companyId, type, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<ActivityRecord>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<ActivityRecord>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
