import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { InvoiceService } from '../../src/modules/finance/services/invoice.service';
import { Invoice, InvoiceLine, InvoiceStatus } from '../../src/modules/finance/entities/invoice.entity';
import { createMockRepository } from '../utils/test-setup';

describe('InvoiceService', () => {
  let service: InvoiceService;
  let invoiceRepo: jest.Mocked<Repository<Invoice>>;
  let lineRepo: jest.Mocked<Repository<InvoiceLine>>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    invoiceRepo = createMockRepository<Invoice>();
    lineRepo = createMockRepository<InvoiceLine>();
    dataSource = { transaction: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoiceService,
        { provide: getRepositoryToken(Invoice), useValue: invoiceRepo },
        { provide: getRepositoryToken(InvoiceLine), useValue: lineRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();
    service = module.get(InvoiceService);
  });

  describe('create', () => {
    it('computes subtotal, tax and total from lines plus charges', async () => {
      // subtotal = (2*100 - 10) + (1*50 - 0) = 190 + 50 = 240
      // tax = 18 + 0 = 18
      // total = 240 + 18 + shipping(5) + other(3) - discount(8) = 258
      const dto: any = {
        invoiceType: 'Sales Invoice',
        shippingCharges: 5,
        otherCharges: 3,
        discountAmount: 8,
        lines: [
          { quantity: 2, unitPrice: 100, discountAmount: 10, taxAmount: 18 },
          { quantity: 1, unitPrice: 50 },
        ],
      };

      invoiceRepo.count.mockResolvedValue(0);
      const savedInvoice = { id: 'inv-1', lines: [] } as any;

      const manager = {
        create: jest.fn((_entity: any, data: any) => data),
        save: jest.fn().mockResolvedValue(savedInvoice),
      };
      dataSource.transaction.mockImplementation(async (cb: any) => cb(manager));
      // findOne is called at end of create
      invoiceRepo.findOne.mockResolvedValue({ id: 'inv-1', totalAmount: 258, lines: [] } as any);

      const result = await service.create(dto);

      const createCall = manager.create.mock.calls.find(
        (c) => c[1].subtotal !== undefined,
      );
      const createdInvoice = createCall![1];
      expect(createdInvoice.subtotal).toBe(240);
      expect(createdInvoice.taxAmount).toBe(18);
      expect(createdInvoice.totalAmount).toBe(258);
      expect(createdInvoice.balanceAmount).toBe(258);
      expect(createdInvoice.status).toBe(InvoiceStatus.DRAFT);
      expect(result.totalAmount).toBe(258);
    });
  });

  describe('findOne', () => {
    it('throws NotFound when invoice missing', async () => {
      invoiceRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('x')).rejects.toThrow(NotFoundException);
    });

    it('returns mapped invoice with lines defaulted to []', async () => {
      invoiceRepo.findOne.mockResolvedValue({ id: 'inv-1', lines: undefined } as any);
      const result = await service.findOne('inv-1');
      expect(result.lines).toEqual([]);
    });
  });

  describe('update / remove guards', () => {
    it('blocks updating a posted invoice', async () => {
      invoiceRepo.findOne.mockResolvedValue({ id: 'inv-1', isPosted: true } as any);
      await expect(service.update('inv-1', {} as any)).rejects.toThrow('Cannot update posted invoice');
    });

    it('blocks removing a posted invoice', async () => {
      invoiceRepo.findOne.mockResolvedValue({ id: 'inv-1', isPosted: true } as any);
      await expect(service.remove('inv-1')).rejects.toThrow('Cannot delete posted invoice');
    });
  });

  describe('postToGL', () => {
    it('marks the invoice posted with a timestamp', async () => {
      const inv: any = { id: 'inv-1', isPosted: false, lines: [] };
      invoiceRepo.findOne.mockResolvedValue(inv);
      invoiceRepo.save.mockResolvedValue(inv);
      await service.postToGL('inv-1');
      expect(inv.isPosted).toBe(true);
      expect(inv.postedAt).toBeInstanceOf(Date);
    });

    it('rejects double-posting', async () => {
      invoiceRepo.findOne.mockResolvedValue({ id: 'inv-1', isPosted: true, lines: [] } as any);
      await expect(service.postToGL('inv-1')).rejects.toThrow('Invoice already posted');
    });
  });

  describe('getOutstandingBalance', () => {
    it('returns raw SUM result and defaults null to 0', async () => {
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ outstanding: null }),
      };
      invoiceRepo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.getOutstandingBalance('party-1');
      expect(result).toEqual({ partyId: 'party-1', outstandingBalance: 0 });
    });

    it('passes through a non-null outstanding sum', async () => {
      const qb: any = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ outstanding: 1234.5 }),
      };
      invoiceRepo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.getOutstandingBalance('party-1');
      expect(result.outstandingBalance).toBe(1234.5);
    });
  });
});
