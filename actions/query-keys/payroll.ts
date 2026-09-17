export const payrollKeys = {
  all: ['payroll'] as const,
  configs: (storeId: string) =>
    [...payrollKeys.all, 'configs', storeId] as const,
  monthly: (storeId: string, period: string) =>
    [...payrollKeys.all, 'monthly', storeId, period] as const,
  history: (storeId: string) =>
    [...payrollKeys.all, 'history', storeId] as const,
  availableEmployees: (storeId: string) =>
    [...payrollKeys.all, 'available-employees', storeId] as const,
}
