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
    action: PermissionAction.DELETE,
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
    domain: PermissionDomain.FINANCE,
    action: PermissionAction.READ,
  },
  canViewActivityLogs: {
    domain: PermissionDomain.LOG,
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
    domain: PermissionDomain.STORE_PROFILE,
    action: PermissionAction.UPDATE,
  },
  canManageSecurity: {
    domain: PermissionDomain.SECURITY,
    action: PermissionAction.UPDATE,
  },
  canManageNotifications: {
    domain: PermissionDomain.NOTIFICATION,
    action: PermissionAction.UPDATE,
  },
  canTransferStore: {
    domain: PermissionDomain.STORE_TRANSFER,
    action: PermissionAction.UPDATE,
  },
  canManageTax: {
    domain: PermissionDomain.TAX,
    action: PermissionAction.UPDATE,
  },
}

export const PERMISSION_DESCRIPTIONS: Record<PermissionKey, string> = {
  canViewCreditCard:
    'มีสิทธิ์ในการเข้าถึงและตรวจสอบข้อมูลเกี่ยวกับบัตรเครดิต รวมถึงรายละเอียดธุรกรรมทางการเงินที่ชำระผ่านช่องทางอิเล็กทรอนิกส์ของร้านค้า',
  canViewDashboard:
    'มีสิทธิ์เข้าหน้าแดชบอร์ดหลักเพื่อดูภาพรวมสถิติต่างๆ กราฟวิเคราะห์ยอดขาย และรายงานสรุปผลการดำเนินงานประจำวัน',
  canManageEmployee:
    'มีสิทธิ์ในการเพิ่ม ลบ แก้ไขข้อมูลพนักงานในร้าน กำหนดบทบาทหน้าที่ รวมถึงการตั้งค่าสิทธิ์การเข้าถึงระบบส่วนต่างๆ ของพนักงานแต่ละคน',
  canManageProducts:
    'มีสิทธิ์ในการสร้าง แก้ไข ลบ หรืออัปเดตรายละเอียดสินค้า หมวดหมู่สินค้า ราคา และข้อมูลเชิงลึกของสินค้าภายในระบบ',
  canManageInventory:
    'มีสิทธิ์ในการบริหารจัดการคลังสินค้า ตรวจสอบจำนวนสินค้าคงเหลือ และอัปเดตรายการสินค้าเข้า-ออกคลัง',
  canManageStock:
    'มีสิทธิ์ระดับสูงในการทำรายการปรับปรุงสต็อกสินค้า หรือลบข้อมูลสต็อกที่มีผลกระทบโดยตรงต่อจำนวนสินค้าในระบบ',
  canCreateOrder:
    'มีสิทธิ์ในการสร้างคำสั่งซื้อใหม่ เปิดบิลขายสินค้าให้กับลูกค้า หรือบันทึกรายการซื้อขายหน้าเคาน์เตอร์',
  canManageOrders:
    'มีสิทธิ์ในการจัดการ ตรวจสอบ และอัปเดตสถานะของคำสั่งซื้อต่างๆ (เช่น เปลี่ยนสถานะการจัดส่ง หรือแก้ไขออร์เดอร์)',
  canCancelOrder:
    'มีสิทธิ์ในการยกเลิกคำสั่งซื้อที่เกิดขึ้นในระบบ ซึ่งรวมถึงการคืนสินค้าหรือยกบิลที่ทำรายการไปแล้ว',
  canManageCoupons:
    'มีสิทธิ์ในการสร้าง กำหนดเงื่อนไข และจัดการระบบคูปองส่วนลด แคมเปญส่งเสริมการขายต่างๆ สำหรับลูกค้า',
  canManageCustomers:
    'มีสิทธิ์ในการจัดการข้อมูลรายชื่อลูกค้า ประวัติการซื้อ และข้อมูลส่วนตัวของสมาชิกในระบบร้านค้า',
  canManageStoreSettings:
    'มีสิทธิ์ในการปรับเปลี่ยนการตั้งค่าโครงสร้างทั่วไปของร้านค้า กฎระเบียบ หรือระบบการทำงานภายในร้าน',
  canViewFinance:
    'มีสิทธิ์ในการดูรายงานและข้อมูลทางการเงิน เช่น ยอดรายรับ รายจ่าย กำไร-ขาดทุน และกระแสเงินสดของร้าน',
  canViewActivityLogs:
    'มีสิทธิ์ในการตรวจสอบประวัติการใช้งานระบบ (Activity Logs) ดูว่าใครทำรายการหรือเข้าถึงข้อมูลส่วนไหนบ้างเพื่อความปลอดภัย',
  canManageBranches:
    'มีสิทธิ์ในการจัดการข้อมูลสาขาของร้านค้า เพิ่มสาขาใหม่ แก้ไขข้อมูลติดต่อ หรือกำหนดพื้นที่บริการของแต่ละสาขา',
  canManageBlogs:
    'มีสิทธิ์ในการสร้าง เขียน แก้ไข หรือลบบทความ ข่าวสาร และบล็อกประชาสัมพันธ์ต่างๆ ของร้านค้า',
  canManageShipping:
    'มีสิทธิ์ในการตั้งค่าระบบการจัดส่งสินค้า รูปแบบการส่ง และบริษัทขนส่งที่รองรับภายในร้าน',
  canManagePayment:
    'มีสิทธิ์ในการตั้งค่า เชื่อมต่อ หรือจัดการช่องทางการรับชำระเงินรูปแบบต่างๆ ของร้านค้า',
  canManageSubscription:
    'มีสิทธิ์ในการจัดการแพ็กเกจการใช้งานระบบ การต่ออายุ หรือการสมัครสมาชิกบริการต่างๆ ของระบบร้านค้า',
  canManageConversation:
    'มีสิทธิ์ในการเปิดดูและโต้ตอบแชท ข้อความ หรือบทสนทนากับลูกค้าผ่านระบบสนับสนุนของร้าน',
  canManageStoreProfile:
    'มีสิทธิ์ในการแก้ไขโปรไฟล์ร้านค้า เช่น โลโก้ ชื่อร้าน คำอธิบาย และข้อมูลติดต่อสาธารณะ',
  canManageSecurity:
    'มีสิทธิ์ในการตั้งค่าระบบความปลอดภัย การยืนยันตัวตน หรือนโยบายรหัสผ่านของร้านค้า',
  canManageNotifications:
    'มีสิทธิ์ในการจัดการระบบการแจ้งเตือนต่างๆ ของร้านค้า เช่น การส่งแจ้งเตือนหาลูกค้าหรือพนักงาน',
  canTransferStore:
    'มีสิทธิ์สูงสุดในการโอนย้ายความเป็นเจ้าของร้านค้าให้กับบัญชีผู้ใช้อื่น (สิทธิ์เฉพาะของ Owner)',
  canManageTax:
    'มีสิทธิ์ในการตั้งค่าและจัดการข้อมูลอัตราภาษี การคำนวณภาษีมูลค่าเพิ่ม หรือเอกสารทางภาษีของร้าน',
}
