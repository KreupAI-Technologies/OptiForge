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
import { ShiftSwapService } from '../services/shift-swap.service';
import { ShiftSwap } from '../entities/shift-swap.entity';

@ApiTags('HR - Shift Swaps')
@Controller('hr/shift-swaps')
export class ShiftSwapController {
  constructor(private readonly service: ShiftSwapService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<ShiftSwap[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ShiftSwap> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ShiftSwap> & { companyId: string },
  ): Promise<ShiftSwap> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ShiftSwap>,
  ): Promise<ShiftSwap> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
