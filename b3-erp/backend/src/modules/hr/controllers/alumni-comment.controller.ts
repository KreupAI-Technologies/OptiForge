import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AlumniCommentService } from '../services/alumni-comment.service';
import { AlumniComment } from '../entities/alumni-comment.entity';

@ApiTags('HR - Alumni Comments')
@Controller('hr/alumni-comments')
export class AlumniCommentController {
  constructor(private readonly service: AlumniCommentService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('postId') postId?: string,
    @Query('status') status?: string,
  ): Promise<AlumniComment[]> {
    return this.service.findAll(companyId || 'company-1', { postId, status });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AlumniComment> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body()
    body: Partial<AlumniComment> & { companyId?: string; postId: string; body: string },
  ): Promise<AlumniComment> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
