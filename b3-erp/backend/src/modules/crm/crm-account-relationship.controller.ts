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
import { CrmAccountRelationshipService } from './services/crm-account-relationship.service';
import { CrmAccountRelationship } from './entities/crm-account-relationship.entity';

@Controller('crm/account-relationships')
export class CrmAccountRelationshipController {
  constructor(private readonly service: CrmAccountRelationshipService) {}

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('accountId') accountId?: string,
    @Query('relationshipType') relationshipType?: string,
  ) {
    return this.service.findAll({ companyId, accountId, relationshipType });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<CrmAccountRelationship>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmAccountRelationship>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
