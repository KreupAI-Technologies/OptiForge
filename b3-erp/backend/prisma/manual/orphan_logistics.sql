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
