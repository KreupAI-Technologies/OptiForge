import { Module } from '@nestjs/common';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';

@Module({
  providers: [DocumentationService],
  controllers: [DocumentationController],
})
export class DocumentationModule {}
