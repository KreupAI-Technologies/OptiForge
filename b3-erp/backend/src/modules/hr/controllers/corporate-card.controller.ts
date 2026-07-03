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
import { CorporateCardService } from '../services/corporate-card.service';
import { CorporateCard } from '../entities/corporate-card.entity';

@ApiTags('HR - Corporate Cards')
@Controller('hr/corporate-cards')
export class CorporateCardController {
  constructor(private readonly service: CorporateCardService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('status') status?: string,
  ): Promise<CorporateCard[]> {
    return this.service.findAll(companyId || 'company-1', status);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<CorporateCard> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<CorporateCard> & { companyId: string },
  ): Promise<CorporateCard> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<CorporateCard>,
  ): Promise<CorporateCard> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
