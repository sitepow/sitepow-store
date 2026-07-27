-- CreateTable
CREATE TABLE "EmployeePermission" (
    "employeeStoreId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "EmployeePermission_pkey" PRIMARY KEY ("employeeStoreId","permissionId")
);

-- AddForeignKey
ALTER TABLE "EmployeePermission" ADD CONSTRAINT "EmployeePermission_employeeStoreId_fkey" FOREIGN KEY ("employeeStoreId") REFERENCES "EmployeeStore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePermission" ADD CONSTRAINT "EmployeePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
