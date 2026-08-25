-- DropForeignKey
ALTER TABLE "ResellerAgreement" DROP CONSTRAINT "ResellerAgreement_resellerCustomerId_fkey";

-- AddForeignKey
ALTER TABLE "ResellerAgreement" ADD CONSTRAINT "ResellerAgreement_resellerCustomerId_fkey" FOREIGN KEY ("resellerCustomerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
