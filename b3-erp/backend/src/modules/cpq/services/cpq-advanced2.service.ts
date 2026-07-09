import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CPQGuidedSellingQuestion,
  CPQMarginGuardrail,
} from '../entities/cpq-advanced2.entity';

@Injectable()
export class CPQGuidedSellingQuestionService {
  constructor(
    @InjectRepository(CPQGuidedSellingQuestion)
    private guidedSellingRepository: Repository<CPQGuidedSellingQuestion>,
  ) {}

  async create(
    companyId: string,
    data: Partial<CPQGuidedSellingQuestion>,
  ): Promise<CPQGuidedSellingQuestion> {
    const entity = this.guidedSellingRepository.create({ ...data, companyId });
    return this.guidedSellingRepository.save(entity);
  }

  async findAll(companyId: string): Promise<CPQGuidedSellingQuestion[]> {
    return this.guidedSellingRepository.find({
      where: { companyId },
      order: { displayOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(
    companyId: string,
    id: string,
  ): Promise<CPQGuidedSellingQuestion> {
    const entity = await this.guidedSellingRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(
        `Guided-selling question with ID ${id} not found`,
      );
    }
    return entity;
  }
}

@Injectable()
export class CPQMarginGuardrailService {
  constructor(
    @InjectRepository(CPQMarginGuardrail)
    private marginGuardrailRepository: Repository<CPQMarginGuardrail>,
  ) {}

  async create(
    companyId: string,
    data: Partial<CPQMarginGuardrail>,
  ): Promise<CPQMarginGuardrail> {
    const entity = this.marginGuardrailRepository.create({ ...data, companyId });
    return this.marginGuardrailRepository.save(entity);
  }

  async findAll(companyId: string): Promise<CPQMarginGuardrail[]> {
    return this.marginGuardrailRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(companyId: string, id: string): Promise<CPQMarginGuardrail> {
    const entity = await this.marginGuardrailRepository.findOne({
      where: { id, companyId },
    });
    if (!entity) {
      throw new NotFoundException(`Margin guardrail with ID ${id} not found`);
    }
    return entity;
  }
}
