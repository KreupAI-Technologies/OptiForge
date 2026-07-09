import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AlertRule } from '../entities/alert-rule.entity';

// Default alert rules seeded on first read so the security/alerts "Alert Rules"
// tab is populated out of the box. Mirrors the rules the UI previously hard-coded.
const DEFAULT_RULES: Partial<AlertRule>[] = [
  {
    name: 'Multiple Failed Login Attempts',
    description: 'Alert when user has 3+ failed login attempts in 10 minutes',
    category: 'Authentication',
    severity: 'High',
    enabled: true,
    conditions: ['Failed login count >= 3', 'Time window = 10 minutes'],
    actions: ['Lock account for 30 minutes', 'Send alert to security team'],
    notifyVia: ['Email', 'SMS'],
    recipients: ['security@company.com', 'IT Admin'],
  },
  {
    name: 'Access from New Location',
    description: 'Alert when user logs in from a new country or city',
    category: 'Behavior',
    severity: 'Medium',
    enabled: true,
    conditions: ['Location not in user profile', 'First access from location'],
    actions: ['Require additional verification', 'Log event'],
    notifyVia: ['Email'],
    recipients: ['User', 'security@company.com'],
  },
  {
    name: 'Privilege Escalation Attempt',
    description:
      'Alert when user attempts to access resources above their permission level',
    category: 'Access Control',
    severity: 'Critical',
    enabled: true,
    conditions: [
      'Access denied due to insufficient permissions',
      'Admin panel access attempt',
    ],
    actions: ['Block access', 'Create incident', 'Alert security team'],
    notifyVia: ['Email', 'SMS', 'Push'],
    recipients: ['Security Admin', 'IT Manager'],
  },
  {
    name: 'Weak Password Usage',
    description:
      "Alert when user sets a password that doesn't meet security requirements",
    category: 'Password',
    severity: 'Medium',
    enabled: true,
    conditions: ['Password strength score < 3', 'Common password detected'],
    actions: ['Reject password', 'Force password change', 'Send security tips'],
    notifyVia: ['Email'],
    recipients: ['User'],
  },
  {
    name: 'Unusual Data Access Pattern',
    description: 'Alert when user accesses unusually large amount of data',
    category: 'Data Access',
    severity: 'High',
    enabled: true,
    conditions: ['Record access > 500 in 1 hour', 'Bulk download initiated'],
    actions: ['Log activity', 'Alert supervisor', 'Require justification'],
    notifyVia: ['Email'],
    recipients: ['User Manager', 'DLP Admin'],
  },
  {
    name: 'Session Timeout Warning',
    description: 'Alert user before session expires due to inactivity',
    category: 'Session',
    severity: 'Low',
    enabled: true,
    conditions: ['Idle time > 25 minutes', 'Session timeout = 30 minutes'],
    actions: ['Display warning popup', 'Extend session if user responds'],
    notifyVia: ['In-App'],
    recipients: ['User'],
  },
];

@Injectable()
export class AlertRuleService {
  constructor(
    @InjectRepository(AlertRule)
    private readonly repository: Repository<AlertRule>,
  ) {}

  async findAll(filters?: {
    companyId?: string;
    category?: string;
    severity?: string;
  }): Promise<AlertRule[]> {
    const where: Record<string, any> = {};
    if (filters?.companyId) where.companyId = filters.companyId;
    if (filters?.category && filters.category !== 'all')
      where.category = filters.category;
    if (filters?.severity && filters.severity !== 'all')
      where.severity = filters.severity;

    let rules = await this.repository.find({
      where,
      order: { createdAt: 'ASC' },
    });

    // Seed defaults on first access (scoped to the requested company, if any).
    if (rules.length === 0 && !filters?.category && !filters?.severity) {
      const scoped = filters?.companyId ?? undefined;
      const existing = await this.repository.count({
        where: { companyId: scoped ? scoped : IsNull() },
      });
      if (existing === 0) {
        await this.repository.save(
          DEFAULT_RULES.map((r) =>
            this.repository.create({ ...r, companyId: scoped }),
          ),
        );
        rules = await this.repository.find({
          where,
          order: { createdAt: 'ASC' },
        });
      }
    }

    return rules;
  }

  async findOne(id: string): Promise<AlertRule> {
    const rule = await this.repository.findOne({ where: { id } });
    if (!rule) throw new NotFoundException(`Alert rule ${id} not found`);
    return rule;
  }

  async create(data: Partial<AlertRule>): Promise<AlertRule> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: string, data: Partial<AlertRule>): Promise<AlertRule> {
    const rule = await this.findOne(id);
    Object.assign(rule, data);
    return this.repository.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findOne(id);
    await this.repository.remove(rule);
  }
}
