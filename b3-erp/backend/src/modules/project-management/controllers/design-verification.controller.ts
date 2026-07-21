import { Controller, Get, Post, Patch, Body, Param, Query } from '@nestjs/common';
import { DesignVerificationService } from '../services/design-verification.service';
import { ApprovalStatus } from '../../project/entities/external-approval.entity';

@Controller('api/design-verification')
export class DesignVerificationController {
    constructor(private readonly service: DesignVerificationService) { }

    @Get('discrepancies/:projectId')
    getDiscrepancies(@Param('projectId') projectId: string) {
        return this.service.getDiscrepancies(projectId);
    }

    @Post('discrepancies')
    createDiscrepancy(@Body() data: any) {
        return this.service.createDiscrepancy(data);
    }

    @Get('drawings/:projectId')
    getDrawingVerifications(@Param('projectId') projectId: string) {
        return this.service.getDrawingVerifications(projectId);
    }

    @Patch('drawings/:id/verify')
    verifyDrawing(@Param('id') id: string, @Body() data: any) {
        return this.service.verifyDrawing(id, data);
    }

    @Patch('discrepancies/:id/resolve')
    resolveDiscrepancy(@Param('id') id: string, @Body('resolvedBy') resolvedBy: string, @Body('notes') notes: string) {
        return this.service.resolveDiscrepancy(id, resolvedBy, notes);
    }

    @Get('surveys/:projectId')
    getSurveys(@Param('projectId') projectId: string) {
        return this.service.getSurveys(projectId);
    }

    @Post('surveys')
    createSurvey(@Body() data: any) {
        return this.service.createSurvey(data);
    }

    @Post('approvals/request')
    createApprovalRequest(@Body() data: { projectId: string; attachmentId: string; clientEmail: string }) {
        return this.service.createApprovalRequest(data.projectId, data.attachmentId, data.clientEmail);
    }

    @Get('approvals/token/:token')
    getApprovalByToken(@Param('token') token: string) {
        return this.service.getApprovalByToken(token);
    }

    @Post('approvals/submit')
    submitApproval(@Body() data: { token: string; status: ApprovalStatus; signatureUrl?: string; comments?: string }) {
        return this.service.submitApproval(data.token, data.status, data.signatureUrl, data.comments);
    }

    @Post('detect/:projectId')
    detect(@Param('projectId') projectId: string) {
        return this.service.detectDiscrepancies(projectId);
    }
}
