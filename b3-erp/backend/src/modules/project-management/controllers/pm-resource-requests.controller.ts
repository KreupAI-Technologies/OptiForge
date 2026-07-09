import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Put,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PmResourceRequestsService } from '../services/pm-resource-requests.service';
import {
  CreatePmResourceRequestDto,
  UpdatePmResourceRequestDto,
} from '../dto/pm-resource-request.dto';

@Controller('project-resource-requests')
export class PmResourceRequestsController {
  constructor(private readonly service: PmResourceRequestsService) {}

  @Post()
  create(@Body() dto: CreatePmResourceRequestDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({ projectId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePmResourceRequestDto) {
    return this.service.update(id, dto);
  }

  @Put(':id')
  updatePut(@Param('id') id: string, @Body() dto: UpdatePmResourceRequestDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
