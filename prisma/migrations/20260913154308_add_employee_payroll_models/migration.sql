-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('MONTHLY', 'DAILY', 'HOURLY', 'COMMISSION');

-- CreateTable
CREATE TABLE "EmployeeSalaryConfig" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "employeeId" TEXT,
    "employeeName" TEXT NOT NULL,
    "employeeCode" TEXT,
    "department" TEXT,
    "position" TEXT,
    "salaryType" "SalaryType" NOT NULL DEFAULT 'MONTHLY',
    "baseSalary" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bankName" TEXT,
    "bankAccountNumber" TEXT,
    "bankAccountName" TEXT,
    "promptpayNumber" TEXT,
    "socialSecurity" BOOLEAN NOT NULL DEFAULT false,
    "taxPercent" DECIMAL(5,2) DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeSalaryConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyPayroll" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "periodLabel" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalBaseSalary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalOvertime" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalBonus" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalCommission" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalNetSalary" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "closedAt" TIMESTAMP(3),
    "expenseId" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyPayroll_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyPayrollItem" (
    "id" TEXT NOT NULL,
    "monthlyPayrollId" TEXT NOT NULL,
    "employeeConfigId" TEXT,
    "employeeName" TEXT NOT NULL,
    "employeeCode" TEXT,
    "department" TEXT,
    "position" TEXT,
    "salaryType" "SalaryType" NOT NULL DEFAULT 'MONTHLY',
    "baseSalary" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "overtimeAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "bonusAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "commissionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deductionAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "netSalary" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "slipImage" TEXT,
    "paymentNote" TEXT,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "bankAccountName" TEXT,
    "promptPay" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyPayrollItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeSalaryConfig_storeId_idx" ON "EmployeeSalaryConfig"("storeId");

-- CreateIndex
CREATE INDEX "MonthlyPayroll_storeId_idx" ON "MonthlyPayroll"("storeId");

-- CreateIndex
CREATE INDEX "MonthlyPayroll_expenseId_idx" ON "MonthlyPayroll"("expenseId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPayroll_storeId_period_key" ON "MonthlyPayroll"("storeId", "period");

-- CreateIndex
CREATE INDEX "MonthlyPayrollItem_monthlyPayrollId_idx" ON "MonthlyPayrollItem"("monthlyPayrollId");

-- CreateIndex
CREATE INDEX "MonthlyPayrollItem_employeeConfigId_idx" ON "MonthlyPayrollItem"("employeeConfigId");

-- AddForeignKey
ALTER TABLE "EmployeeSalaryConfig" ADD CONSTRAINT "EmployeeSalaryConfig_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPayroll" ADD CONSTRAINT "MonthlyPayroll_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPayroll" ADD CONSTRAINT "MonthlyPayroll_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "Expense"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPayrollItem" ADD CONSTRAINT "MonthlyPayrollItem_monthlyPayrollId_fkey" FOREIGN KEY ("monthlyPayrollId") REFERENCES "MonthlyPayroll"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyPayrollItem" ADD CONSTRAINT "MonthlyPayrollItem_employeeConfigId_fkey" FOREIGN KEY ("employeeConfigId") REFERENCES "EmployeeSalaryConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;
