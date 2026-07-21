import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PmVendorShipmentEntity } from '../entities/pm-vendor-shipment.entity';

@Injectable()
export class VendorShipmentSeederService implements OnModuleInit {
  private readonly logger = new Logger(VendorShipmentSeederService.name);

  constructor(
    @InjectRepository(PmVendorShipmentEntity)
    private readonly repo: Repository<PmVendorShipmentEntity>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const count = await this.repo.count();
      if (count > 0) return;

      const demo: Partial<PmVendorShipmentEntity>[] = [
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          poId: 'PO-2025-088',
          vendorName: 'Merino Industries',
          itemDescription: 'Laminates (25 sheets)',
          status: 'In Transit',
          carrier: 'Blue Dart',
          trackingNumber: 'BD-7789021',
          expectedDelivery: '2025-02-14',
          lastLocation: 'Hub, Mumbai',
          trackingHistory: [
            { timestamp: '2025-02-10T08:00:00.000Z', status: 'Dispatched', location: 'Vendor Warehouse', event: 'Picked up from vendor' },
            { timestamp: '2025-02-12T14:30:00.000Z', status: 'In Transit', location: 'Hub, Mumbai', event: 'Arrived at transit hub' },
          ],
          createdBy: 'seeder',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          poId: 'PO-2025-089',
          vendorName: 'Hettich India',
          itemDescription: 'Hinges (100 pcs)',
          status: 'Dispatched',
          carrier: 'Delhivery',
          trackingNumber: 'DL-4451203',
          expectedDelivery: '2025-02-15',
          lastLocation: 'Vendor Warehouse',
          trackingHistory: [
            { timestamp: '2025-02-11T09:15:00.000Z', status: 'Dispatched', location: 'Vendor Warehouse', event: 'Shipment dispatched' },
          ],
          createdBy: 'seeder',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          poId: 'PO-2025-090',
          vendorName: 'Greenlam',
          itemDescription: 'Plywood (50 sheets)',
          status: 'Pending',
          carrier: undefined,
          trackingNumber: undefined,
          expectedDelivery: 'TBD',
          lastLocation: 'Vendor Warehouse',
          trackingHistory: [],
          createdBy: 'seeder',
        },
        {
          companyId: 'default',
          projectId: 'DEMO-PROJECT',
          poId: 'PO-2025-091',
          vendorName: 'Century Plyboards',
          itemDescription: 'Edge Banding (200 m)',
          status: 'Delivered',
          carrier: 'DTDC',
          trackingNumber: 'DT-9908112',
          expectedDelivery: '2025-02-08',
          lastLocation: 'Site, Bengaluru',
          trackingHistory: [
            { timestamp: '2025-02-05T07:45:00.000Z', status: 'Dispatched', location: 'Vendor Warehouse', event: 'Shipment dispatched' },
            { timestamp: '2025-02-07T11:20:00.000Z', status: 'In Transit', location: 'Hub, Bengaluru', event: 'Arrived at transit hub' },
            { timestamp: '2025-02-08T16:05:00.000Z', status: 'Delivered', location: 'Site, Bengaluru', event: 'Delivered at site' },
          ],
          createdBy: 'seeder',
        },
      ];

      await this.repo.save(this.repo.create(demo));
      this.logger.log(`Seeded ${demo.length} demo vendor shipments (DEMO-PROJECT)`);
    } catch (error) {
      this.logger.error(`Vendor shipment seeding skipped: ${error?.message ?? error}`);
    }
  }
}
