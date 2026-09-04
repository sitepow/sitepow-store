-- CreateTable
CREATE TABLE "StoreWebhookEndpoint" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT,
    "secret" TEXT NOT NULL,
    "events" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreWebhookEndpoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreWebhookLog" (
    "id" TEXT NOT NULL,
    "endpointId" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "statusCode" INTEGER,
    "requestPayload" JSONB NOT NULL,
    "responseBody" TEXT,
    "executionTimeMs" INTEGER NOT NULL,
    "isSuccess" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StoreWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoreWebhookEndpoint_storeId_idx" ON "StoreWebhookEndpoint"("storeId");

-- CreateIndex
CREATE INDEX "StoreWebhookLog_endpointId_idx" ON "StoreWebhookLog"("endpointId");

-- CreateIndex
CREATE INDEX "StoreWebhookLog_createdAt_idx" ON "StoreWebhookLog"("createdAt");

-- AddForeignKey
ALTER TABLE "StoreWebhookEndpoint" ADD CONSTRAINT "StoreWebhookEndpoint_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreWebhookLog" ADD CONSTRAINT "StoreWebhookLog_endpointId_fkey" FOREIGN KEY ("endpointId") REFERENCES "StoreWebhookEndpoint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
