
import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Query,
    UseInterceptors,
    UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApprovalService } from '../services/approval.service';
import { documentFileFilter } from '../../../common/utils/file-upload.util';

@Controller('workflow/approvals')
export class ApprovalController {
    constructor(private readonly approvalService: ApprovalService) { }

    @Post()
    async createApproval(
        @Body('projectId') projectId: string,
        @Body('approvalType') approvalType: string,
        @Body('referenceId') referenceId: string,
        @Body('workflowType') workflowType: 'sequential' | 'parallel' | 'conditional',
        @Body('steps') steps: { approverId: string; approverRole?: string; stepNumber: number }[],
        @Body('createdBy') createdBy: string,
        @Body('description') description?: string,
    ) {
        return this.approvalService.createApproval(
            projectId,
            approvalType,
            referenceId,
            workflowType,
            steps,
            createdBy,
            description,
        );
    }

    @Post(':id/action')
    async processAction(
        @Param('id') id: string,
        @Body('userId') userId: string,
        @Body('action') action: 'approve' | 'reject',
        @Body('comments') comments?: string,
    ) {
        return this.approvalService.processAction(id, userId, action, comments);
    }

    @Post(':id/delegate')
    async delegate(
        @Param('id') id: string,
        @Body('fromUserId') fromUserId: string,
        @Body('toUserId') toUserId: string,
        @Body('reason') reason?: string,
    ) {
        return this.approvalService.delegate(id, fromUserId, toUserId, reason);
    }

    @Get(':id/attachments')
    async getAttachments(@Param('id') id: string) {
        return this.approvalService.getAttachments(id);
    }

    @Post(':id/attachments')
    @UseInterceptors(FileInterceptor('file', { fileFilter: documentFileFilter }))
    async addAttachment(
        @Param('id') id: string,
        @UploadedFile() file: any,
        @Body('userId') userId?: string,
        @Body('documentType') documentType?: string,
    ) {
        return this.approvalService.addAttachment(id, file, userId, documentType);
    }

    @Get(':id/comments')
    async getComments(@Param('id') id: string) {
        return this.approvalService.getComments(id);
    }

    @Post(':id/comments')
    async addComment(
        @Param('id') id: string,
        @Body('body') body: string,
        @Body('authorId') authorId?: string,
        @Body('authorName') authorName?: string,
    ) {
        return this.approvalService.addComment(id, body, authorId, authorName);
    }

    @Get(':id')
    async getApproval(@Param('id') id: string) {
        return this.approvalService.getApproval(id);
    }

    @Get('history')
    async getApprovalHistory(
        @Query('referenceId') referenceId: string,
        @Query('approvalType') approvalType: string,
    ) {
        return this.approvalService.getApprovalHistory(referenceId, approvalType);
    }
}
