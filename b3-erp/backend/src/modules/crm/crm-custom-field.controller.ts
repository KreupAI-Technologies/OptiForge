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
import { CrmCustomFieldService } from './services/crm-custom-field.service';
import { CrmCustomField } from './entities/crm-custom-field.entity';

@Controller('crm/custom-fields')
export class CrmCustomFieldController {
  constructor(private readonly service: CrmCustomFieldService) {}

  @Get()
  findAll(
    @Query('companyId') companyId?: string,
    @Query('module') module?: string,
  ) {
    return this.service.findAll({ companyId, module });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<CrmCustomField>) {
    return this.service.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<CrmCustomField>) {
    return this.service.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
