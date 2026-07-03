import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SavingsInitiative } from '../entities/savings-initiative.entity';
import { SavingsInitiativeService } from '../services/savings-initiative.service';

@Controller('procurement/savings-initiatives')
export class SavingsInitiativeController {
  constructor(
    private readonly savingsInitiativeService: SavingsInitiativeService,
  ) {}

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<SavingsInitiative>,
  ): Promise<SavingsInitiative> {
    return this.savingsInitiativeService.create(companyId, data);
  }

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
    @Query('category') category?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ): Promise<SavingsInitiative[]> {
    return this.savingsInitiativeService.findAll(companyId, {
      category,
      type,
      status,
    });
  }

  @Get(':id')
  findOne(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<SavingsInitiative> {
    return this.savingsInitiativeService.findOne(companyId, id);
  }

  @Patch(':id')
  update(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
    @Body() data: Partial<SavingsInitiative>,
  ): Promise<SavingsInitiative> {
    return this.savingsInitiativeService.update(companyId, id, data);
  }

  @Delete(':id')
  delete(
    @Headers('x-company-id') companyId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.savingsInitiativeService.delete(companyId, id);
  }
}
