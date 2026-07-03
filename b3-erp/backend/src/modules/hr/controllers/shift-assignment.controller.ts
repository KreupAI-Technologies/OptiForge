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
import { ShiftAssignmentService } from '../services/shift-assignment.service';
import { ShiftAssignment } from '../entities/shift-assignment.entity';

@ApiTags('HR - Shift Assignments')
@Controller('hr/shift-assignments')
export class ShiftAssignmentController {
  constructor(private readonly service: ShiftAssignmentService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<ShiftAssignment[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ShiftAssignment> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ShiftAssignment> & { companyId: string },
  ): Promise<ShiftAssignment> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ShiftAssignment>,
  ): Promise<ShiftAssignment> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
