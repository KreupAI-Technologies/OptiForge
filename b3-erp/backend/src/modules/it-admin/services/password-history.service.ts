import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import {
  PasswordHistory,
  PasswordChangeReason,
} from '../entities/password-history.entity';

@Injectable()
export class PasswordHistoryService {
  constructor(
    @InjectRepository(PasswordHistory)
    private readonly repository: Repository<PasswordHistory>,
  ) {}

  async createHistory(
    userId: string,
    passwordHash: string,
    reason: PasswordChangeReason | string,
    changedBy?: string,
    changedByIp?: string,
  ): Promise<PasswordHistory> {
    const history = this.repository.create({
      userId,
      passwordHash,
      changeReason: reason as PasswordChangeReason,
      changedBy,
      changedByIp,
    });

    return await this.repository.save(history);
  }

  async getUserHistory(
    userId: string,
    limit: number = 10,
  ): Promise<PasswordHistory[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async canUsePassword(
    userId: string,
    newPassword: string,
    historyCount: number = 5,
  ): Promise<boolean> {
    const history = await this.getUserHistory(userId, historyCount);

    for (const record of history) {
      const isSame = await bcrypt.compare(newPassword, record.passwordHash);
      if (isSame) {
        return false;
      }
    }

    return true;
  }

  async cleanOldHistory(userId: string, keepLast: number = 10): Promise<number> {
    const allHistory = await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (allHistory.length <= keepLast) {
      return 0;
    }

    const toDelete = allHistory.slice(keepLast);
    await this.repository.remove(toDelete);

    return toDelete.length;
  }
}
