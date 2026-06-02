/*
  Warnings:

  - The values [NORMAL,BORDER_PROVINCES] on the enum `ShippingZoneType` will be removed. If these variants are still used in the database, this will fail.

*/
BEGIN;
CREATE TYPE "ShippingZoneType_new" AS ENUM ('SAME_PROVINCE', 'SAME_REGION', 'CROSS_REGION', 'REMOTE_AREA');
ALTER TABLE "StoreServiceZoneRate" ALTER COLUMN "zoneType" TYPE "ShippingZoneType_new" USING ("zoneType"::text::"ShippingZoneType_new");
ALTER TYPE "ShippingZoneType" RENAME TO "ShippingZoneType_old";
ALTER TYPE "ShippingZoneType_new" RENAME TO "ShippingZoneType";
DROP TYPE "public"."ShippingZoneType_old";
COMMIT;

ALTER TABLE "StoreServiceWeightRate" ADD COLUMN "zoneType" "ShippingZoneType" NOT NULL DEFAULT 'SAME_PROVINCE';