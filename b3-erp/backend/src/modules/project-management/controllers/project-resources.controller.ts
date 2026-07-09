import { Controller, Get, Post, Body, Patch, Put, Param, Delete, Query } from '@nestjs/common';
import { ProjectResourcesService } from '../services/project-resources.service';
import {
    CreateProjectResourceDto,
    UpdateProjectResourceDto,
    TransferResourceDto,
    BalanceWorkloadDto,
} from '../dto/project-resource.dto';

@Controller('project-resources')
export class ProjectResourcesController {
    constructor(private readonly resourcesService: ProjectResourcesService) { }

    @Post()
    create(@Body() createResourceDto: CreateProjectResourceDto) {
        return this.resourcesService.create(createResourceDto);
    }

    @Post('transfer')
    transfer(@Body() dto: TransferResourceDto) {
        return this.resourcesService.transfer(dto);
    }

    @Post('balance-workload')
    balanceWorkload(@Body() dto: BalanceWorkloadDto) {
        return this.resourcesService.balanceWorkload(dto);
    }

    @Get()
    findAll(@Query('projectId') projectId: string) {
        return this.resourcesService.findAll(projectId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.resourcesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateResourceDto: UpdateProjectResourceDto) {
        return this.resourcesService.update(id, updateResourceDto);
    }

    @Put(':id')
    updatePut(@Param('id') id: string, @Body() updateResourceDto: UpdateProjectResourceDto) {
        return this.resourcesService.update(id, updateResourceDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.resourcesService.remove(id);
    }
}
