import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectBudgetsService } from '../services/project-budgets.service';
import { CreateProjectBudgetDto, UpdateProjectBudgetDto } from '../dto/project-budget.dto';

@Controller('project-budgets')
export class ProjectBudgetsController {
    constructor(private readonly budgetsService: ProjectBudgetsService) { }

    @Post()
    create(@Body() createBudgetDto: CreateProjectBudgetDto) {
        return this.budgetsService.create(createBudgetDto);
    }

    @Get()
    findAll(@Query('projectId') projectId: string) {
        return this.budgetsService.findAll(projectId);
    }

    @Get('trend')
    getTrend(@Query('projectId') projectId: string) {
        return this.budgetsService.getSpendingTrend(projectId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.budgetsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBudgetDto: UpdateProjectBudgetDto) {
        return this.budgetsService.update(id, updateBudgetDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.budgetsService.remove(id);
    }
}
