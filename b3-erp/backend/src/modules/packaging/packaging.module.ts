import { Module } from '@nestjs/common';
import { PackagingController } from './packaging.controller';

@Module({
  controllers: [PackagingController],
})
export class PackagingModule {}
