import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';

/**
 * StorageModule — provides the reusable {@link StorageService} (S3 with
 * automatic local-disk fallback). Import into any feature module that needs to
 * persist binary blobs; no global registration required.
 */
@Module({
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
