import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdvancedFeaturesController } from './advanced-features.controller';
import { AdvancedFeaturesService } from './services/advanced-features.service';

@Module({
  imports: [PrismaModule],
  controllers: [AdvancedFeaturesController],
  providers: [AdvancedFeaturesService],
  exports: [AdvancedFeaturesService],
})
export class AdvancedFeaturesModule {}
