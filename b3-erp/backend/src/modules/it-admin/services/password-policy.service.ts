import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PasswordPolicy } from '../entities/password-policy.entity';
import { User } from '../entities/user.entity';

// Per-user password status row derived from the user record + active policy.
export interface UserPasswordStatus {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  lastChanged: string | null;
  daysOld: number | null;
  status: string; // Active | Expiring Soon | Expired | Locked | Never Set
  strength: string; // Strong | Medium | Weak | Unknown
  expiresIn: number | null; // days remaining (negative = overdue)
  failedAttempts: number;
  locked: boolean;
}

@Injectable()
export class PasswordPolicyService {
  constructor(
    @InjectRepository(PasswordPolicy)
    private readonly repository: Repository<PasswordPolicy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Returns the single policy row for a company, creating a default if absent.
  async get(companyId?: string): Promise<PasswordPolicy> {
    let policy = await this.repository.findOne({
      where: { companyId: companyId ? companyId : IsNull() },
      order: { createdAt: 'ASC' },
    });
    if (!policy) {
      policy = await this.repository.save(
        this.repository.create({ companyId: companyId ?? undefined }),
      );
    }
    return policy;
  }

  async upsert(
    data: Partial<PasswordPolicy>,
    companyId?: string,
  ): Promise<PasswordPolicy> {
    const existing = await this.get(companyId);
    Object.assign(existing, data, {
      companyId: companyId ?? existing.companyId,
    });
    return this.repository.save(existing);
  }

  // Read-only aggregation for the security/password "User Password Status" tab.
  // Derives status/expiry purely from existing user fields + the active policy;
  // no new tables and no password material is exposed.
  async getUserPasswordStatuses(
    companyId?: string,
  ): Promise<UserPasswordStatus[]> {
    const policy = await this.get(companyId);
    const expiryDays = policy.expiryDays ?? 0;
    const lockoutThreshold = policy.lockoutThreshold ?? 0;
    const now = Date.now();
    const DAY = 1000 * 60 * 60 * 24;

    const users = await this.userRepository.find({
      order: { fullName: 'ASC' },
    });

    return users.map((u): UserPasswordStatus => {
      const changed = u.passwordChangedAt ? new Date(u.passwordChangedAt) : null;
      const daysOld = changed
        ? Math.floor((now - changed.getTime()) / DAY)
        : null;
      const expiresIn =
        expiryDays > 0 && daysOld !== null ? expiryDays - daysOld : null;

      const locked =
        u.status === 'Locked' ||
        (!!u.lockedUntil && new Date(u.lockedUntil).getTime() > now) ||
        (lockoutThreshold > 0 &&
          (u.failedLoginAttempts ?? 0) >= lockoutThreshold);

      let status: string;
      if (locked) {
        status = 'Locked';
      } else if (!changed) {
        status = 'Never Set';
      } else if (expiresIn !== null && expiresIn < 0) {
        status = 'Expired';
      } else if (expiresIn !== null && expiresIn <= 14) {
        status = 'Expiring Soon';
      } else {
        status = 'Active';
      }

      return {
        id: u.id,
        userId: u.id,
        userName: u.fullName || u.username,
        email: u.email,
        department: u.department ?? '',
        lastChanged: changed ? changed.toISOString().slice(0, 10) : null,
        daysOld,
        status,
        strength: 'Unknown',
        expiresIn,
        failedAttempts: u.failedLoginAttempts ?? 0,
        locked,
      };
    });
  }
}
