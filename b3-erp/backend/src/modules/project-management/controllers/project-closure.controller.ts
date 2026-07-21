import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ProjectClosureService } from '../services/project-closure.service';

@Controller('api/project-closure')
export class ProjectClosureController {
    constructor(private readonly service: ProjectClosureService) { }

    @Get('status/:projectId')
    getClosureStatus(@Param('projectId') projectId: string) {
        return this.service.getProjectClosureStatus(projectId);
    }

    @Post('initiate/:projectId')
    initiateHandover(
        @Param('projectId') projectId: string,
        @Body() body?: { rating?: number; feedback?: string },
    ) {
        return this.service.initiateHandover(projectId, body);
    }

    @Patch('sign/:id')
    signHandover(@Param('id') id: string, @Body() data: { signatory: string; title: string }) {
        return this.service.signHandover(id, data.signatory, data.title);
    }

    @Get('certificate/:projectId')
    getCertificate(@Param('projectId') projectId: string) {
        return this.service.getCertificate(projectId);
    }
}
