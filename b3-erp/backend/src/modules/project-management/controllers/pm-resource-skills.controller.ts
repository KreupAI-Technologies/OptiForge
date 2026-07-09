import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PmResourceSkillsService } from '../services/pm-resource-skills.service';
import { SaveResourceSkillsDto } from '../dto/pm-resource-skill.dto';

@Controller('project-resource-skills')
export class PmResourceSkillsController {
  constructor(private readonly service: PmResourceSkillsService) {}

  @Get()
  findAll(@Query('resourceId') resourceId?: string) {
    return this.service.findAll(resourceId);
  }

  @Get(':resourceId')
  findByResource(@Param('resourceId') resourceId: string) {
    return this.service.findByResource(resourceId);
  }

  @Post()
  save(@Body() dto: SaveResourceSkillsDto) {
    return this.service.save(dto);
  }

  @Put()
  savePut(@Body() dto: SaveResourceSkillsDto) {
    return this.service.save(dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
