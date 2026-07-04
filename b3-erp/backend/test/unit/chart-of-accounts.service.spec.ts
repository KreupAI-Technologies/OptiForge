import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ChartOfAccountsService } from '../../src/modules/finance/services/chart-of-accounts.service';
import { ChartOfAccounts } from '../../src/modules/finance/entities/chart-of-accounts.entity';
import { createMockRepository } from '../utils/test-setup';

describe('ChartOfAccountsService', () => {
  let service: ChartOfAccountsService;
  let repo: jest.Mocked<Repository<ChartOfAccounts>>;

  const baseAccount = (over: Partial<ChartOfAccounts> = {}): ChartOfAccounts =>
    ({
      id: 'acc-1',
      accountCode: '1000',
      accountName: 'Cash',
      accountType: 'Asset',
      level: 0,
      isActive: true,
      isSystemAccount: false,
      openingBalance: 0,
      currentBalance: 0,
      debitTotal: 0,
      creditTotal: 0,
      children: [],
      ...over,
    }) as any;

  beforeEach(async () => {
    repo = createMockRepository<ChartOfAccounts>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartOfAccountsService,
        { provide: getRepositoryToken(ChartOfAccounts), useValue: repo },
      ],
    }).compile();
    service = module.get(ChartOfAccountsService);
  });

  describe('create', () => {
    it('creates account with opening balance seeded into current balance', async () => {
      repo.findOne.mockResolvedValue(null); // no existing code
      const dto: any = { accountCode: '2000', accountName: 'AP', openingBalance: 500 };
      const created = baseAccount({ id: 'new', accountCode: '2000', currentBalance: 500 });
      repo.create.mockReturnValue(created);
      repo.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ currentBalance: 500, debitTotal: 0, creditTotal: 0 }),
      );
      expect(result.accountCode).toBe('2000');
    });

    it('throws BadRequest when account code already exists', async () => {
      repo.findOne.mockResolvedValue(baseAccount());
      await expect(
        service.create({ accountCode: '1000', accountName: 'Dup' } as any),
      ).rejects.toThrow(BadRequestException);
    });

    it('sets level from parent when parentAccountId supplied', async () => {
      repo.findOne
        .mockResolvedValueOnce(null) // code check
        .mockResolvedValueOnce(baseAccount({ id: 'parent', level: 2 })); // parent lookup
      const dto: any = { accountCode: '1100', accountName: 'Child', parentAccountId: 'parent' };
      const saved = baseAccount({ id: 'c', level: 3 });
      repo.create.mockReturnValue(saved);
      repo.save.mockResolvedValue(saved);

      await service.create(dto);

      expect(dto.level).toBe(3);
    });

    it('throws NotFound when parent account missing', async () => {
      repo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      await expect(
        service.create({ accountCode: '1', accountName: 'x', parentAccountId: 'missing' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('maps rows through response DTO', async () => {
      const qb: any = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest
          .fn()
          .mockResolvedValue([baseAccount(), baseAccount({ id: 'acc-2', accountCode: '1001' })]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);
      const result = await service.findAll();
      expect(result).toHaveLength(2);
      expect(result[0].accountCode).toBe('1000');
      expect(qb.orderBy).toHaveBeenCalledWith('account.accountCode', 'ASC');
    });

    it('applies accountType and isActive filters', async () => {
      const qb: any = {
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      repo.createQueryBuilder.mockReturnValue(qb);
      await service.findAll({ accountType: 'Asset', isActive: true });
      expect(qb.andWhere).toHaveBeenCalledWith('account.accountType = :accountType', {
        accountType: 'Asset',
      });
      expect(qb.andWhere).toHaveBeenCalledWith('account.isActive = :isActive', { isActive: true });
    });
  });

  describe('findOne', () => {
    it('throws NotFound when account missing', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('blocks modifying system accounts', async () => {
      repo.findOne.mockResolvedValue(baseAccount({ isSystemAccount: true }));
      await expect(service.update('acc-1', { accountName: 'x' } as any)).rejects.toThrow(
        'Cannot modify system account',
      );
    });

    it('rejects setting an account as its own parent', async () => {
      repo.findOne.mockResolvedValue(baseAccount());
      await expect(
        service.update('acc-1', { parentAccountId: 'acc-1' } as any),
      ).rejects.toThrow('Account cannot be its own parent');
    });
  });

  describe('remove', () => {
    it('blocks deleting an account that has transactions', async () => {
      repo.findOne.mockResolvedValue(baseAccount({ debitTotal: 100 }));
      await expect(service.remove('acc-1')).rejects.toThrow('Cannot delete account with transactions');
    });

    it('blocks deleting an account with children', async () => {
      repo.findOne.mockResolvedValue(baseAccount({ children: [baseAccount({ id: 'k' })] as any }));
      await expect(service.remove('acc-1')).rejects.toThrow('Cannot delete account with child accounts');
    });

    it('removes a clean account', async () => {
      const acc = baseAccount();
      repo.findOne.mockResolvedValue(acc);
      repo.remove.mockResolvedValue(acc as any);
      await service.remove('acc-1');
      expect(repo.remove).toHaveBeenCalledWith(acc);
    });
  });

  describe('reconcileAccount', () => {
    it('stamps last reconciled date and returns reconciled status', async () => {
      const acc = baseAccount();
      repo.findOne.mockResolvedValue(acc);
      repo.save.mockResolvedValue(acc);
      const result = await service.reconcileAccount('acc-1');
      expect(result.status).toBe('reconciled');
      expect(acc.lastReconciledDate).toBeInstanceOf(Date);
    });
  });
});
