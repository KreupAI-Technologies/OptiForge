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
import { EmailTemplateService } from './services/email-template.service';
import { EmailTemplate } from './entities/email-template.entity';

@Controller('crm/email-templates')
export class EmailTemplateController {
  constructor(private readonly templateService: EmailTemplateService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.templateService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.templateService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<EmailTemplate>) {
    return this.templateService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<EmailTemplate>) {
    return this.templateService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.templateService.remove(id);
  }
}
