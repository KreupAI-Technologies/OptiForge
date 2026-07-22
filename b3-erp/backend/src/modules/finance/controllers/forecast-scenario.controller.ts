import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ForecastScenarioService } from '../services/forecast-scenario.service';
import { ForecastScenario } from '../entities/forecast-scenario.entity';

@ApiTags('Finance - Forecast Scenarios')
@Controller('finance/forecast-scenarios')
export class ForecastScenarioController {
  constructor(private readonly service: ForecastScenarioService) {}

  @Get()
  @ApiOperation({ summary: 'List forecast scenarios' })
  findAll(): Promise<ForecastScenario[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get forecast scenario by id' })
  findOne(@Param('id') id: string): Promise<ForecastScenario> {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create/save forecast scenario' })
  create(@Body() dto: Partial<ForecastScenario>): Promise<ForecastScenario> {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update forecast scenario' })
  update(
    @Param('id') id: string,
    @Body() dto: Partial<ForecastScenario>,
  ): Promise<ForecastScenario> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete forecast scenario' })
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.service.remove(id);
  }
}
