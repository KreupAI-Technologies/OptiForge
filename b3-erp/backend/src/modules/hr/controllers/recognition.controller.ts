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
import { RecognitionService } from '../services/recognition.service';
import { Recognition } from '../entities/recognition.entity';
import { RecognitionComment } from '../entities/recognition-comment.entity';

@ApiTags('HR - Recognitions')
@Controller('hr/recognitions')
export class RecognitionController {
  constructor(private readonly service: RecognitionService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('toEmployeeId') toEmployeeId?: string,
    @Query('fromEmployeeId') fromEmployeeId?: string,
  ): Promise<Recognition[]> {
    return this.service.findAll(companyId || 'company-1', {
      toEmployeeId,
      fromEmployeeId,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Recognition> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<Recognition> & { companyId?: string },
  ): Promise<Recognition> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<Recognition>,
  ): Promise<Recognition> {
    return this.service.update(id, body);
  }

  @Post(':id/like')
  like(
    @Param('id') id: string,
    @Body() body: { employeeId?: string },
  ): Promise<Recognition> {
    return this.service.like(id, body?.employeeId || 'current_user');
  }

  @Get(':id/comments')
  findComments(@Param('id') id: string): Promise<RecognitionComment[]> {
    return this.service.findComments(id);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() body: Partial<RecognitionComment>,
  ): Promise<RecognitionComment> {
    return this.service.addComment(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
