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
import { PipelineStageConfigService } from './services/pipeline-stage-config.service';
import { PipelineStageConfig } from './entities/pipeline-stage-config.entity';

@Controller('crm/pipeline-stage-configs')
export class PipelineStageConfigController {
  constructor(private readonly service: PipelineStageConfigService) {}

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('pipelineType') pipelineType?: string,
  ) {
    return this.service.findAll(companyId, pipelineType);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<PipelineStageConfig>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<PipelineStageConfig>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
