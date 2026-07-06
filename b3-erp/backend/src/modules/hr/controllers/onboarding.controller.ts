import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { OnboardingService } from '../services/onboarding.service';

const DEFAULT_COMPANY = 'default-company-id';

@ApiTags('HR - Onboarding')
@Controller('hr')
export class OnboardingController {
  constructor(private readonly service: OnboardingService) {}

  // --- Offers ---
  @Get('offers')
  getOffers(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getOffers(companyId || DEFAULT_COMPANY, {
      status,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
  }

  @Get('offers/:id')
  getOfferById(@Param('id') id: string) {
    return this.service.getOfferById(id);
  }

  @Post('offers')
  createOffer(@Body() body: any) {
    return this.service.createOffer({
      companyId: body.companyId || DEFAULT_COMPANY,
      candidateName: body.candidateName,
      candidateEmail: body.candidateEmail,
      candidatePhone: body.candidatePhone,
      positionTitle: body.positionTitle,
      departmentId: body.departmentId,
      offeredSalary: body.offeredSalary ?? body.salary,
      joiningDate: body.joiningDate ? new Date(body.joiningDate) : new Date(),
      offerExpiryDate: body.offerExpiryDate
        ? new Date(body.offerExpiryDate)
        : body.expiryDate
          ? new Date(body.expiryDate)
          : new Date(),
      createdBy: body.createdBy,
    });
  }

  @Put('offers/:id/status')
  updateOfferStatus(
    @Param('id') id: string,
    @Body() body: { status: string; rejectionReason?: string; signedOfferUrl?: string },
  ) {
    return this.service.updateOfferStatus(id, body.status, {
      rejectionReason: body.rejectionReason,
      signedOfferUrl: body.signedOfferUrl,
    });
  }

  // --- Onboarding processes ---
  @Get('onboarding')
  getOnboardingProcesses(
    @Query('companyId') companyId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.getOnboardingProcesses(companyId || DEFAULT_COMPANY, {
      status,
    });
  }

  @Get('onboarding/:id')
  getOnboardingById(@Param('id') id: string) {
    return this.service.getOnboardingProcessById(id);
  }
}
