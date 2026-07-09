import { Body, Controller, Get, Headers, Post } from '@nestjs/common';
import {
  CPQGuidedSellingQuestion,
  CPQMarginGuardrail,
} from '../entities/cpq-advanced2.entity';
import {
  CPQGuidedSellingQuestionService,
  CPQMarginGuardrailService,
} from '../services/cpq-advanced2.service';

// Guided-selling tab of cpq/advanced-features.
@Controller('cpq/advanced/guided-selling')
export class CPQGuidedSellingQuestionController {
  constructor(
    private readonly guidedSellingService: CPQGuidedSellingQuestionService,
  ) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQGuidedSellingQuestion[]> {
    return this.guidedSellingService.findAll(companyId);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQGuidedSellingQuestion>,
  ): Promise<CPQGuidedSellingQuestion> {
    return this.guidedSellingService.create(companyId, data);
  }
}

// Margin-guardrails tab of cpq/advanced-features.
@Controller('cpq/advanced/margin-guardrails')
export class CPQMarginGuardrailController {
  constructor(
    private readonly marginGuardrailService: CPQMarginGuardrailService,
  ) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQMarginGuardrail[]> {
    return this.marginGuardrailService.findAll(companyId);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQMarginGuardrail>,
  ): Promise<CPQMarginGuardrail> {
    return this.marginGuardrailService.create(companyId, data);
  }
}
