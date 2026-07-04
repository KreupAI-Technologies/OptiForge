import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { PaymentService } from '../../src/modules/finance/services/payment.service';
import { Payment, PaymentStatus } from '../../src/modules/finance/entities/payment.entity';
import { createMockRepository } from '../utils/test-setup';

describe('PaymentService', () => {
  let service: PaymentService;
  let repo: jest.Mocked<Repository<Payment>>;

  beforeEach(async () => {
    repo = createMockRepository<Payment>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        { provide: getRepositoryToken(Payment), useValue: repo },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
      ],
    }).compile();
    service = module.get(PaymentService);
  });

  describe('create', () => {
    it('computes base currency amount using the exchange rate and defaults status', async () => {
      repo.count.mockResolvedValue(4);
      const dto: any = { paymentType: 'Payment', amount: 100, exchangeRate: 1.5 };
      repo.create.mockImplementation((d: any) => d);
      repo.save.mockImplementation(async (d: any) => d);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseCurrencyAmount: 150,
          status: PaymentStatus.DRAFT,
          isPosted: false,
          isReconciled: false,
        }),
      );
      // PAY prefix + zero-padded (count+1)
      expect(result.paymentNumber).toMatch(/^PAY-\d{4}-000005$/);
    });

    it('defaults exchange rate to 1 when not supplied', async () => {
      repo.count.mockResolvedValue(0);
      repo.create.mockImplementation((d: any) => d);
      repo.save.mockImplementation(async (d: any) => d);
      await service.create({ paymentType: 'Receipt', amount: 200 } as any);
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ baseCurrencyAmount: 200 }),
      );
    });
  });

  describe('update', () => {
    it('blocks updating a posted payment', async () => {
      repo.findOne.mockResolvedValue({ id: 'p1', isPosted: true } as any);
      await expect(service.update('p1', {} as any)).rejects.toThrow('Cannot update posted payment');
    });

    it('throws NotFound when payment missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.update('missing', {} as any)).rejects.toThrow(NotFoundException);
    });
  });

  describe('postToGL', () => {
    it('marks posted, stamps date and sets PROCESSED status', async () => {
      const p: any = { id: 'p1', isPosted: false };
      repo.findOne.mockResolvedValue(p);
      repo.save.mockResolvedValue(p);
      await service.postToGL('p1');
      expect(p.isPosted).toBe(true);
      expect(p.status).toBe(PaymentStatus.PROCESSED);
      expect(p.postedAt).toBeInstanceOf(Date);
    });

    it('rejects double posting', async () => {
      repo.findOne.mockResolvedValue({ id: 'p1', isPosted: true } as any);
      await expect(service.postToGL('p1')).rejects.toThrow('Payment already posted');
    });
  });

  describe('markBounced', () => {
    it('records bounce reason, date and status', async () => {
      const p: any = { id: 'p1' };
      repo.findOne.mockResolvedValue(p);
      repo.save.mockResolvedValue(p);
      const result = await service.markBounced('p1', 'NSF');
      expect(result.isBounced).toBe(true);
      expect(result.bounceReason).toBe('NSF');
      expect(result.status).toBe(PaymentStatus.BOUNCED);
    });
  });

  describe('reconcile', () => {
    it('sets reconciled flag, date and status', async () => {
      const p: any = { id: 'p1' };
      repo.findOne.mockResolvedValue(p);
      repo.save.mockResolvedValue(p);
      const result = await service.reconcile('p1');
      expect(result.isReconciled).toBe(true);
      expect(result.status).toBe(PaymentStatus.RECONCILED);
      expect(result.reconciledDate).toBeInstanceOf(Date);
    });
  });
});
