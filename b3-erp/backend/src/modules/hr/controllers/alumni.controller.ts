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
import { AlumniService } from '../services/alumni.service';
import { Alumni } from '../entities/alumni.entity';

@ApiTags('HR - Alumni')
@Controller('hr/alumni')
export class AlumniController {
  constructor(private readonly service: AlumniService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('kind') kind?: string,
    @Query('status') status?: string,
  ): Promise<Alumni[]> {
    return this.service.findAll(companyId || 'company-1', { kind, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Alumni> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<Alumni> & { companyId: string },
  ): Promise<Alumni> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<Alumni>,
  ): Promise<Alumni> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
