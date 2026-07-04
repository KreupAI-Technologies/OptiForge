import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PrismaModule } from '../prisma/prisma.module';

// Entities
import {
  Shipment,
  ShipmentItem,
  DeliveryNote,
  Vehicle,
  Driver,
  Route,
  Trip,
  TrackingEvent,
  FreightCharge,
  TransportCompany,
  DeliveryCoordination,
  FuelRecord,
} from './entities';

// Controllers
import {
  ShipmentController,
  DeliveryNoteController,
  VehicleController,
  DriverController,
  RouteController,
  TripController,
  TrackingEventController,
  FreightChargeController,
  TransportCompanyController,
  DeliveryCoordinationController,
  FuelRecordController,
} from './controllers';
import { GatePassController } from './controllers/gate-pass.controller';
import { CarrierRateController } from './controllers/carrier-rate.controller';
import { CarrierContractController } from './controllers/carrier-contract.controller';
import { CrossDockOperationController } from './controllers/cross-dock-operation.controller';
import { DockDoorController } from './controllers/dock-door.controller';
import { YardVehicleController } from './controllers/yard-vehicle.controller';

// Services
import {
  ShipmentService,
  DeliveryNoteService,
  VehicleService,
  DriverService,
  RouteService,
  TripService,
  TrackingEventService,
  FreightChargeService,
  TransportCompanyService,
  TransportCompanySeederService,
  VehicleTypeSeederService,
  DeliveryCoordinationService,
  FuelRecordService,
} from './services';
import { ConsolidationService } from './services/consolidation.service';
import { ReturnManagementService } from './services/return-management.service';
import { GPSTrackingService } from './services/gps-tracking.service';
import { CustomerNotificationService } from './services/customer-notification.service';
import { GatePassService } from './services/gate-pass.service';
import { LogisticsManagementService } from './services/logistics-management.service';

@Module({
  imports: [
    PrismaModule,
    TypeOrmModule.forFeature([
      Shipment,
      ShipmentItem,
      DeliveryNote,
      Vehicle,
      Driver,
      Route,
      Trip,
      TrackingEvent,
      FreightCharge,
      TransportCompany,
      DeliveryCoordination,
      FuelRecord,
    ]),
  ],
  controllers: [
    ShipmentController,
    DeliveryNoteController,
    VehicleController,
    DriverController,
    RouteController,
    TripController,
    TrackingEventController,
    FreightChargeController,
    TransportCompanyController,
    DeliveryCoordinationController,
    FuelRecordController,
    GatePassController,
    CarrierRateController,
    CarrierContractController,
    CrossDockOperationController,
    DockDoorController,
    YardVehicleController,
  ],
  providers: [
    ShipmentService,
    DeliveryNoteService,
    VehicleService,
    DriverService,
    RouteService,
    TripService,
    TrackingEventService,
    FreightChargeService,
    TransportCompanyService,
    ConsolidationService,
    ReturnManagementService,
    GPSTrackingService,
    CustomerNotificationService,
    GatePassService,
    TransportCompanySeederService,
    VehicleTypeSeederService,
    LogisticsManagementService,
    DeliveryCoordinationService,
    FuelRecordService,
  ],
  exports: [
    ShipmentService,
    DeliveryNoteService,
    VehicleService,
    DriverService,
    RouteService,
    TripService,
    TrackingEventService,
    FreightChargeService,
    TransportCompanyService,
    ConsolidationService,
    ReturnManagementService,
    GPSTrackingService,
    CustomerNotificationService,
    GatePassService,
    TransportCompanySeederService,
    VehicleTypeSeederService,
    LogisticsManagementService,
  ],
})
export class LogisticsModule { }
