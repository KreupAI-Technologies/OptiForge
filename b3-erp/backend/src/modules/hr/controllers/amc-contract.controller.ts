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
import { AmcContractService } from '../services/amc-contract.service';
import { AmcContract } from '../entities/amc-contract.entity';

@ApiTags('HR - AMC Contracts')
@Controller('hr/amc-contracts')
export class AmcContractController {
  constructor(private readonly service: AmcContractService) {}

  @Get()
  findAll(
    @Query('companyId') companyId: string,
    @Query('assetCategory') assetCategory?: string,
  ): Promise<AmcContract[]> {
    return this.service.findAll(companyId || 'company-1', assetCategory);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<AmcContract> {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() body: Partial<AmcContract> & { companyId: string },
  ): Promise<AmcContract> {
    return this.service.create({
      ...body,
      companyId: body.companyId || 'company-1',
    });
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: Partial<AmcContract>,
  ): Promise<AmcContract> {
    return this.service.update(id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: boolean }> {
    await this.service.remove(id);
    return { success: true };
  }
}
