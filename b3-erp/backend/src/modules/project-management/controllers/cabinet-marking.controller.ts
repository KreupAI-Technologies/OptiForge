import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CabinetMarkingService } from '../services/cabinet-marking.service';
import { CabinetMarkingTask } from '../entities/cabinet-marking-task.entity';

@Controller('api/project-management/cabinet-marking')
export class CabinetMarkingController {
  constructor(private readonly service: CabinetMarkingService) {}

  @Get()
  async list(@Query('projectId') projectId?: string) {
    const data = await this.service.list(projectId);
    return { success: true, data };
  }

  @Post()
  async create(@Body() body: Partial<CabinetMarkingTask>) {
    const data = await this.service.create(body);
    return { success: true, data };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<CabinetMarkingTask>,
  ) {
    const data = await this.service.update(id, body);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(id);
    return { success: true, data: { id } };
  }
}
