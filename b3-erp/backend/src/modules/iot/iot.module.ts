import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IotDevice } from './entities/iot-device.entity';
import { IotDeviceController } from './controllers/iot-device.controller';
import { IotDeviceService } from './services/iot-device.service';

@Module({
  imports: [TypeOrmModule.forFeature([IotDevice])],
  controllers: [IotDeviceController],
  providers: [IotDeviceService],
  exports: [IotDeviceService],
})
export class IotModule {}
