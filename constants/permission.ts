import { PermissionAction, PermissionDomain } from '@/generated/prisma/enums'
import { PermissionKey } from '@/types/permission'

export const ROLE_PERMISSION_PRESETS: Record<string, string[]> = {
  OWNER: [
    'canViewCreditCard',
    'canViewDashboard',
    'canManageEmployee',
    'canManageProducts',
    'canManageInventory',
    'canManageStock',
    'canCreateOrder',
    'canManageOrders',
    'canCancelOrder',
    'canManageCoupons',
    'canManageCustomers',
    'canManageStoreSettings',
    'canViewFinance',
    'canViewActivityLogs',
    'canManageBranches',
    'canManageBlogs',
    'canManageShipping',
    'canManagePayment',
    'canManageSubscription',
    'canManageConversation',
    'canManageStoreProfile',
    'canManageSecurity',
    'canManageNotifications',
    'canTransferStore',
    'canManageTax',
  ],
  ADMIN: [
    'canViewCreditCard',
    'canViewDashboard',
    'canManageEmployee',
    'canManageProducts',
    'canManageInventory',
    'canManageStock',
    'canCreateOrder',
    'canManageOrders',
    'canCancelOrder',
    'canManageCoupons',
    'canManageCustomers',
    'canManageStoreSettings',
    'canViewFinance',
    'canViewActivityLogs',
    'canManageBranches',
    'canManageBlogs',
    'canManageShipping',
    'canManagePayment',
    'canManageSubscription',
    'canManageConversation',
    'canManageStoreProfile',
    'canManageSecurity',
    'canManageNotifications',
    'canTransferStore',
    'canManageTax',
  ],
  MANAGER: [
    'canViewDashboard',
    'canManageProducts',
    'canManageInventory',
    'canManageStock',
    'canCreateOrder',
    'canManageOrders',
    'canCancelOrder',
    'canManageCoupons',
    'canManageCustomers',
    'canViewFinance',
    'canViewActivityLogs',
    'canManageBranches',
    'canManageBlogs',
    'canManageShipping',
    'canManageConversation',
    'canManageNotifications',
  ],
  CASHIER: [
    'canViewDashboard',
    'canCreateOrder',
    'canManageOrders',
    'canCancelOrder',
    'canManageCustomers',
    'canManagePayment',
    'canManageConversation',
  ],
  STAFF: [
    'canViewDashboard',
    'canCreateOrder',
    'canManageOrders',
    'canManageCustomers',
    'canManageConversation',
  ],
}

export const PERMISSION_MAPPING: Record<
  PermissionKey,
  { domain: PermissionDomain; action: PermissionAction }
> = {
  canViewCreditCard: {
    domain: PermissionDomain.TRANSACTION,
    action: PermissionAction.READ,
  },
  canViewDashboard: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.READ,
  },
  canManageEmployee: {
    domain: PermissionDomain.STAFF,
    action: PermissionAction.CREATE,
  },
  canManageProducts: {
    domain: PermissionDomain.PRODUCT,
    action: PermissionAction.UPDATE,
  },
  canManageInventory: {
    domain: PermissionDomain.INVENTORY,
    action: PermissionAction.UPDATE,
  },
  canManageStock: {
    domain: PermissionDomain.INVENTORY,
    action: PermissionAction.UPDATE,
  },
  canCreateOrder: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.CREATE,
  },
  canManageOrders: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.UPDATE,
  },
  canCancelOrder: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.CANCEL,
  },
  canManageCoupons: {
    domain: PermissionDomain.COUPON,
    action: PermissionAction.CREATE,
  },
  canManageCustomers: {
    domain: PermissionDomain.CUSTOMER,
    action: PermissionAction.UPDATE,
  },
  canManageStoreSettings: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.UPDATE,
  },
  canViewFinance: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.READ,
  },
  canViewActivityLogs: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.READ,
  },
  canManageBranches: {
    domain: PermissionDomain.BRANCH,
    action: PermissionAction.UPDATE,
  },
  canManageBlogs: {
    domain: PermissionDomain.BLOG,
    action: PermissionAction.CREATE,
  },
  canManageShipping: {
    domain: PermissionDomain.SHIPPING,
    action: PermissionAction.UPDATE,
  },
  canManagePayment: {
    domain: PermissionDomain.PAYMENT,
    action: PermissionAction.UPDATE,
  },
  canManageSubscription: {
    domain: PermissionDomain.SUBSCRIPTION,
    action: PermissionAction.UPDATE,
  },
  canManageConversation: {
    domain: PermissionDomain.CONVERSATION,
    action: PermissionAction.READ,
  },
  canManageStoreProfile: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.UPDATE,
  },
  canManageSecurity: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.UPDATE,
  },
  canManageNotifications: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.UPDATE,
  },
  canTransferStore: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.UPDATE,
  },
  canManageTax: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.UPDATE,
  },
}
