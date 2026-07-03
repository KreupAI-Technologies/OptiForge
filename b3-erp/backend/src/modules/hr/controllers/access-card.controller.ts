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
import { AccessCardService } from '../services/access-card.service';
import { AccessCard } from '../entities/access-card.entity';

@ApiTags('HR - Access Cards')
@Controller('hr/access-cards')
export class AccessCardController {
  constructor(private readonly service: AccessCardService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('cardType') cardType?: string,
  ): Promise<AccessCard[]> {
    return this.service.findAll(companyId || 'company-1', cardType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AccessCard> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AccessCard> & { companyId: string },
  ): Promise<AccessCard> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AccessCard>,
  ): Promise<AccessCard> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
