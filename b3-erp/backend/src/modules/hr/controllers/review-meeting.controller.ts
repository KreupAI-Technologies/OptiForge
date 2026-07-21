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
import { ReviewMeetingService } from '../services/review-meeting.service';
import { ReviewMeeting } from '../entities/review-meeting.entity';

@ApiTags('HR - Review Meetings')
@Controller('hr/review-meetings')
export class ReviewMeetingController {
  constructor(private readonly service: ReviewMeetingService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('reviewId') reviewId?: string,
    @Query('employeeId') employeeId?: string,
    @Query('status') status?: string,
  ): Promise<ReviewMeeting[]> {
    return this.service.findAll(companyId || 'company-1', {
      reviewId,
      employeeId,
      status,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<ReviewMeeting> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<ReviewMeeting> & { companyId?: string },
  ): Promise<ReviewMeeting> {
    return this.service.create({ ...body, companyId: body.companyId || 'company-1' });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<ReviewMeeting>,
  ): Promise<ReviewMeeting> {
    return this.service.update(id, body);
  }

  @Post(':id/reschedule')
  reschedule(
    @Param('id') id: string,
    @Body() body: { scheduledDate?: string; scheduledTime?: string; location?: string },
  ): Promise<ReviewMeeting> {
    return this.service.reschedule(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
