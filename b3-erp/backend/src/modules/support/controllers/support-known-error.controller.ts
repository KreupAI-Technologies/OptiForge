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
import { SupportKnownErrorService } from '../services/support-known-error.service';
import { SupportKnownError } from '../entities/support-known-error.entity';

@ApiTags('Support Known Errors')
@Controller('support/problems/known-errors')
export class SupportKnownErrorController {
  constructor(private readonly service: SupportKnownErrorService) {}

  @Get()
  findAll(@Query('companyId') companyId: string): Promise<SupportKnownError[]> {
    return this.service.findAll(companyId || 'company-1');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<SupportKnownError> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<SupportKnownError> & { companyId: string },
  ): Promise<SupportKnownError> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<SupportKnownError>,
  ): Promise<SupportKnownError> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
