-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "pendingPlan" "Plan",
ADD COLUMN     "pendingPlanAt" TIMESTAMP(3);
