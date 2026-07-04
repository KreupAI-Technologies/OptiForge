-- Additive-only tables for logistics orphan pages.
-- Safe to run repeatedly. Never drops or alters existing tables.
--
-- Column names are quoted to match the TypeORM entity property names
-- (camelCase), which is how the logistics services read/write these tables.

-- ---------------------------------------------------------------------------
-- Delivery Coordination — backing table for the delivery-coordination page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "logistics_delivery_coordinations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "woNumber" varchar(50) NOT NULL,
  "customerName" varchar(200) NOT NULL,
  "siteAddress" text,
  "siteGps" varchar(100),
  "siteLandmark" varchar(200),
  "contactName" varchar(150),
  "contactPhone" varchar(50),
  "contactEmail" varchar(150),
  "contactRole" varchar(100),
  "preferredDate" date,
  "preferredTime" varchar(50),
  "timeSlot" varchar(50),
  "transportMethod" varchar(50) NOT NULL DEFAULT 'Own Vehicle',
  "transporter" varchar(200),
  "status" varchar(50) NOT NULL DEFAULT 'Pending',
  "transporterNotified" boolean NOT NULL DEFAULT false,
  "siteContactNotified" boolean NOT NULL DEFAULT false,
  "createdBy" varchar(100),
  "updatedBy" varchar(100),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_logistics_delivery_coordinations" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Fuel Records — backing table for the fleet/fuel page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "logistics_fuel_records" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "fuelId" varchar(50) NOT NULL,
  "vehicleId" varchar(50),
  "vehicleNumber" varchar(50),
  "vehicleType" varchar(100),
  "driverName" varchar(150),
  "fuelType" varchar(30),
  "quantity" numeric(12,2) NOT NULL DEFAULT 0,
  "unitPrice" numeric(12,2) NOT NULL DEFAULT 0,
  "totalCost" numeric(15,2) NOT NULL DEFAULT 0,
  "fuelStation" varchar(200),
  "location" varchar(200),
  "odometer" numeric(15,2) NOT NULL DEFAULT 0,
  "previousOdometer" numeric(15,2) NOT NULL DEFAULT 0,
  "distanceCovered" numeric(15,2) NOT NULL DEFAULT 0,
  "fuelEfficiency" numeric(10,2) NOT NULL DEFAULT 0,
  "fillType" varchar(30),
  "paymentMethod" varchar(30),
  "invoiceNumber" varchar(100),
  "filledBy" varchar(150),
  "filledDate" date,
  "filledTime" varchar(20),
  "tripId" varchar(50),
  "notes" text,
  "status" varchar(30) NOT NULL DEFAULT 'pending',
  "verifiedBy" varchar(150),
  "expectedEfficiency" numeric(10,2) NOT NULL DEFAULT 0,
  "efficiencyVariance" numeric(10,2) NOT NULL DEFAULT 0,
  "anomalyDetected" boolean NOT NULL DEFAULT false,
  "createdBy" varchar(100),
  "updatedBy" varchar(100),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_logistics_fuel_records" PRIMARY KEY ("id"),
  CONSTRAINT "UQ_logistics_fuel_records_fuelId" UNIQUE ("fuelId")
);

-- ---------------------------------------------------------------------------
-- Carrier Rates — backing table for the carriers/rates page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "logistics_carrier_rates" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "carrier" varchar(200) NOT NULL,
  "serviceType" varchar(30) NOT NULL DEFAULT 'standard',
  "zone" varchar(100),
  "origin" varchar(150),
  "destination" varchar(150),
  "baseRate" numeric(15,2) NOT NULL DEFAULT 0,
  "perKgRate" numeric(15,2) NOT NULL DEFAULT 0,
  "fuelSurcharge" numeric(10,2) NOT NULL DEFAULT 0,
  "minWeight" numeric(10,2) NOT NULL DEFAULT 0,
  "maxWeight" numeric(10,2) NOT NULL DEFAULT 0,
  "volumetricDivisor" numeric(10,2) NOT NULL DEFAULT 5000,
  "transitTime" varchar(50),
  "effectiveFrom" date,
  "effectiveTo" date,
  "currency" varchar(10) NOT NULL DEFAULT 'INR',
  "isActive" boolean NOT NULL DEFAULT true,
  "lastUpdated" date,
  "rateChange" numeric(10,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_logistics_carrier_rates" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Carrier Contracts — backing table for the carriers/contracts page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "logistics_carrier_contracts" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "contractNo" varchar(50) NOT NULL,
  "carrier" varchar(200) NOT NULL,
  "type" varchar(100),
  "startDate" date,
  "endDate" date,
  "value" numeric(18,2) NOT NULL DEFAULT 0,
  "status" varchar(50) NOT NULL DEFAULT 'Active',
  "routes" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "sla" varchar(100),
  "rateType" varchar(50),
  "baseRate" numeric(15,2) NOT NULL DEFAULT 0,
  "renewalStatus" varchar(50),
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_logistics_carrier_contracts" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Cross-Dock Operations — backing table for the warehouse/cross-dock page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "logistics_cross_dock_operations" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "operationNo" varchar(50),
  "inboundShipment" varchar(100),
  "outboundShipment" varchar(100),
  "carrier" varchar(200),
  "dockDoor" varchar(50),
  "status" varchar(30) NOT NULL DEFAULT 'receiving',
  "priority" varchar(20) NOT NULL DEFAULT 'medium',
  "itemCount" integer NOT NULL DEFAULT 0,
  "dwellTime" integer NOT NULL DEFAULT 0,
  "scheduledTime" varchar(50),
  "assignedTo" varchar(150),
  "notes" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_logistics_cross_dock_operations" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Dock Doors — backing table for the warehouse/dock page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "logistics_dock_doors" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "doorNo" varchar(50) NOT NULL,
  "doorName" varchar(150),
  "type" varchar(30) NOT NULL DEFAULT 'inbound',
  "status" varchar(30) NOT NULL DEFAULT 'available',
  "currentVehicle" varchar(100),
  "carrier" varchar(200),
  "waitTime" integer NOT NULL DEFAULT 0,
  "assignedTo" varchar(150),
  "location" varchar(150),
  "notes" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_logistics_dock_doors" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- Yard Vehicles — backing table for the warehouse/yard page.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "logistics_yard_vehicles" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "vehicleNo" varchar(50) NOT NULL,
  "carrierName" varchar(200),
  "driverName" varchar(150),
  "driverPhone" varchar(50),
  "checkInTime" varchar(50),
  "parkingSpot" varchar(50),
  "vehicleType" varchar(30) NOT NULL DEFAULT 'truck',
  "status" varchar(30) NOT NULL DEFAULT 'checked-in',
  "appointmentNo" varchar(100),
  "dockAssigned" varchar(50),
  "estimatedDeparture" varchar(50),
  "waitTime" integer NOT NULL DEFAULT 0,
  "trailerNo" varchar(50),
  "sealNo" varchar(50),
  "notes" text,
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_logistics_yard_vehicles" PRIMARY KEY ("id")
);
