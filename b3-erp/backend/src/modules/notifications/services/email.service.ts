import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Notification as PrismaNotification } from '@prisma/client';
import { UserService } from '../../it-admin/services/user.service';

@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(EmailService.name);

    constructor(private readonly userService: UserService) {
        // Configure email transporter
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    /**
     * Send notification email
     */
    async sendNotificationEmail(notification: PrismaNotification): Promise<boolean> {
        try {
            const userEmail = await this.getUserEmail(notification.userId);
            if (!userEmail) {
                this.logger.warn(`No email found for user ${notification.userId}`);
                return false;
            }

            const htmlContent = this.generateEmailTemplate(notification);

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"ERP System" <noreply@erp.com>',
                to: userEmail,
                subject: notification.title,
                html: htmlContent,
            });

            this.logger.log(`✅ Email sent to ${userEmail} for notification ${notification.id}`);
            return true;
        } catch (error) {
            this.logger.error('❌ Failed to send email:', error);
            return false;
        }
    }

    /**
     * Send a generic transactional email (arbitrary recipient/subject/body).
     * Used by finance reminder delivery, scheduled reports, and automation rules.
     */
    async sendMail(to: string, subject: string, html: string, text?: string): Promise<boolean> {
        try {
            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"ERP System" <noreply@erp.com>',
                to,
                subject,
                html,
                text,
            });

            this.logger.log(`✅ Email sent to ${to} (subject: "${subject}")`);
            return true;
        } catch (error) {
            this.logger.error(`❌ Failed to send email to ${to}:`, error);
            return false;
        }
    }

    /**
     * Send daily digest email
     */
    async sendDailyDigest(userId: string, notifications: PrismaNotification[]): Promise<boolean> {
        try {
            const userEmail = await this.getUserEmail(userId);
            if (!userEmail || notifications.length === 0) {
                return false;
            }

            const htmlContent = this.generateDigestTemplate(notifications);

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || '"ERP System" <noreply@erp.com>',
                to: userEmail,
                subject: `Daily Digest - ${notifications.length} Pending Approvals`,
                html: htmlContent,
            });

            this.logger.log(`✅ Daily digest sent to ${userEmail}`);
            return true;
        } catch (error) {
            this.logger.error('❌ Failed to send daily digest:', error);
            return false;
        }
    }

    /**
     * Generate HTML email template
     */
    private generateEmailTemplate(notification: PrismaNotification): string {
        const priorityColors: Record<string, string> = {
            info: '#3b82f6',
            warning: '#f59e0b',
            urgent: '#ef4444',
        };

        const color = priorityColors[notification.priority] || priorityColors.info;

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${color}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; padding: 12px 24px; background: ${color}; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">${notification.title}</h2>
        </div>
        <div class="content">
            <p>${notification.message}</p>
            ${notification.actionUrl ? `<a href="${process.env.FRONTEND_URL}${notification.actionUrl}" class="button">View Details</a>` : ''}
        </div>
        <div class="footer">
            <p>This is an automated notification from ERP System</p>
            <p>© ${new Date().getFullYear()} Manufacturing ERP. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Generate daily digest template
     */
    private generateDigestTemplate(notifications: PrismaNotification[]): string {
        const notificationItems = notifications
            .map(
                (n) => `
            <li style="margin-bottom: 15px; padding: 15px; background: white; border-left: 3px solid #3b82f6;">
                <strong>${n.title}</strong><br/>
                <span style="color: #6b7280; font-size: 14px;">${n.message}</span>
            </li>
        `,
            )
            .join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        ul { list-style: none; padding: 0; }
        .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2 style="margin: 0;">Daily Approval Digest</h2>
        </div>
        <div class="content">
            <p>You have <strong>${notifications.length}</strong> pending approval(s):</p>
            <ul>${notificationItems}</ul>
            <a href="${process.env.FRONTEND_URL}/workflow/approvals" class="button">View All Approvals</a>
        </div>
    </div>
</body>
</html>
        `;
    }

    /**
     * Get user email by ID
     */
    private async getUserEmail(userId: string): Promise<string | null> {
        try {
            const user = await this.userService.findOne(userId);
            return user?.email || null;
        } catch (error) {
            this.logger.warn(`Failed to fetch email for user ${userId}: ${error.message}`);
            return null;
        }
    }
}
