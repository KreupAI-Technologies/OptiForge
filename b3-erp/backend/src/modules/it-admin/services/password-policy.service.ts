import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PasswordPolicy } from '../entities/password-policy.entity';

@Injectable()
export class PasswordPolicyService {
  constructor(
    @InjectRepository(PasswordPolicy)
    private readonly repository: Repository<PasswordPolicy>,
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
}
