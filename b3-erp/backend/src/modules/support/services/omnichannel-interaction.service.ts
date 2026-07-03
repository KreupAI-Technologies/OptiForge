import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { OmnichannelInteraction } from '../entities/omnichannel-interaction.entity';

export interface FindOmnichannelOptions {
  channel?: string;
  status?: string;
  search?: string;
}

@Injectable()
export class OmnichannelInteractionService implements OnModuleInit {
  constructor(
    @InjectRepository(OmnichannelInteraction)
    private readonly repo: Repository<OmnichannelInteraction>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.seedIfEmpty();
  }

  async findAll(
    companyId: string,
    options?: FindOmnichannelOptions,
  ): Promise<OmnichannelInteraction[]> {
    const where: Record<string, unknown> = { companyId };
    if (options?.channel && options.channel !== 'all') {
      where.channel = options.channel;
    }
    if (options?.status) {
      where.status = options.status;
    }

    if (options?.search) {
      const term = `%${options.search}%`;
      return this.repo.find({
        where: [
          { ...where, subject: ILike(term) },
          { ...where, customerName: ILike(term) },
          { ...where, ticketId: ILike(term) },
        ],
        order: { updatedAt: 'DESC' },
      });
    }

    return this.repo.find({ where, order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string): Promise<OmnichannelInteraction> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException(`Interaction ${id} not found`);
    return found;
  }

  private async seedIfEmpty(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) return;

    const companyId = 'company-1';
    const rows: Array<Partial<OmnichannelInteraction>> = [
      {
        companyId,
        ticketId: 'TKT-2025-001',
        subject: 'Cannot access my account',
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        channel: 'email',
        lastMessage:
          'I have been trying to reset my password but the email never arrives...',
        lastMessageTime: '5 min ago',
        unreadCount: 3,
        priority: 'high',
        status: 'open',
        assignedToName: 'Agent Smith',
        tags: ['password', 'urgent'],
        starred: true,
        hasAttachments: false,
        slaDeadline: '1h 45m remaining',
      },
      {
        companyId,
        ticketId: 'TKT-2025-002',
        subject: 'Product inquiry - Hydraulic Press',
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@manufacturing.com',
        channel: 'chat',
        lastMessage: 'What are the specifications for the HP-500 model?',
        lastMessageTime: '12 min ago',
        unreadCount: 1,
        priority: 'medium',
        status: 'open',
        assignedToName: 'Agent Johnson',
        hasAttachments: false,
        slaDeadline: '3h 20m remaining',
      },
      {
        companyId,
        ticketId: 'TKT-2025-003',
        subject: 'Order status inquiry',
        customerName: 'Bob Wilson',
        customerEmail: 'bob.w@techcorp.com',
        channel: 'whatsapp',
        lastMessage:
          'Hi, I placed order #ORD-12345 last week. When will it ship?',
        lastMessageTime: '25 min ago',
        unreadCount: 0,
        priority: 'low',
        status: 'pending',
        assignedToName: 'Agent Davis',
        tags: ['order', 'shipping'],
        hasAttachments: true,
        slaDeadline: '5h 10m remaining',
      },
      {
        companyId,
        ticketId: 'TKT-2025-004',
        subject: 'Urgent: Machine malfunction',
        customerName: 'Sarah Johnson',
        customerEmail: 'sarah.j@industrial.com',
        channel: 'phone',
        lastMessage:
          'Our CNC machine stopped working. Need immediate assistance!',
        lastMessageTime: '2 min ago',
        unreadCount: 5,
        priority: 'critical',
        status: 'open',
        tags: ['emergency', 'machine'],
        starred: true,
        hasAttachments: false,
        slaDeadline: '30m remaining',
      },
      {
        companyId,
        ticketId: 'TKT-2025-005',
        subject: 'Billing question',
        customerName: 'Mike Brown',
        customerEmail: 'mike.brown@finance.com',
        channel: 'email',
        lastMessage:
          "I see a charge on my account that I don't recognize...",
        lastMessageTime: '1 hour ago',
        unreadCount: 0,
        priority: 'medium',
        status: 'resolved',
        assignedToName: 'Agent Martinez',
        tags: ['billing'],
        hasAttachments: true,
      },
    ];

    await this.repo.save(rows.map((r) => this.repo.create(r)));
  }
}
