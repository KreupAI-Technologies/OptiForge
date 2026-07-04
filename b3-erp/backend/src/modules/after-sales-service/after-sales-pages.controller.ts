import { Controller, Get } from '@nestjs/common';
import { ServiceFeedbackService } from './services/service-feedback.service';
import { PartsMovementService } from './services/parts-movement.service';
import { ServiceAnalyticsService } from './services/service-analytics.service';
import { TroubleshootingService } from './services/troubleshooting.service';

/**
 * Additive controllers backing after-sales-service frontend pages that had
 * no fitting endpoint. Static list routes only; grouped by feature so each
 * maps cleanly to one page. Registered in AfterSalesServiceModule.
 */

@Controller('after-sales/feedback')
export class AfterSalesFeedbackController {
  constructor(private readonly feedback: ServiceFeedbackService) {}

  @Get('complaints')
  complaints() {
    return this.feedback.getComplaints();
  }

  @Get('ratings')
  ratings() {
    return this.feedback.getRatings();
  }

  @Get('nps')
  nps() {
    return this.feedback.getNps();
  }

  @Get('surveys')
  surveys() {
    return this.feedback.getSurveys();
  }
}

@Controller('after-sales/parts')
export class AfterSalesPartsController {
  constructor(private readonly parts: PartsMovementService) {}

  @Get('requisitions')
  requisitions() {
    return this.parts.getRequisitions();
  }

  @Get('consumption')
  consumption() {
    return this.parts.getConsumptions();
  }

  @Get('returns')
  returns() {
    return this.parts.getReturns();
  }
}

@Controller('after-sales/analytics')
export class AfterSalesAnalyticsController {
  constructor(private readonly analytics: ServiceAnalyticsService) {}

  @Get('technicians')
  technicians() {
    return this.analytics.getTechnicians();
  }

  @Get('ftf')
  ftf() {
    return this.analytics.getFtfRecords();
  }

  @Get('reports')
  reports() {
    return this.analytics.getScheduledReports();
  }
}

@Controller('after-sales/troubleshooting')
export class AfterSalesTroubleshootingController {
  constructor(private readonly troubleshooting: TroubleshootingService) {}

  @Get()
  guides() {
    return this.troubleshooting.getGuides();
  }
}
