import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortalDocument } from './entities/portal-document.entity';
import { PortalDocumentsController } from './controllers/portal-documents.controller';
import { PortalDocumentService } from './services/portal-document.service';

@Module({
  imports: [TypeOrmModule.forFeature([PortalDocument])],
  controllers: [PortalDocumentsController],
  providers: [PortalDocumentService],
  exports: [PortalDocumentService],
})
export class PortalModule {}
