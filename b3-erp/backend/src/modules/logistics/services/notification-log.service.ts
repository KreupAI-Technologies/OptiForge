import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../entities/notification-log.entity';

export interface NotifyRequest {
  audience: string;
  channel?: string;
  projectId?: string;
  woNumber?: string;
  coordinationId?: string;
  subject?: string;
  message?: string;
  recipients?: unknown;
  createdBy?: string;
}

@Injectable()
export class NotificationLogService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly repo: Repository<NotificationLog>,
  ) {}

  /**
   * Persist a notification record. Does not integrate a real provider — the
   * record is stored with status 'sent' to represent an outbound notification.
   */
  async notify(req: NotifyRequest): Promise<NotificationLog> {
    const recipientList = Array.isArray(req.recipients)
      ? req.recipients
      : req.recipients
        ? [req.recipients]
        : [];

    const entity = this.repo.create({
      audience: req.audience || 'other',
      channel: req.channel || 'in_app',
      projectId: req.projectId,
      woNumber: req.woNumber,
      coordinationId: req.coordinationId,
      subject: req.subject,
      message: req.message,
      recipients: recipientList.length
        ? JSON.stringify(recipientList)
        : undefined,
      recipientCount: recipientList.length,
      status: 'sent',
      createdBy: req.createdBy,
    });

    return this.repo.save(entity);
  }

  async findAll(filters?: {
    audience?: string;
    projectId?: string;
    coordinationId?: string;
  }): Promise<NotificationLog[]> {
    const query = this.repo.createQueryBuilder('log');
    if (filters?.audience) {
      query.andWhere('log.audience = :audience', { audience: filters.audience });
    }
    if (filters?.projectId) {
      query.andWhere('log.projectId = :projectId', {
        projectId: filters.projectId,
      });
    }
    if (filters?.coordinationId) {
      query.andWhere('log.coordinationId = :coordinationId', {
        coordinationId: filters.coordinationId,
      });
    }
    query.orderBy('log.createdAt', 'DESC');
    return query.getMany();
  }
}
