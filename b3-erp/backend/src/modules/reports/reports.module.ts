import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportCatalogItem } from './entities/report-catalog-item.entity';
import { ReportDataset } from './entities/report-dataset.entity';
import { ReportSavedItem } from './entities/report-saved-item.entity';
import { ReportCatalogController } from './report-catalog.controller';
import { ReportDatasetController } from './report-dataset.controller';
import { ReportSavedItemController } from './report-saved-item.controller';
import { ReportsController } from './reports.controller';
import { ReportCatalogService } from './services/report-catalog.service';
import { ReportDatasetService } from './services/report-dataset.service';
import { ReportSavedItemService } from './services/report-saved-item.service';
import { ReportsManagementService } from './services/reports-management.service';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([ReportDataset, ReportCatalogItem, ReportSavedItem]),
  ],
  // Static-route controllers (catalog, saved-items, datasets) are declared
  // before the base ReportsController so their prefixes resolve first.
  controllers: [
    ReportCatalogController,
    ReportSavedItemController,
    ReportDatasetController,
    ReportsController,
  ],
  providers: [
    ReportsManagementService,
    ReportDatasetService,
    ReportCatalogService,
    ReportSavedItemService,
  ],
  exports: [
    ReportsManagementService,
    ReportDatasetService,
    ReportCatalogService,
    ReportSavedItemService,
  ],
})
export class ReportsModule {}
