import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ArCustomerAccountService } from '../../src/modules/finance/services/ar-customer-account.service';
import { ArCustomerAccount } from '../../src/modules/finance/entities/ar-customer-account.entity';
import { createMockRepository } from '../utils/test-setup';

describe('ArCustomerAccountService', () => {
  let service: ArCustomerAccountService;
  let repo: jest.Mocked<Repository<ArCustomerAccount>>;

  beforeEach(async () => {
    repo = createMockRepository<ArCustomerAccount>();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArCustomerAccountService,
        { provide: getRepositoryToken(ArCustomerAccount), useValue: repo },
      ],
    }).compile();
    service = module.get(ArCustomerAccountService);
  });

  it('findAll orders by createdAt DESC', async () => {
    repo.find.mockResolvedValue([{ id: '1' }] as any);
    await service.findAll();
    expect(repo.find).toHaveBeenCalledWith({ order: { createdAt: 'DESC' } });
  });

  it('findOne throws NotFound with the id in the message', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne('cust-9')).rejects.toThrow('AR customer account cust-9 not found');
  });

  it('create saves the built entity', async () => {
    const entity = { id: 'c1', customerName: 'Bob' } as any;
    repo.create.mockReturnValue(entity);
    repo.save.mockResolvedValue(entity);
    const result = await service.create({ customerName: 'Bob' } as any);
    expect(result).toBe(entity);
  });

  it('update applies changes to the found row', async () => {
    const existing = { id: 'c1', creditLimit: 1000 } as any;
    repo.findOne.mockResolvedValue(existing);
    repo.save.mockImplementation(async (e: any) => e);
    const result = await service.update('c1', { creditLimit: 5000 } as any);
    expect(result.creditLimit).toBe(5000);
  });

  it('remove reports success', async () => {
    const existing = { id: 'c1' } as any;
    repo.findOne.mockResolvedValue(existing);
    repo.remove.mockResolvedValue(existing);
    expect(await service.remove('c1')).toEqual({ success: true });
  });
});
