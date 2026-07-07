import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    DefaultValuePipe,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { NotificationService, CreateNotificationDto } from './services/notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationService: NotificationService) { }

    /**
     * POST /notifications
     * Create a new notification for a user
     */
    @Post()
    @ApiOperation({ summary: 'Create a new in-app notification' })
    @ApiResponse({ status: 201, description: 'Notification created successfully' })
    create(@Body() dto: CreateNotificationDto) {
        return this.notificationService.createNotification(dto);
    }

    /**
     * GET /notifications/user/:userId
     * Paginated list of all notifications for a user
     */
    @Get('user/:userId')
    @ApiOperation({ summary: 'Get paginated notifications for a user' })
    @ApiParam({ name: 'userId', description: 'User UUID' })
    @ApiQuery({ name: 'page', required: false, description: 'Page number (default: 1)' })
    @ApiQuery({ name: 'limit', required: false, description: 'Items per page (default: 20)' })
    @ApiResponse({ status: 200, description: 'Paginated notifications list' })
    findAll(
        @Param('userId') userId: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    ) {
        return this.notificationService.getUserNotifications(userId, page, limit);
    }

    /**
     * GET /notifications/user/:userId/unread
     * Unread notifications for a user (max 50)
     */
    @Get('user/:userId/unread')
    @ApiOperation({ summary: 'Get unread notifications for a user' })
    @ApiParam({ name: 'userId', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'List of unread notifications' })
    findUnread(@Param('userId') userId: string) {
        return this.notificationService.getUnreadNotifications(userId);
    }

    /**
     * GET /notifications/user/:userId/unread-count
     * Count of unread notifications for a user
     */
    @Get('user/:userId/unread-count')
    @ApiOperation({ summary: 'Get unread notification count for a user' })
    @ApiParam({ name: 'userId', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'Unread count' })
    async getUnreadCount(@Param('userId') userId: string) {
        const count = await this.notificationService.getUnreadCount(userId);
        return { count };
    }

    /**
     * PATCH /notifications/:id/read
     * Mark a single notification as read
     */
    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark a notification as read' })
    @ApiParam({ name: 'id', description: 'Notification UUID' })
    @ApiResponse({ status: 200, description: 'Notification marked as read' })
    markAsRead(
        @Param('id') id: string,
        @Body() body: { userId: string },
    ) {
        return this.notificationService.markAsRead(id, body.userId);
    }

    /**
     * PATCH /notifications/user/:userId/read-all
     * Mark all notifications as read for a user
     */
    @Patch('user/:userId/read-all')
    @ApiOperation({ summary: 'Mark all notifications as read for a user' })
    @ApiParam({ name: 'userId', description: 'User UUID' })
    @ApiResponse({ status: 200, description: 'All notifications marked as read' })
    markAllAsRead(@Param('userId') userId: string) {
        return this.notificationService.markAllAsRead(userId);
    }

    /**
     * GET /notifications/preferences/:userId
     * Get notification preferences for a user (defaults if none saved yet)
     */
    @Get('preferences/:userId')
    @ApiOperation({ summary: 'Get notification preferences for a user' })
    @ApiParam({ name: 'userId', description: 'User identifier' })
    @ApiResponse({ status: 200, description: 'User notification preferences' })
    getPreferences(@Param('userId') userId: string) {
        return this.notificationService.getPreferences(userId);
    }

    /**
     * PUT /notifications/preferences/:userId
     * Create or update notification preferences for a user
     */
    @Put('preferences/:userId')
    @ApiOperation({ summary: 'Save (upsert) notification preferences for a user' })
    @ApiParam({ name: 'userId', description: 'User identifier' })
    @ApiResponse({ status: 200, description: 'Updated notification preferences' })
    savePreferences(
        @Param('userId') userId: string,
        @Body() body: { preferences: Record<string, any> },
    ) {
        return this.notificationService.savePreferences(userId, body?.preferences ?? {});
    }

    /**
     * DELETE /notifications/cleanup
     * Remove old read notifications (admin operation)
     */
    @Delete('cleanup')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Cleanup old read notifications (admin)' })
    @ApiQuery({ name: 'daysOld', required: false, description: 'Days old threshold (default: 30)' })
    @ApiResponse({ status: 200, description: 'Cleanup result with count of notifications removed' })
    cleanup(
        @Query('daysOld', new DefaultValuePipe(30), ParseIntPipe) daysOld: number,
    ) {
        return this.notificationService.cleanupOldNotifications(daysOld).then((count) => ({
            message: `Removed ${count} old notifications`,
            count,
        }));
    }
}
