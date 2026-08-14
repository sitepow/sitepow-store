-- CreateTable
CREATE TABLE "ReviewRewardConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "basePoints" INTEGER NOT NULL DEFAULT 10,
    "photoBonus" INTEGER NOT NULL DEFAULT 5,
    "videoBonus" INTEGER NOT NULL DEFAULT 20,
    "minCommentLength" INTEGER NOT NULL DEFAULT 50,
    "longReviewBonus" INTEGER NOT NULL DEFAULT 10,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ReviewRewardConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ReviewRewardConfig_storeId_key" ON "ReviewRewardConfig"("storeId");

-- AddForeignKey
ALTER TABLE "ReviewRewardConfig" ADD CONSTRAINT "ReviewRewardConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
