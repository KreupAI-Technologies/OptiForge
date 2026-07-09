import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportCatalogItem } from './entities/report-catalog-item.entity';
import { ReportDashboard } from './entities/report-dashboard.entity';
import { ReportDataset } from './entities/report-dataset.entity';
import { ReportSavedItem } from './entities/report-saved-item.entity';
import { ReportCatalogController } from './report-catalog.controller';
import { ReportDashboardController } from './report-dashboard.controller';
import { ReportDatasetController } from './report-dataset.controller';
import { ReportSavedItemController } from './report-saved-item.controller';
import { ReportGenerationController } from './report-generation.controller';
import { ReportsController } from './reports.controller';
import { ReportCatalogService } from './services/report-catalog.service';
import { ReportGenerationService } from './services/report-generation.service';
import { ReportDashboardService } from './services/report-dashboard.service';
import { ReportDatasetService } from './services/report-dataset.service';
import { ReportSavedItemService } from './services/report-saved-item.service';
import { ReportsManagementService } from './services/reports-management.service';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([ReportDataset, ReportCatalogItem, ReportSavedItem, ReportDashboard]),
  ],
  // Static-route controllers (catalog, saved-items, custom-dashboards,
  // datasets) are declared before the base ReportsController so their
  // prefixes resolve first.
  controllers: [
    ReportCatalogController,
    ReportSavedItemController,
    ReportDashboardController,
    ReportDatasetController,
    ReportGenerationController,
    ReportsController,
  ],
  providers: [
    ReportsManagementService,
    ReportDatasetService,
    ReportCatalogService,
    ReportSavedItemService,
    ReportDashboardService,
    ReportGenerationService,
  ],
  exports: [
    ReportsManagementService,
    ReportDatasetService,
    ReportCatalogService,
    ReportSavedItemService,
    ReportDashboardService,
  ],
})
export class ReportsModule {}
