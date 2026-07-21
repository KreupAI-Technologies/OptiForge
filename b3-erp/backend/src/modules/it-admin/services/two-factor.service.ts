import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { createHash, randomBytes } from 'crypto';
import { TwoFactorSetting } from '../entities/two-factor-setting.entity';
import { TwoFactorEnrollment } from '../entities/two-factor-enrollment.entity';
import { User } from '../entities/user.entity';
import { UpdateTwoFactorSettingDto } from '../dto/update-two-factor-setting.dto';

// Shape returned to the security/2fa "User Status" tab.
export interface TwoFactorEnrollmentStatus {
  id: string;
  userId: string;
  userName: string;
  email: string;
  department: string;
  role: string;
  status: string; // Enrolled | Pending | Not Enrolled
  method: string;
  enrolled: boolean;
  enrolledDate: string;
  lastVerifiedAt: string | null;
  backupCodes: number;
}

function methodLabel(method?: string): string {
  switch ((method || '').toLowerCase()) {
    case 'app':
    case 'totp':
    case 'authenticator app':
      return 'Authenticator App';
    case 'sms':
      return 'SMS';
    case 'email':
      return 'Email';
    default:
      return 'Not Set';
  }
}

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(TwoFactorSetting)
    private readonly settingRepository: Repository<TwoFactorSetting>,
    @InjectRepository(TwoFactorEnrollment)
    private readonly enrollmentRepository: Repository<TwoFactorEnrollment>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // --- Org settings (single row per company) ---

  async getSettings(companyId?: string): Promise<TwoFactorSetting> {
    let setting = await this.settingRepository.findOne({
      where: { companyId: companyId ? companyId : IsNull() },
      order: { createdAt: 'ASC' },
    });
    if (!setting) {
      setting = await this.settingRepository.save(
        this.settingRepository.create({
          companyId: companyId ?? undefined,
          enabled: true,
          required: false,
          allowedMethods: ['app', 'sms', 'email', 'backup'],
          gracePeriodDays: 30,
        }),
      );
    }
    return setting;
  }

  async saveSettings(
    data: UpdateTwoFactorSettingDto,
    companyId?: string,
  ): Promise<TwoFactorSetting> {
    const existing = await this.getSettings(companyId);
    Object.assign(existing, data, {
      companyId: companyId ?? existing.companyId,
    });
    return this.settingRepository.save(existing);
  }

  // --- Per-user enrollment statuses ---

  async listEnrollments(
    companyId?: string,
  ): Promise<TwoFactorEnrollmentStatus[]> {
    const enrollments = await this.enrollmentRepository.find({
      where: companyId ? { companyId } : {},
    });
    const byUserId = new Map(enrollments.map((e) => [e.userId, e]));

    // Merge enrollment rows over the user directory so newly-added users
    // surface as "Not Enrolled" without needing a pre-seeded row.
    const users = await this.userRepository.find({ order: { fullName: 'ASC' } });

    const rows: TwoFactorEnrollmentStatus[] = users.map((u) => {
      const e = byUserId.get(u.id);
      byUserId.delete(u.id);
      return this.toStatus(u.id, {
        enrollment: e,
        userName: u.fullName || u.username,
        email: u.email,
        department: u.department ?? '',
        role: (u as any).jobTitle ?? '',
      });
    });

    // Any enrollment rows without a matching user (external/seeded) still show.
    for (const e of byUserId.values()) {
      rows.push(
        this.toStatus(e.userId, {
          enrollment: e,
          userName: e.userName ?? '',
          email: e.userEmail ?? '',
          department: e.department ?? '',
          role: e.role ?? '',
        }),
      );
    }

    return rows;
  }

  private toStatus(
    userId: string,
    ctx: {
      enrollment?: TwoFactorEnrollment;
      userName: string;
      email: string;
      department: string;
      role: string;
    },
  ): TwoFactorEnrollmentStatus {
    const e = ctx.enrollment;
    const enrolled = !!e?.enrolled;
    let status = 'Not Enrolled';
    if (enrolled) status = 'Enrolled';
    else if (e && e.method && e.method !== 'Not Set') status = 'Pending';

    return {
      id: e?.id ?? userId,
      userId,
      userName: e?.userName || ctx.userName,
      email: e?.userEmail || ctx.email,
      department: e?.department || ctx.department,
      role: e?.role || ctx.role,
      status,
      method: methodLabel(e?.method),
      enrolled,
      enrolledDate:
        enrolled && e?.createdAt
          ? new Date(e.createdAt).toISOString().slice(0, 10)
          : '-',
      lastVerifiedAt: e?.lastVerifiedAt
        ? new Date(e.lastVerifiedAt).toISOString()
        : null,
      backupCodes: Array.isArray(e?.backupCodes) ? e!.backupCodes.length : 0,
    };
  }

  // Find (or lazily create) the enrollment row for a user so admin actions
  // always have a record to stamp.
  private async getOrCreateEnrollment(
    userId: string,
    companyId?: string,
  ): Promise<TwoFactorEnrollment> {
    let enrollment = await this.enrollmentRepository.findOne({
      where: { userId },
    });
    if (!enrollment) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      enrollment = this.enrollmentRepository.create({
        userId,
        companyId: companyId ?? undefined,
        userName: user ? user.fullName || user.username : undefined,
        userEmail: user?.email,
        department: user?.department ?? undefined,
        method: 'Not Set',
        enrolled: false,
      });
    }
    return enrollment;
  }

  // --- Admin actions ---

  async sendReminder(
    userId: string,
    companyId?: string,
  ): Promise<{ message: string; sentAt: string }> {
    const enrollment = await this.getOrCreateEnrollment(userId, companyId);
    enrollment.lastReminderAt = new Date();
    const saved = await this.enrollmentRepository.save(enrollment);
    return {
      message: `Enrollment reminder recorded for ${saved.userName || userId}`,
      sentAt: saved.lastReminderAt.toISOString(),
    };
  }

  async resetEnrollment(
    userId: string,
    companyId?: string,
  ): Promise<TwoFactorEnrollmentStatus> {
    const enrollment = await this.getOrCreateEnrollment(userId, companyId);
    enrollment.enrolled = false;
    enrollment.method = 'Not Set';
    enrollment.backupCodes = null as unknown as string[];
    enrollment.lastVerifiedAt = null as unknown as Date;
    const saved = await this.enrollmentRepository.save(enrollment);
    return this.toStatus(saved.userId, {
      enrollment: saved,
      userName: saved.userName ?? '',
      email: saved.userEmail ?? '',
      department: saved.department ?? '',
      role: saved.role ?? '',
    });
  }

  async generateBackupCodes(
    userId: string,
    companyId?: string,
    count?: number,
  ): Promise<{ codes: string[]; generatedAt: string }> {
    const setting = await this.getSettings(companyId);
    const requested =
      count ??
      (setting.config as any)?.methods?.backup?.codesCount ??
      10;
    const n = Math.min(Math.max(requested, 5), 20);

    const codes: string[] = [];
    for (let i = 0; i < n; i++) {
      // 10-char base32-ish code, grouped for readability (e.g. ABCD-EFGH-JK).
      const raw = randomBytes(8)
        .toString('hex')
        .toUpperCase()
        .replace(/[^0-9A-F]/g, '')
        .slice(0, 10);
      codes.push(`${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 10)}`);
    }

    const enrollment = await this.getOrCreateEnrollment(userId, companyId);
    // Persist only hashes; return the plaintext once to the caller.
    enrollment.backupCodes = codes.map((c) =>
      createHash('sha256').update(c).digest('hex'),
    );
    await this.enrollmentRepository.save(enrollment);

    return { codes, generatedAt: new Date().toISOString() };
  }
}
