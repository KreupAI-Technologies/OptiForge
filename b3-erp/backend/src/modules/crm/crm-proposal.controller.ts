import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CrmProposalService } from './services/crm-proposal.service';
import { CrmProposal } from './entities/crm-proposal.entity';

@Controller('crm/proposals')
export class CrmProposalController {
  constructor(private readonly service: CrmProposalService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.service.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<CrmProposal>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmProposal>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
