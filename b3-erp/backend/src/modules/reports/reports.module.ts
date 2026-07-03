import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';
import { ReportDataset } from './entities/report-dataset.entity';
import { ReportDatasetController } from './report-dataset.controller';
import { ReportsController } from './reports.controller';
import { ReportDatasetService } from './services/report-dataset.service';
import { ReportsManagementService } from './services/reports-management.service';

@Module({
  imports: [PrismaModule, TypeOrmModule.forFeature([ReportDataset])],
  controllers: [ReportsController, ReportDatasetController],
  providers: [ReportsManagementService, ReportDatasetService],
  exports: [ReportsManagementService, ReportDatasetService],
})
export class ReportsModule {}
