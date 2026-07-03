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
import { SocialIntegrationService } from './services/social-integration.service';
import { SocialIntegration } from './entities/social-integration.entity';

@Controller('crm/social-integrations')
export class SocialIntegrationController {
  constructor(private readonly integrationService: SocialIntegrationService) {}

  @Get()
  findAll(@Query('companyId') companyId?: string) {
    return this.integrationService.findAll(companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integrationService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() data: Partial<SocialIntegration>) {
    return this.integrationService.create(data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: Partial<SocialIntegration>) {
    return this.integrationService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.integrationService.remove(id);
  }
}
