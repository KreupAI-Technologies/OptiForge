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
import { IdCardService } from '../services/id-card.service';
import { IdCard } from '../entities/id-card.entity';

@ApiTags('HR - ID Cards')
@Controller('hr/id-cards')
export class IdCardController {
  constructor(private readonly service: IdCardService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('cardType') cardType?: string,
  ): Promise<IdCard[]> {
    return this.service.findAll(companyId || 'company-1', cardType);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<IdCard> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<IdCard> & { companyId: string },
  ): Promise<IdCard> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<IdCard>,
  ): Promise<IdCard> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
