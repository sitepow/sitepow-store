import { PermissionAction, PermissionDomain } from '@/generated/prisma/enums'
import { PermissionKey } from '@/types/permission'

export const ROLE_PERMISSION_PRESETS: Record<string, string[]> = {
  OWNER: [
    'canViewStore',
    'canCreateStore',
    'canUpdateStore',
    'canDeleteStore',
    'canViewCategory',
    'canCreateCategory',
    'canUpdateCategory',
    'canDeleteCategory',
    'canViewCreditCard',
    'canCreateCreditCard',
    'canUpdateCreditCard',
    'canDeleteCreditCard',
    'canViewFinance',
    'canCreateFinance',
    'canUpdateFinance',
    'canDeleteFinance',
    'canViewDashboard',
    'canCreateDashboard',
    'canUpdateDashboard',
    'canDeleteDashboard',
    'canViewEmployee',
    'canCreateEmployee',
    'canUpdateEmployee',
    'canDeleteEmployee',
    'canViewProducts',
    'canCreateProducts',
    'canUpdateProducts',
    'canDeleteProducts',
    'canViewInventory',
    'canCreateInventory',
    'canUpdateInventory',
    'canDeleteInventory',
    'canViewOrders',
    'canCreateOrder',
    'canUpdateOrders',
    'canDeleteOrders',
    'canViewCoupons',
    'canCreateCoupons',
    'canUpdateCoupons',
    'canDeleteCoupons',
    'canViewCustomers',
    'canCreateCustomers',
    'canUpdateCustomers',
    'canDeleteCustomers',
    'canViewStoreSettings',
    'canCreateStoreSettings',
    'canUpdateStoreSettings',
    'canDeleteStoreSettings',
    'canViewStoreProfile',
    'canCreateStoreProfile',
    'canUpdateStoreProfile',
    'canDeleteStoreProfile',
    'canViewActivityLogs',
    'canCreateActivityLogs',
    'canUpdateActivityLogs',
    'canDeleteActivityLogs',
    'canViewBranches',
    'canCreateBranches',
    'canUpdateBranches',
    'canDeleteBranches',
    'canViewBlogs',
    'canCreateBlogs',
    'canUpdateBlogs',
    'canDeleteBlogs',
    'canViewShipping',
    'canCreateShipping',
    'canUpdateShipping',
    'canDeleteShipping',
    'canViewPayment',
    'canCreatePayment',
    'canUpdatePayment',
    'canDeletePayment',
    'canViewSubscription',
    'canCreateSubscription',
    'canUpdateSubscription',
    'canDeleteSubscription',
    'canViewConversation',
    'canCreateConversation',
    'canUpdateConversation',
    'canDeleteConversation',
    'canViewSecurity',
    'canCreateSecurity',
    'canUpdateSecurity',
    'canDeleteSecurity',
    'canViewNotifications',
    'canCreateNotifications',
    'canUpdateNotifications',
    'canDeleteNotifications',
    'canViewTransferStore',
    'canCreateTransferStore',
    'canUpdateTransferStore',
    'canDeleteTransferStore',
    'canViewTax',
    'canCreateTax',
    'canUpdateTax',
    'canDeleteTax',
  ],
  MANAGER: [
    'canViewCategory',
    'canCreateCategory',
    'canUpdateCategory',
    'canDeleteCategory',
    'canViewDashboard',
    'canViewFinance',
    'canViewEmployee',
    'canCreateEmployee',
    'canUpdateEmployee',
    'canViewProducts',
    'canCreateProducts',
    'canUpdateProducts',
    'canViewInventory',
    'canCreateInventory',
    'canUpdateInventory',
    'canViewOrders',
    'canCreateOrder',
    'canUpdateOrders',
    'canViewCoupons',
    'canCreateCoupons',
    'canUpdateCoupons',
    'canViewCustomers',
    'canCreateCustomers',
    'canUpdateCustomers',
    'canViewStoreSettings',
    'canUpdateStoreSettings',
    'canViewStoreProfile',
    'canUpdateStoreProfile',
    'canViewActivityLogs',
    'canViewBranches',
    'canUpdateBranches',
    'canViewBlogs',
    'canCreateBlogs',
    'canUpdateBlogs',
    'canViewShipping',
    'canUpdateShipping',
    'canViewPayment',
    'canUpdatePayment',
    'canViewConversation',
    'canCreateConversation',
    'canUpdateConversation',
    'canViewNotifications',
    'canUpdateNotifications',
    'canViewTax',
    'canUpdateTax',
  ],
  CASHIER: [
    'canViewDashboard',
    'canViewProducts',
    'canViewOrders',
    'canCreateOrder',
    'canUpdateOrders',
    'canViewCoupons',
    'canViewCustomers',
    'canCreateCustomers',
    'canUpdateCustomers',
    'canViewConversation',
    'canCreateConversation',
    'canUpdateConversation',
  ],
  STAFF: [
    'canViewDashboard',
    'canViewProducts',
    'canViewInventory',
    'canCreateInventory',
    'canUpdateInventory',
    'canViewOrders',
    'canCreateOrder',
    'canUpdateOrders',
    'canViewCoupons',
    'canViewCustomers',
    'canCreateCustomers',
    'canUpdateCustomers',
    'canViewConversation',
    'canCreateConversation',
    'canUpdateConversation',
  ],
  POS_CASHIER: [
    'canViewDashboard',
    'canViewProducts',
    'canViewInventory',
    'canViewOrders',
    'canCreateOrder',
    'canUpdateOrders',
    'canViewCoupons',
    'canViewCustomers',
    'canCreateCustomers',
    'canUpdateCustomers',
  ],
  POS_RESELLER: [
    'canViewProducts',
    'canViewInventory',
    'canViewOrders',
    'canCreateOrder',
    'canUpdateOrders',
    'canViewCustomers',
    'canCreateCustomers',
  ],
}

export const PERMISSION_MAPPING: Record<
  PermissionKey,
  { domain: PermissionDomain; action: PermissionAction }
> = {
  canViewStore: {
    domain: PermissionDomain.STORE,
    action: PermissionAction.READ,
  },
  canCreateStore: {
    domain: PermissionDomain.STORE,
    action: PermissionAction.CREATE,
  },
  canUpdateStore: {
    domain: PermissionDomain.STORE,
    action: PermissionAction.UPDATE,
  },
  canDeleteStore: {
    domain: PermissionDomain.STORE,
    action: PermissionAction.DELETE,
  },
  canViewCategory: {
    domain: PermissionDomain.CATEGORY,
    action: PermissionAction.READ,
  },
  canCreateCategory: {
    domain: PermissionDomain.CATEGORY,
    action: PermissionAction.CREATE,
  },
  canUpdateCategory: {
    domain: PermissionDomain.CATEGORY,
    action: PermissionAction.UPDATE,
  },
  canDeleteCategory: {
    domain: PermissionDomain.CATEGORY,
    action: PermissionAction.DELETE,
  },
  canViewCreditCard: {
    domain: PermissionDomain.TRANSACTION,
    action: PermissionAction.READ,
  },
  canCreateCreditCard: {
    domain: PermissionDomain.TRANSACTION,
    action: PermissionAction.CREATE,
  },
  canUpdateCreditCard: {
    domain: PermissionDomain.TRANSACTION,
    action: PermissionAction.UPDATE,
  },
  canDeleteCreditCard: {
    domain: PermissionDomain.TRANSACTION,
    action: PermissionAction.DELETE,
  },
  canViewFinance: {
    domain: PermissionDomain.FINANCE,
    action: PermissionAction.READ,
  },
  canCreateFinance: {
    domain: PermissionDomain.FINANCE,
    action: PermissionAction.CREATE,
  },
  canUpdateFinance: {
    domain: PermissionDomain.FINANCE,
    action: PermissionAction.UPDATE,
  },
  canDeleteFinance: {
    domain: PermissionDomain.FINANCE,
    action: PermissionAction.DELETE,
  },
  canViewDashboard: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.READ,
  },
  canCreateDashboard: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.CREATE,
  },
  canUpdateDashboard: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.UPDATE,
  },
  canDeleteDashboard: {
    domain: PermissionDomain.REPORT,
    action: PermissionAction.DELETE,
  },
  canViewEmployee: {
    domain: PermissionDomain.STAFF,
    action: PermissionAction.READ,
  },
  canCreateEmployee: {
    domain: PermissionDomain.STAFF,
    action: PermissionAction.CREATE,
  },
  canUpdateEmployee: {
    domain: PermissionDomain.STAFF,
    action: PermissionAction.UPDATE,
  },
  canDeleteEmployee: {
    domain: PermissionDomain.STAFF,
    action: PermissionAction.DELETE,
  },
  canViewProducts: {
    domain: PermissionDomain.PRODUCT,
    action: PermissionAction.READ,
  },
  canCreateProducts: {
    domain: PermissionDomain.PRODUCT,
    action: PermissionAction.CREATE,
  },
  canUpdateProducts: {
    domain: PermissionDomain.PRODUCT,
    action: PermissionAction.UPDATE,
  },
  canDeleteProducts: {
    domain: PermissionDomain.PRODUCT,
    action: PermissionAction.DELETE,
  },
  canViewInventory: {
    domain: PermissionDomain.INVENTORY,
    action: PermissionAction.READ,
  },
  canCreateInventory: {
    domain: PermissionDomain.INVENTORY,
    action: PermissionAction.CREATE,
  },
  canUpdateInventory: {
    domain: PermissionDomain.INVENTORY,
    action: PermissionAction.UPDATE,
  },
  canDeleteInventory: {
    domain: PermissionDomain.INVENTORY,
    action: PermissionAction.DELETE,
  },
  canViewOrders: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.READ,
  },
  canCreateOrder: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.CREATE,
  },
  canUpdateOrders: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.UPDATE,
  },
  canDeleteOrders: {
    domain: PermissionDomain.ORDER,
    action: PermissionAction.DELETE,
  },
  canViewCoupons: {
    domain: PermissionDomain.COUPON,
    action: PermissionAction.READ,
  },
  canCreateCoupons: {
    domain: PermissionDomain.COUPON,
    action: PermissionAction.CREATE,
  },
  canUpdateCoupons: {
    domain: PermissionDomain.COUPON,
    action: PermissionAction.UPDATE,
  },
  canDeleteCoupons: {
    domain: PermissionDomain.COUPON,
    action: PermissionAction.DELETE,
  },
  canViewCustomers: {
    domain: PermissionDomain.CUSTOMER,
    action: PermissionAction.READ,
  },
  canCreateCustomers: {
    domain: PermissionDomain.CUSTOMER,
    action: PermissionAction.CREATE,
  },
  canUpdateCustomers: {
    domain: PermissionDomain.CUSTOMER,
    action: PermissionAction.UPDATE,
  },
  canDeleteCustomers: {
    domain: PermissionDomain.CUSTOMER,
    action: PermissionAction.DELETE,
  },
  canViewStoreSettings: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.READ,
  },
  canCreateStoreSettings: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.CREATE,
  },
  canUpdateStoreSettings: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.UPDATE,
  },
  canDeleteStoreSettings: {
    domain: PermissionDomain.SETTING,
    action: PermissionAction.DELETE,
  },
  canViewStoreProfile: {
    domain: PermissionDomain.STORE_PROFILE,
    action: PermissionAction.READ,
  },
  canCreateStoreProfile: {
    domain: PermissionDomain.STORE_PROFILE,
    action: PermissionAction.CREATE,
  },
  canUpdateStoreProfile: {
    domain: PermissionDomain.STORE_PROFILE,
    action: PermissionAction.UPDATE,
  },
  canDeleteStoreProfile: {
    domain: PermissionDomain.STORE_PROFILE,
    action: PermissionAction.DELETE,
  },
  canViewActivityLogs: {
    domain: PermissionDomain.LOG,
    action: PermissionAction.READ,
  },
  canCreateActivityLogs: {
    domain: PermissionDomain.LOG,
    action: PermissionAction.CREATE,
  },
  canUpdateActivityLogs: {
    domain: PermissionDomain.LOG,
    action: PermissionAction.UPDATE,
  },
  canDeleteActivityLogs: {
    domain: PermissionDomain.LOG,
    action: PermissionAction.DELETE,
  },
  canViewBranches: {
    domain: PermissionDomain.BRANCH,
    action: PermissionAction.READ,
  },
  canCreateBranches: {
    domain: PermissionDomain.BRANCH,
    action: PermissionAction.CREATE,
  },
  canUpdateBranches: {
    domain: PermissionDomain.BRANCH,
    action: PermissionAction.UPDATE,
  },
  canDeleteBranches: {
    domain: PermissionDomain.BRANCH,
    action: PermissionAction.DELETE,
  },
  canViewBlogs: {
    domain: PermissionDomain.BLOG,
    action: PermissionAction.READ,
  },
  canCreateBlogs: {
    domain: PermissionDomain.BLOG,
    action: PermissionAction.CREATE,
  },
  canUpdateBlogs: {
    domain: PermissionDomain.BLOG,
    action: PermissionAction.UPDATE,
  },
  canDeleteBlogs: {
    domain: PermissionDomain.BLOG,
    action: PermissionAction.DELETE,
  },
  canViewShipping: {
    domain: PermissionDomain.SHIPPING,
    action: PermissionAction.READ,
  },
  canCreateShipping: {
    domain: PermissionDomain.SHIPPING,
    action: PermissionAction.CREATE,
  },
  canUpdateShipping: {
    domain: PermissionDomain.SHIPPING,
    action: PermissionAction.UPDATE,
  },
  canDeleteShipping: {
    domain: PermissionDomain.SHIPPING,
    action: PermissionAction.DELETE,
  },
  canViewPayment: {
    domain: PermissionDomain.PAYMENT,
    action: PermissionAction.READ,
  },
  canCreatePayment: {
    domain: PermissionDomain.PAYMENT,
    action: PermissionAction.CREATE,
  },
  canUpdatePayment: {
    domain: PermissionDomain.PAYMENT,
    action: PermissionAction.UPDATE,
  },
  canDeletePayment: {
    domain: PermissionDomain.PAYMENT,
    action: PermissionAction.DELETE,
  },
  canViewSubscription: {
    domain: PermissionDomain.SUBSCRIPTION,
    action: PermissionAction.READ,
  },
  canCreateSubscription: {
    domain: PermissionDomain.SUBSCRIPTION,
    action: PermissionAction.CREATE,
  },
  canUpdateSubscription: {
    domain: PermissionDomain.SUBSCRIPTION,
    action: PermissionAction.UPDATE,
  },
  canDeleteSubscription: {
    domain: PermissionDomain.SUBSCRIPTION,
    action: PermissionAction.DELETE,
  },
  canViewConversation: {
    domain: PermissionDomain.CONVERSATION,
    action: PermissionAction.READ,
  },
  canCreateConversation: {
    domain: PermissionDomain.CONVERSATION,
    action: PermissionAction.CREATE,
  },
  canUpdateConversation: {
    domain: PermissionDomain.CONVERSATION,
    action: PermissionAction.UPDATE,
  },
  canDeleteConversation: {
    domain: PermissionDomain.CONVERSATION,
    action: PermissionAction.DELETE,
  },
  canViewSecurity: {
    domain: PermissionDomain.SECURITY,
    action: PermissionAction.READ,
  },
  canCreateSecurity: {
    domain: PermissionDomain.SECURITY,
    action: PermissionAction.CREATE,
  },
  canUpdateSecurity: {
    domain: PermissionDomain.SECURITY,
    action: PermissionAction.UPDATE,
  },
  canDeleteSecurity: {
    domain: PermissionDomain.SECURITY,
    action: PermissionAction.DELETE,
  },
  canViewNotifications: {
    domain: PermissionDomain.NOTIFICATION,
    action: PermissionAction.READ,
  },
  canCreateNotifications: {
    domain: PermissionDomain.NOTIFICATION,
    action: PermissionAction.CREATE,
  },
  canUpdateNotifications: {
    domain: PermissionDomain.NOTIFICATION,
    action: PermissionAction.UPDATE,
  },
  canDeleteNotifications: {
    domain: PermissionDomain.NOTIFICATION,
    action: PermissionAction.DELETE,
  },
  canViewTransferStore: {
    domain: PermissionDomain.STORE_TRANSFER,
    action: PermissionAction.READ,
  },
  canCreateTransferStore: {
    domain: PermissionDomain.STORE_TRANSFER,
    action: PermissionAction.CREATE,
  },
  canUpdateTransferStore: {
    domain: PermissionDomain.STORE_TRANSFER,
    action: PermissionAction.UPDATE,
  },
  canDeleteTransferStore: {
    domain: PermissionDomain.STORE_TRANSFER,
    action: PermissionAction.DELETE,
  },
  canViewTax: {
    domain: PermissionDomain.TAX,
    action: PermissionAction.READ,
  },
  canCreateTax: {
    domain: PermissionDomain.TAX,
    action: PermissionAction.CREATE,
  },
  canUpdateTax: {
    domain: PermissionDomain.TAX,
    action: PermissionAction.UPDATE,
  },
  canDeleteTax: {
    domain: PermissionDomain.TAX,
    action: PermissionAction.DELETE,
  },
}

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  canViewStore: 'มีสิทธิ์ในการเปิดดูข้อมูลและรายละเอียดของร้านค้าทั้งหมดในระบบ',
  canCreateStore: 'มีสิทธิ์ในการสร้างร้านค้าใหม่ในระบบ',
  canUpdateStore: 'มีสิทธิ์ในการแก้ไขข้อมูลและการตั้งค่าของร้านค้า',
  canDeleteStore: 'มีสิทธิ์ในการลบร้านค้าและข้อมูลทั้งหมดออกจากระบบ',
  canViewCategory:
    'มีสิทธิ์ในการเปิดดูหมวดหมู่สินค้าหรือหมวดหมู่บทความทั้งหมดในระบบ',
  canCreateCategory:
    'มีสิทธิ์ในการสร้างและเพิ่มหมวดหมู่ใหม่สำหรับจัดกลุ่มสินค้าหรือบทความ',
  canUpdateCategory:
    'มีสิทธิ์ในการแก้ไขชื่อหรือรายละเอียดของหมวดหมู่สินค้าและบทความ',
  canDeleteCategory: 'มีสิทธิ์ในการลบหมวดหมู่สินค้าหรือบทความออกจากระบบ',
  canViewCreditCard:
    'มีสิทธิ์ในการเข้าถึงและตรวจสอบข้อมูลเกี่ยวกับบัตรเครดิต รวมถึงรายละเอียดธุรกรรมทางการเงินที่ชำระผ่านช่องทางอิเล็กทรอนิกส์ของร้านค้า',
  canCreateCreditCard:
    'มีสิทธิ์ในการเพิ่มหรือบันทึกข้อมูลบัตรเครดิตใหม่ลงในระบบ',
  canUpdateCreditCard:
    'มีสิทธิ์ในการแก้ไขหรืออัปเดตข้อมูลบัตรเครดิตและรายการธุรกรรมที่เกี่ยวข้อง',
  canDeleteCreditCard:
    'มีสิทธิ์ในการลบข้อมูลบัตรเครดิตหรือข้อมูลธุรกรรมที่บันทึกไว้ออกจากระบบ',
  canViewFinance:
    'มีสิทธิ์ในการดูรายงานและข้อมูลทางการเงิน เช่น ยอดรายรับ รายจ่าย กำไร-ขาดทุน และกระแสเงินสดของร้าน',
  canCreateFinance:
    'มีสิทธิ์ในการสร้างรายการบันทึกทางบัญชีหรือข้อมูลทางการเงินใหม่',
  canUpdateFinance:
    'มีสิทธิ์ในการแก้ไขปรับปรุงข้อมูลหรือตัวเลขทางบัญชีการเงินของร้านค้า',
  canDeleteFinance: 'มีสิทธิ์ในการลบรายการบันทึกทางการเงินออกจากระบบ',
  canViewDashboard:
    'มีสิทธิ์เข้าหน้าแดชบอร์ดหลักเพื่อดูภาพรวมสถิติต่างๆ กราฟวิเคราะห์ยอดขาย และรายงานสรุปผลการดำเนินงานประจำวัน',
  canCreateDashboard:
    'มีสิทธิ์ในการสร้างรายงานวิเคราะห์หรือวิดเจ็ตสรุปข้อมูลใหม่บนแดชบอร์ด',
  canUpdateDashboard:
    'มีสิทธิ์ในการแก้ไขเค้าโครงหรือปรับแต่งการแสดงผลข้อมูลบนหน้าแดชบอร์ด',
  canDeleteDashboard:
    'มีสิทธิ์ในการลบรายงานหรือวิดเจ็ตบนแดชบอร์ดที่ไม่ใช้งานออก',
  canViewEmployee:
    'มีสิทธิ์ในการเปิดดูรายชื่อและข้อมูลรายละเอียดของพนักงานภายในร้าน',
  canCreateEmployee: 'มีสิทธิ์ในการเพิ่มข้อมูลพนักงานใหม่เข้าสู่ระบบร้านค้า',
  canUpdateEmployee:
    'มีสิทธิ์ในการแก้ไขข้อมูลส่วนตัว หรือกำหนด/เปลี่ยนบทบาทหน้าที่สิทธิ์การเข้าถึงของพนักงานแต่ละคน',
  canDeleteEmployee: 'มีสิทธิ์ในการลบข้อมูลพนักงานออกจากระบบ',
  canViewProducts:
    'มีสิทธิ์ในการเปิดดูรายการสินค้า หมวดหมู่ ราคา และรายละเอียดสินค้าภายในระบบ',
  canCreateProducts: 'มีสิทธิ์ในการสร้างและเพิ่มรายการสินค้าใหม่เข้าสู่ระบบ',
  canUpdateProducts:
    'มีสิทธิ์ในการแก้ไขรายละเอียด ราคา หมวดหมู่ หรือข้อมูลเชิงลึกของสินค้าภายในระบบ',
  canDeleteProducts: 'มีสิทธิ์ในการลบรายการสินค้าออกจากระบบ',
  canViewInventory:
    'มีสิทธิ์ในการตรวจสอบจำนวนสินค้าคงเหลือและสถานะรายการในคลังสินค้า',
  canCreateInventory:
    'มีสิทธิ์ในการเพิ่มรายการสินค้าเข้าคลังหรือเปิดล็อตสินค้าใหม่',
  canUpdateInventory:
    'มีสิทธิ์ในการบริหารจัดการคลังสินค้า อัปเดตรายการสินค้าเข้า-ออกคลัง',
  canDeleteInventory: 'มีสิทธิ์ในการลบข้อมูลการจัดการคลังสินค้าที่ไม่จำเป็นออก',
  canViewOrders:
    'มีสิทธิ์ในการเปิดดูประวัติและรายการคำสั่งซื้อทั้งหมดที่เกิดขึ้นในร้าน',
  canCreateOrder:
    'มีสิทธิ์ในการสร้างคำสั่งซื้อใหม่ เปิดบิลขายสินค้าให้กับลูกค้า หรือบันทึกรายการซื้อขายหน้าเคาน์เตอร์',
  canUpdateOrders:
    'มีสิทธิ์ในการจัดการ ตรวจสอบ อัปเดตสถานะ หรือยกเลิกคำสั่งซื้อต่างๆ ที่เกิดขึ้นในระบบ',
  canDeleteOrders: 'มีสิทธิ์ในการลบประวัติคำสั่งซื้อออกจากระบบ',
  canViewCoupons:
    'มีสิทธิ์ในการเปิดดูรายการรหัสคูปองส่วนลดและเงื่อนไขแคมเปญต่างๆ',
  canCreateCoupons:
    'มีสิทธิ์ในการสร้างและกำหนดเงื่อนไขระบบคูปองส่วนลด แคมเปญส่งเสริมการขายต่างๆ สำหรับลูกค้า',
  canUpdateCoupons: 'มีสิทธิ์ในการแก้ไขรายละเอียดและเงื่อนไขของคูปองส่วนลด',
  canDeleteCoupons: 'มีสิทธิ์ในการลบแคมเปญคูปองส่วนลดออกจากระบบ',
  canViewCustomers:
    'มีสิทธิ์ในการเปิดดูรายชื่อ ประวัติการซื้อ และข้อมูลส่วนตัวของสมาชิกในระบบร้านค้า',
  canCreateCustomers: 'มีสิทธิ์ในการเพิ่มข้อมูลลูกค้าหรือสมาชิกใหม่เข้าสู่ระบบ',
  canUpdateCustomers:
    'มีสิทธิ์ในการจัดการและแก้ไขข้อมูลรายชื่อลูกค้า ประวัติการซื้อ หรือข้อมูลส่วนตัว',
  canDeleteCustomers: 'มีสิทธิ์ในการลบข้อมูลลูกค้าออกจากระบบ',
  canViewStoreSettings:
    'มีสิทธิ์ในการเปิดดูหน้าการตั้งค่าโครงสร้างและกฎระเบียบของร้านค้า',
  canCreateStoreSettings:
    'มีสิทธิ์ในการเพิ่มชุดการตั้งค่าหรือหมวดหมู่กฎระเบียบใหม่',
  canUpdateStoreSettings:
    'มีสิทธิ์ในการปรับเปลี่ยนการตั้งค่าโครงสร้างทั่วไปของร้านค้า กฎระเบียบ หรือระบบการทำงานภายในร้าน',
  canDeleteStoreSettings:
    'มีสิทธิ์ในการรีเซ็ตหรือลบการตั้งค่าเฉพาะส่วนของร้านค้าออก',
  canViewStoreProfile:
    'มีสิทธิ์ในการเปิดดูข้อมูลโปรไฟล์ร้านค้า โลโก้ และข้อมูลติดต่อสาธารณะ',
  canCreateStoreProfile: 'มีสิทธิ์ในการสร้างข้อมูลโปรไฟล์เริ่มต้นของร้านค้า',
  canUpdateStoreProfile:
    'มีสิทธิ์ในการแก้ไขโปรไฟล์ร้านค้า เช่น โลโก้ ชื่อร้าน คำอธิบาย และข้อมูลติดต่อสาธารณะ',
  canDeleteStoreProfile:
    'มีสิทธิ์ในการลบข้อมูลโปรไฟล์ร้านค้า (สำหรับกรณีปิดร้าน)',
  canViewActivityLogs:
    'มีสิทธิ์ในการตรวจสอบประวัติการใช้งานระบบ (Activity Logs) ดูว่าใครทำรายการหรือเข้าถึงข้อมูลส่วนไหนบ้างเพื่อความปลอดภัย',
  canCreateActivityLogs:
    'มีสิทธิ์ในการบันทึกหรือสร้างรายการบันทึกกิจกรรมเพิ่มเติมในระบบ',
  canUpdateActivityLogs: 'มีสิทธิ์ในการแก้ไขบันทึกประวัติการใช้งานระบบ',
  canDeleteActivityLogs:
    'มีสิทธิ์ในการลบประวัติการใช้งานระบบ (Activity Logs) ออกจากฐานข้อมูล',
  canViewBranches:
    'มีสิทธิ์ในการเปิดดูรายชื่อ ข้อมูลติดต่อ และพื้นที่บริการของแต่ละสาขา',
  canCreateBranches: 'มีสิทธิ์ในการเพิ่มสาขาใหม่ของร้านค้าในระบบ',
  canUpdateBranches:
    'มีสิทธิ์ในการจัดการข้อมูลสาขาของร้านค้า แก้ไขข้อมูลติดต่อ หรือกำหนดพื้นที่บริการ',
  canDeleteBranches: 'มีสิทธิ์ในการปิดหรือลบข้อมูลสาขาออกจากระบบ',
  canViewBlogs:
    'มีสิทธิ์ในการเปิดดูบทความ ข่าวสาร และบล็อกประชาสัมพันธ์ต่างๆ ของร้านค้า',
  canCreateBlogs:
    'มีสิทธิ์ในการสร้างและเขียนบทความ ข่าวสาร บล็อกประชาสัมพันธ์ใหม่',
  canUpdateBlogs: 'มีสิทธิ์ในการแก้ไขเนื้อหาบทความและข่าวสารของร้านค้า',
  canDeleteBlogs:
    'มีสิทธิ์ในการลบบทความ ข่าวสาร หรือบล็อกประชาสัมพันธ์ออกจากระบบ',
  canViewShipping: 'มีสิทธิ์ในการเปิดดูการตั้งค่าระบบการจัดส่งและบริษัทขนส่ง',
  canCreateShipping: 'มีสิทธิ์ในการเพิ่มช่องทางการจัดส่งหรือบริษัทขนส่งใหม่',
  canUpdateShipping:
    'มีสิทธิ์ในการตั้งค่าระบบการจัดส่งสินค้า รูปแบบการส่ง และบริษัทขนส่งที่รองรับภายในร้าน',
  canDeleteShipping: 'มีสิทธิ์ในการลบช่องทางการจัดส่งออกจากระบบ',
  canViewPayment:
    'มีสิทธิ์ในการตรวจสอบการตั้งค่าและช่องทางการรับชำระเงินของร้านค้า',
  canCreatePayment: 'มีสิทธิ์ในการเพิ่มช่องทางการรับชำระเงินรูปแบบใหม่',
  canUpdatePayment:
    'มีสิทธิ์ในการตั้งค่า เชื่อมต่อ หรือจัดการช่องทางการรับชำระเงินรูปแบบต่างๆ ของร้านค้า',
  canDeletePayment:
    'มีสิทธิ์ในการลบหรือยกเลิกการเชื่อมต่อช่องทางการรับชำระเงิน',
  canViewSubscription:
    'มีสิทธิ์ในการตรวจสอบแพ็กเกจการใช้งานระบบและสถานะการสมัครสมาชิก',
  canCreateSubscription: 'มีสิทธิ์ในการสมัครสมาชิกหรือเลือกแพ็กเกจบริการใหม่',
  canUpdateSubscription:
    'มีสิทธิ์ในการจัดการแพ็กเกจการใช้งานระบบ การต่ออายุ หรือการอัปเกรดบริการต่างๆ ของระบบร้านค้า',
  canDeleteSubscription: 'มีสิทธิ์ในการยกเลิกหรือลบการสมัครสมาชิกบริการ',
  canViewConversation:
    'มีสิทธิ์ในการเปิดดูและอ่านข้อความบทสนทนากับลูกค้าผ่านระบบสนับสนุน',
  canCreateConversation: 'มีสิทธิ์ในการเปิดแชทหรือเริ่มบทสนทนาใหม่กับลูกค้า',
  canUpdateConversation:
    'มีสิทธิ์ในการโต้ตอบแชท ข้อความ หรือจัดการสถานะบทสนทนากับลูกค้าผ่านระบบสนับสนุนของร้าน',
  canDeleteConversation: 'มีสิทธิ์ในการลบประวัติการสนทนากับลูกค้าออก',
  canViewSecurity: 'มีสิทธิ์ในการตรวจสอบการตั้งค่าความปลอดภัยของระบบ',
  canCreateSecurity: 'มีสิทธิ์ในการสร้างนโยบายความปลอดภัยใหม่',
  canUpdateSecurity:
    'มีสิทธิ์ในการตั้งค่าระบบความปลอดภัย การยืนยันตัวตน หรือนโยบายรหัสผ่านของร้านค้า',
  canDeleteSecurity: 'มีสิทธิ์ในการลบนโยบายความปลอดภัยออกจากระบบ',
  canViewNotifications: 'มีสิทธิ์ในการเปิดดูประวัติการแจ้งเตือนต่างๆ ภายในระบบ',
  canCreateNotifications:
    'มีสิทธิ์ในการสร้างหรือส่งการแจ้งเตือนใหม่หาลูกค้าหรือพนักงาน',
  canUpdateNotifications:
    'มีสิทธิ์ในการจัดการและปรับแต่งระบบการแจ้งเตือนต่างๆ ของร้านค้า',
  canDeleteNotifications: 'มีสิทธิ์ในการลบประวัติการแจ้งเตือนออกจากระบบ',
  canViewTransferStore: 'มีสิทธิ์ในการดูข้อมูลการโอนย้ายความเป็นเจ้าของร้านค้า',
  canCreateTransferStore:
    'มีสิทธิ์ในการเริ่มกระบวนการขอโอนย้ายความเป็นเจ้าของร้านค้า',
  canUpdateTransferStore:
    'มีสิทธิ์ในการอัปเดตหรือโอนย้ายความเป็นเจ้าของร้านค้าให้กับบัญชีผู้ใช้อื่น',
  canDeleteTransferStore: 'มีสิทธิ์ในการยกเลิกหรือลบคำขอการโอนย้ายร้านค้า',
  canViewTax: 'มีสิทธิ์ในการดูข้อมูลอัตราภาษีและการตั้งค่าภาษีมูลค่าเพิ่ม',
  canCreateTax: 'มีสิทธิ์ในการสร้างรายการอัตราภาษีหรือหมวดหมู่ภาษีใหม่',
  canUpdateTax:
    'มีสิทธิ์ในการตั้งค่าและจัดการข้อมูลอัตราภาษี การคำนวณภาษีมูลค่าเพิ่ม หรือเอกสารทางภาษีของร้าน',
  canDeleteTax: 'มีสิทธิ์ในการลบข้อมูลอัตราภาษีออกจากระบบ',
}
