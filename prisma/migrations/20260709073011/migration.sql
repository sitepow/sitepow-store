/*
  Warnings:

  - The values [DIGITAL,SERVICE] on the enum `ProductType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ProductType_new" AS ENUM ('PHYSICAL', 'DIGITAL_LINK', 'DIGITAL_ITEM', 'DIGITAL_SERVICE');
ALTER TABLE "public"."Product" ALTER COLUMN "productType" DROP DEFAULT;
ALTER TABLE "Product" ALTER COLUMN "productType" TYPE "ProductType_new" USING ("productType"::text::"ProductType_new");
ALTER TABLE "OrderItem" ALTER COLUMN "productType" TYPE "ProductType_new" USING ("productType"::text::"ProductType_new");
ALTER TYPE "ProductType" RENAME TO "ProductType_old";
ALTER TYPE "ProductType_new" RENAME TO "ProductType";
DROP TYPE "public"."ProductType_old";
ALTER TABLE "Product" ALTER COLUMN "productType" SET DEFAULT 'PHYSICAL';
COMMIT;
