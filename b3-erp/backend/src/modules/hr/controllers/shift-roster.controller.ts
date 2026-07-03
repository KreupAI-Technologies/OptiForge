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
import { ShiftRosterService } from '../services/shift-roster.service';
import { ShiftRosterEntry } from '../entities/shift-roster-entry.entity';

@ApiTags('HR - Shift Roster')
@Controller('hr/shift-roster')
export class ShiftRosterController {
  constructor(private readonly service: ShiftRosterService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<ShiftRosterEntry[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ShiftRosterEntry> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ShiftRosterEntry> & { companyId: string },
  ): Promise<ShiftRosterEntry> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ShiftRosterEntry>,
  ): Promise<ShiftRosterEntry> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
