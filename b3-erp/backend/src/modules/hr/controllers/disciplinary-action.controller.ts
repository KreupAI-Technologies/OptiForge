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
import { DisciplinaryActionService } from '../services/disciplinary-action.service';
import { DisciplinaryAction } from '../entities/disciplinary-action.entity';

@ApiTags('HR - Disciplinary Actions')
@Controller('hr/disciplinary-actions')
export class DisciplinaryActionController {
  constructor(private readonly service: DisciplinaryActionService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<DisciplinaryAction[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<DisciplinaryAction> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<DisciplinaryAction> & { companyId: string },
  ): Promise<DisciplinaryAction> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<DisciplinaryAction>,
  ): Promise<DisciplinaryAction> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
