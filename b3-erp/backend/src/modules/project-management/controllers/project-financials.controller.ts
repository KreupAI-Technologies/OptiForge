import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectFinancialsService } from '../services/project-financials.service';

@Controller('api/project-management')
export class ProjectFinancialsController {
    constructor(private readonly financialsService: ProjectFinancialsService) { }

    @Get(':projectId/financials')
    async getFinancials(@Param('projectId') projectId: string) {
        const breakdown = await this.financialsService.getFinancialBreakdown(projectId);
        return {
            success: true,
            data: breakdown
        };
    }

    @Post(':projectId/financials/expense')
    async trackExpense(
        @Param('projectId') projectId: string,
        @Body() body: { amount: number; category: string; description: string }
    ) {
        const result = await this.financialsService.trackExpense(
            projectId,
            body.amount,
            body.category,
            body.description
        );
        return {
            success: true,
            data: result
        };
    }

    @Post(':projectId/financials/income')
    async trackIncome(
        @Param('projectId') projectId: string,
        @Body() body: { amount: number; source: string; description: string }
    ) {
        const result = await this.financialsService.trackIncome(
            projectId,
            body.amount,
            body.source,
            body.description
        );
        return {
            success: true,
            data: result
        };
    }

    @Get(':projectId/financials/ioe')
    async calculateIoE(@Param('projectId') projectId: string) {
        const ioeData = await this.financialsService.calculateIoE(projectId);
        return {
            success: true,
            data: ioeData
        };
    }
}
