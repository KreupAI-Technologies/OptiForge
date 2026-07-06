import { Controller, Get } from '@nestjs/common';
import { ProcurementInsightsService } from '../services/procurement-insights.service';

// Read-only dashboard endpoints for the procurement feature pages.
@Controller('procurement/insights')
export class ProcurementInsightsController {
  constructor(private readonly service: ProcurementInsightsService) {}

  @Get('analytics')
  analytics() {
    return this.service.getAnalytics();
  }

  @Get('automation')
  automation() {
    return this.service.getAutomation();
  }

  @Get('compliance')
  compliance() {
    return this.service.getCompliance();
  }

  @Get('risk')
  risk() {
    return this.service.getRisk();
  }

  @Get('diversity')
  diversity() {
    return this.service.getDiversity();
  }

  @Get('quality-assurance')
  qualityAssurance() {
    return this.service.getQualityAssurance();
  }

  @Get('strategic-sourcing')
  strategicSourcing() {
    return this.service.getStrategicSourcing();
  }

  @Get('marketplace')
  marketplace() {
    return this.service.getMarketplace();
  }

  @Get('collaboration')
  collaboration() {
    return this.service.getCollaboration();
  }

  @Get('onboarding')
  onboarding() {
    return this.service.getOnboarding();
  }

  @Get('vendor-activities')
  vendorActivities() {
    return this.service.getVendorActivities();
  }

  @Get('vendor-risk')
  vendorRisk() {
    return this.service.getVendorRisk();
  }

  @Get('pending-actions')
  pendingActions() {
    return this.service.getPendingActions();
  }

  @Get('compliance-violations')
  complianceViolations() {
    return this.service.getComplianceViolations();
  }
}
