import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
} from '@nestjs/common';
import {
  CPQApprovalMatrixRule,
  CPQPricingVersion,
} from '../entities/cpq-advanced.entity';
import {
  CPQApprovalMatrixService,
  CPQPricingVersionService,
} from '../services/cpq-advanced.service';

// Pricing version-control tab of cpq/advanced-features.
@Controller('cpq/advanced/pricing-versions')
export class CPQPricingVersionController {
  constructor(
    private readonly pricingVersionService: CPQPricingVersionService,
  ) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQPricingVersion[]> {
    return this.pricingVersionService.findAll(companyId);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQPricingVersion>,
  ): Promise<CPQPricingVersion> {
    return this.pricingVersionService.create(companyId, data);
  }
}

// Approval-matrix tab of cpq/advanced-features.
@Controller('cpq/advanced/approval-matrix')
export class CPQApprovalMatrixController {
  constructor(
    private readonly approvalMatrixService: CPQApprovalMatrixService,
  ) {}

  @Get()
  findAll(
    @Headers('x-company-id') companyId: string,
  ): Promise<CPQApprovalMatrixRule[]> {
    return this.approvalMatrixService.findAll(companyId);
  }

  @Post()
  create(
    @Headers('x-company-id') companyId: string,
    @Body() data: Partial<CPQApprovalMatrixRule>,
  ): Promise<CPQApprovalMatrixRule> {
    return this.approvalMatrixService.create(companyId, data);
  }
}
