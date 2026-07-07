import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UserSession, SessionStatus } from '../entities/user-session.entity';
import * as crypto from 'crypto';

@Injectable()
export class UserSessionService {
  constructor(
    @InjectRepository(UserSession)
    private readonly repository: Repository<UserSession>,
  ) {}

  async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
    expiresInMinutes: number = 1440, // 24 hours
  ): Promise<UserSession> {
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes);

    const session = this.repository.create({
      userId,
      sessionToken,
      refreshToken,
      status: SessionStatus.ACTIVE,
      ipAddress,
      userAgent,
      expiresAt,
      lastActivityAt: new Date(),
    });

    return await this.repository.save(session);
  }

  async findByToken(token: string): Promise<UserSession | null> {
    return await this.repository.findOne({
      where: { sessionToken: token, status: SessionStatus.ACTIVE },
      relations: ['user'],
    });
  }

  async getActiveSessions(userId: string): Promise<UserSession[]> {
    return await this.repository.find({
      where: { userId, status: SessionStatus.ACTIVE },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * List all active sessions across all users (for the IT-Admin session
   * management console). Joins the user relation so the page can render the
   * owning user's name/email/department without extra round trips.
   */
  async listAllActiveSessions(filters?: {
    status?: string;
    device?: string;
  }): Promise<UserSession[]> {
    const query = this.repository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.user', 'user')
      .orderBy('session.lastActivityAt', 'DESC', 'NULLS LAST');

    if (filters?.status) {
      query.andWhere('session.status = :status', { status: filters.status });
    } else {
      // Default to sessions that are still live.
      query.andWhere('session.status = :status', {
        status: SessionStatus.ACTIVE,
      });
    }

    if (filters?.device) {
      query.andWhere('LOWER(session.device) = LOWER(:device)', {
        device: filters.device,
      });
    }

    return await query.getMany();
  }

  /**
   * Global session statistics across all users for the console stat cards.
   */
  async getGlobalStatistics(): Promise<{
    totalSessions: number;
    activeSessions: number;
    uniqueUsers: number;
    mobileDevices: number;
    byStatus: Record<string, number>;
  }> {
    const active = await this.listAllActiveSessions();

    const uniqueUsers = new Set(active.map((s) => s.userId)).size;
    const mobileDevices = active.filter((s) => {
      const d = (s.device || '').toLowerCase();
      return d === 'mobile' || d === 'tablet';
    }).length;

    const byStatusRaw = await this.repository
      .createQueryBuilder('session')
      .select('session.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('session.status')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    for (const row of byStatusRaw) {
      byStatus[row.status] = parseInt(row.count, 10);
    }

    return {
      totalSessions: active.length,
      activeSessions: active.length,
      uniqueUsers,
      mobileDevices,
      byStatus,
    };
  }

  async updateActivity(sessionId: string): Promise<void> {
    await this.repository.update(sessionId, {
      lastActivityAt: new Date(),
    });
  }

  async logout(sessionId: string): Promise<void> {
    await this.repository.update(sessionId, {
      status: SessionStatus.LOGGED_OUT,
      loggedOutAt: new Date(),
    });
  }

  async logoutByToken(token: string): Promise<void> {
    const session = await this.repository.findOne({
      where: { sessionToken: token },
    });

    if (session) {
      await this.logout(session.id);
    }
  }

  async terminateSession(
    sessionId: string,
    terminatedBy: string,
    reason: string,
  ): Promise<void> {
    await this.repository.update(sessionId, {
      status: SessionStatus.TERMINATED,
      terminatedAt: new Date(),
      terminatedBy,
      terminationReason: reason,
    });
  }

  async terminateAllUserSessions(
    userId: string,
    terminatedBy: string,
    reason: string,
  ): Promise<number> {
    const sessions = await this.getActiveSessions(userId);

    for (const session of sessions) {
      await this.terminateSession(session.id, terminatedBy, reason);
    }

    return sessions.length;
  }

  async cleanExpiredSessions(): Promise<number> {
    const expiredSessions = await this.repository.find({
      where: {
        status: SessionStatus.ACTIVE,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const session of expiredSessions) {
      session.status = SessionStatus.EXPIRED;
      await this.repository.save(session);
    }

    return expiredSessions.length;
  }

  async getSessionStatistics(userId?: string): Promise<any> {
    const query = this.repository.createQueryBuilder('session');

    if (userId) {
      query.where('session.userId = :userId', { userId });
    }

    const total = await query.getCount();

    const active = await query
      .andWhere('session.status = :status', { status: SessionStatus.ACTIVE })
      .getCount();

    const byStatus = await this.repository
      .createQueryBuilder('session')
      .select('session.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('session.status')
      .getRawMany();

    return {
      total,
      active,
      byStatus,
    };
  }
}
