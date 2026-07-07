import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Notification as PrismaNotification } from '@prisma/client';
import { EmailService } from './email.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface CreateNotificationDto {
    userId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    priority?: string;
    actionUrl?: string;
    sendEmail?: boolean;
}

@Injectable()
export class NotificationService {
    constructor(
        private prisma: PrismaService,
        private emailService: EmailService,
        private eventEmitter: EventEmitter2,
    ) { }

    /**
     * Create a new notification
     */
    async createNotification(dto: CreateNotificationDto): Promise<PrismaNotification> {
        const notification = await this.prisma.notification.create({
            data: {
                userId: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                metadata: (dto.metadata as any) || {},
                priority: dto.priority || 'info',
                actionUrl: dto.actionUrl,
            },
        });

        // Emit event for real-time updates
        this.eventEmitter.emit('notification.created', {
            userId: dto.userId,
            notification,
        });

        // Send email if requested
        if (dto.sendEmail) {
            // Convert Prisma notification to expected type for EmailService if necessary
            // In this case, the structures are identical enough
            await this.emailService.sendNotificationEmail(notification as any);
        }

        return notification;
    }

    /**
     * Get unread notifications for a user
     */
    async getUnreadNotifications(userId: string): Promise<PrismaNotification[]> {
        return this.prisma.notification.findMany({
            where: { userId, isRead: false },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }

    /**
     * Get all notifications for a user with pagination
     */
    async getUserNotifications(
        userId: string,
        page: number = 1,
        limit: number = 20,
    ): Promise<{ notifications: PrismaNotification[]; total: number }> {
        const [notifications, total] = await Promise.all([
            this.prisma.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.notification.count({
                where: { userId },
            }),
        ]);

        return { notifications, total };
    }

    /**
     * Mark notification as read
     */
    async markAsRead(notificationId: string, userId: string): Promise<boolean> {
        const result = await this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });

        if (result.count > 0) {
            this.eventEmitter.emit('notification.read', { userId, notificationId });
            return true;
        }
        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<number> {
        const result = await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        this.eventEmitter.emit('notifications.all_read', { userId });
        return result.count;
    }

    /**
     * Get unread count
     */
    async getUnreadCount(userId: string): Promise<number> {
        return this.prisma.notification.count({
            where: { userId, isRead: false },
        });
    }

    /**
     * Get notification preferences for a user. Returns the stored preferences
     * blob, or sensible defaults when the user has none yet.
     */
    async getPreferences(userId: string): Promise<{ userId: string; preferences: Record<string, any> }> {
        const row = await this.prisma.notificationPreference.findUnique({
            where: { userId },
        });

        return {
            userId,
            preferences: (row?.preferences as Record<string, any>) ?? this.defaultPreferences(),
        };
    }

    /**
     * Create or update (upsert) notification preferences for a user.
     */
    async savePreferences(
        userId: string,
        preferences: Record<string, any>,
    ): Promise<{ userId: string; preferences: Record<string, any> }> {
        const row = await this.prisma.notificationPreference.upsert({
            where: { userId },
            create: { userId, preferences: (preferences as any) ?? {} },
            update: { preferences: (preferences as any) ?? {} },
        });

        return {
            userId,
            preferences: row.preferences as Record<string, any>,
        };
    }

    private defaultPreferences(): Record<string, any> {
        return {
            enabled: true,
            pushEnabled: false,
            soundEnabled: true,
            categories: {
                alert: { enabled: true, push: true, sound: true },
                approval: { enabled: true, push: true, sound: true },
                mention: { enabled: true, push: true, sound: false },
                update: { enabled: true, push: false, sound: false },
                reminder: { enabled: true, push: true, sound: true },
                system: { enabled: true, push: false, sound: false },
            },
            modules: {},
            quietHours: { enabled: false, start: '22:00', end: '08:00' },
        };
    }

    /**
     * Delete old read notifications
     */
    async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const result = await this.prisma.notification.deleteMany({
            where: {
                isRead: true,
                createdAt: { lt: cutoffDate },
            },
        });

        return result.count;
    }

    /**
     * Helper methods for specific notification types
     */
    async notifyApprovalAssigned(
        userId: string,
        approvalId: string,
        workflowName: string,
        entityId: string,
    ) {
        return this.createNotification({
            userId,
            type: 'approval_assigned',
            title: 'New Approval Request',
            message: `You have a new ${workflowName} approval request for ${entityId}`,
            metadata: { approvalId, workflowName, entityId },
            priority: 'warning',
            actionUrl: `/workflow/approvals?id=${approvalId}`,
            sendEmail: true,
        });
    }

    async notifyApprovalApproved(
        userId: string,
        approvalId: string,
        approverName: string,
        workflowName: string,
    ) {
        return this.createNotification({
            userId,
            type: 'approval_approved',
            title: 'Approval Granted',
            message: `${approverName} approved your ${workflowName} request`,
            metadata: { approvalId, approverName, workflowName },
            priority: 'info',
            actionUrl: `/workflow/approvals?id=${approvalId}`,
            sendEmail: false,
        });
    }

    async notifyApprovalRejected(
        userId: string,
        approvalId: string,
        approverName: string,
        workflowName: string,
        reason: string,
    ) {
        return this.createNotification({
            userId,
            type: 'approval_rejected',
            title: 'Approval Rejected',
            message: `${approverName} rejected your ${workflowName} request: ${reason}`,
            metadata: { approvalId, approverName, workflowName, reason },
            priority: 'urgent',
            actionUrl: `/workflow/approvals?id=${approvalId}`,
            sendEmail: true,
        });
    }

    async notifySLAApproaching(
        userId: string,
        approvalId: string,
        workflowName: string,
        hoursRemaining: number,
    ) {
        return this.createNotification({
            userId,
            type: 'sla_approaching',
            title: 'SLA Deadline Approaching',
            message: `${workflowName} approval due in ${hoursRemaining} hours`,
            metadata: { approvalId, workflowName, hoursRemaining },
            priority: 'warning',
            actionUrl: `/workflow/approvals?id=${approvalId}`,
            sendEmail: true,
        });
    }

    async notifySLABreached(
        userId: string,
        approvalId: string,
        workflowName: string,
    ) {
        return this.createNotification({
            userId,
            type: 'sla_breached',
            title: 'SLA Deadline Breached',
            message: `${workflowName} approval is overdue`,
            metadata: { approvalId, workflowName },
            priority: 'urgent',
            actionUrl: `/workflow/approvals?id=${approvalId}`,
            sendEmail: true,
        });
    }

    async notifyEscalation(
        userId: string,
        approvalId: string,
        workflowName: string,
        originalApprover: string,
    ) {
        return this.createNotification({
            userId,
            type: 'escalation',
            title: 'Approval Escalated to You',
            message: `${workflowName} escalated from ${originalApprover} due to SLA breach`,
            metadata: { approvalId, workflowName, originalApprover },
            priority: 'urgent',
            actionUrl: `/workflow/approvals?id=${approvalId}`,
            sendEmail: true,
        });
    }
}
