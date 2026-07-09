import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CPQApprovalMatrixRule,
  CPQPricingVersion,
} from '../entities/cpq-advanced.entity';

@Injectable()
export class CPQPricingVersionService {
  constructor(
    @InjectRepository(CPQPricingVersion)
    private pricingVersionRepository: Repository<CPQPricingVersion>,
  ) {}

  async create(
    companyId: string,
    data: Partial<CPQPricingVersion>,
  ): Promise<CPQPricingVersion> {
    const entity = this.pricingVersionRepository.create({ ...data, companyId });
    return this.pricingVersionRepository.save(entity);
  }

  async findAll(companyId: string): Promise<CPQPricingVersion[]> {
    return this.pricingVersionRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<CPQPricingVersion> {
    const entity = await this.pricingVersionRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Pricing version with ID ${id} not found`);
    }
    return entity;
  }
}

@Injectable()
export class CPQApprovalMatrixService {
  constructor(
    @InjectRepository(CPQApprovalMatrixRule)
    private approvalMatrixRepository: Repository<CPQApprovalMatrixRule>,
  ) {}

  async create(
    companyId: string,
    data: Partial<CPQApprovalMatrixRule>,
  ): Promise<CPQApprovalMatrixRule> {
    const entity = this.approvalMatrixRepository.create({ ...data, companyId });
    return this.approvalMatrixRepository.save(entity);
  }

  async findAll(companyId: string): Promise<CPQApprovalMatrixRule[]> {
    return this.approvalMatrixRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<CPQApprovalMatrixRule> {
    const entity = await this.approvalMatrixRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Approval matrix rule with ID ${id} not found`);
    }
    return entity;
  }
}
