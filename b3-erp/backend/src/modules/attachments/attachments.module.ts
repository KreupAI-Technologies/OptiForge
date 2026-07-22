import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entities/attachment.entity';
import { AttachmentsController } from './controllers/attachments.controller';
import { AttachmentsService } from './services/attachments.service';
import { StorageModule } from '../../common/storage/storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment]), StorageModule],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
