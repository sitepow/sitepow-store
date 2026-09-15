import {
  IconBoxSeam,
  IconClockCheck,
  IconCreditCard,
  IconDatabase,
  IconDeviceDesktopAnalytics,
  IconGift,
  IconHeadset,
  IconInfinity,
  IconLayersIntersect,
  IconPercentage,
  IconServer,
  IconShieldCheck,
  IconSparkles,
  IconTrophy,
  IconWorld,
} from '@tabler/icons-react'

export interface BuyoutFeatureItem {
  text: string
  icon?: React.ReactNode
}

export interface BuyoutPlan {
  id: string
  title: string
  subtitle: string
  description: string
  price: string
  originalPrice: string
  saveAmount: string
  isPopular?: boolean
  breakEvenNote: string
  features: BuyoutFeatureItem[]
  freeServices: string[]
  ctaText: string
  ctaHref: string
}

export const BUYOUT_PLANS: BuyoutPlan[] = [
  {
    id: 'starter-buyout',
    title: 'Starter Buyout',
    subtitle: 'เริ่มต้นธุรกิจแบบมั่นคง ไร้ภาระค่าเช่ารายเดือน',
    description:
      'เหมาะสำหรับร้านค้าขนาดเล็กที่ต้องการระบบ POS และร้านค้าออนไลน์ส่วนตัว จ่ายครั้งเดียวจบ ใช้งานได้ตลอดชีพ',
    price: '14,900',
    originalPrice: '19,900',
    saveAmount: '5,000',
    breakEvenNote: 'คืนทุนใน ~2.5 ปี เทียบกับเช่ารายเดือน',
    features: [
      {
        text: 'สิทธิ์ใช้งานระบบตลอดชีพ (Lifetime License)',
        icon: <IconTrophy size={18} stroke={1.5} />,
      },
      {
        text: 'ไม่มีค่าบริการรายเดือน / รายปี (0 บาทตลอดชีพ)',
        icon: <IconPercentage size={18} stroke={1.5} />,
      },
      {
        text: 'ลงสินค้าได้สูงสุด 100 รายการ',
        icon: <IconLayersIntersect size={18} stroke={1.5} />,
      },
      {
        text: 'เชื่อมต่อระบบชำระเงิน Stripe (บัตร/PromptPay)',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: 'เชื่อมต่อโดเมนส่วนตัวของคุณเอง',
        icon: <IconWorld size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบ POS หน้าร้าน ตัดสต็อกแบบ Real-time',
        icon: <IconDeviceDesktopAnalytics size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบตรวจสอบสลิปโอนเงินอัตโนมัติ',
        icon: <IconShieldCheck size={18} stroke={1.5} />,
      },
    ],
    freeServices: [
      'ฟรี! บริการติดตั้งระบบและตั้งค่าเซิร์ฟเวอร์ (มูลค่า ฿5,000)',
      'ฟรี! ซัพพอร์ตแก้ปัญหาทางเทคนิคตลอด 1 ปีเต็ม (มูลค่า ฿6,000)',
      'ฟรี! อัปเดตแพตช์ความปลอดภัยตลอดอายุการใช้งาน',
    ],
    ctaText: 'เลือกแพ็กเกจ Starter',
    ctaHref: '/contact?subject=starter-buyout',
  },
  {
    id: 'pro-buyout',
    title: 'Pro Buyout',
    subtitle: 'แพ็กเกจยอดนิยม คืนทุนไว ขยายธุรกิจไร้ขีดจำกัด',
    description:
      'สำหรับร้านค้าที่ต้องการระบบเต็มรูปแบบ ลงสินค้าไม่จำกัด พร้อมพลัง AI และระบบสมาชิก CRM',
    price: '29,900',
    originalPrice: '39,900',
    saveAmount: '10,000',
    isPopular: true,
    breakEvenNote: 'คืนทุนใน ~2.5 ปี ประหยัดหลักแสนใน 5 ปี',
    features: [
      {
        text: 'สิทธิ์ใช้งานระบบระดับ Pro ตลอดชีพ',
        icon: <IconTrophy size={18} stroke={1.5} />,
      },
      {
        text: 'ไม่มีค่าบริการรายเดือน คืนทุนไวใน ~2.5 ปี',
        icon: <IconPercentage size={18} stroke={1.5} />,
      },
      {
        text: 'ลงสินค้าได้ไม่จำกัดจำนวน (Unlimited Products)',
        icon: <IconInfinity size={18} stroke={1.5} />,
      },
      {
        text: 'เชื่อมต่อระบบชำระเงิน Stripe + โดเมนส่วนตัว',
        icon: <IconCreditCard size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบ POS จัดการหลายสาขาและคลังสินค้า',
        icon: <IconBoxSeam size={18} stroke={1.5} />,
      },
      {
        text: 'AI อัจฉริยะช่วยเขียนแคปชันและตอบแชท',
        icon: <IconSparkles size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบเช็คสลิปโอนเงินอัตโนมัติด้วย AI',
        icon: <IconShieldCheck size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบ CRM สมาชิก สะสมแต้ม และคูปองโปรโมชั่น',
        icon: <IconDeviceDesktopAnalytics size={18} stroke={1.5} />,
      },
      {
        text: 'สิทธิ์ลบลายน้ำ Sitepow Store ออกจากหน้าร้าน',
        icon: <IconWorld size={18} stroke={1.5} />,
      },
    ],
    freeServices: [
      'ฟรี! บริการติดตั้งระบบแบบ Full-Setup พร้อมใช้งานทันที (มูลค่า ฿8,000)',
      'ฟรี! ซัพพอร์ตด่วนแก้ปัญหาเทคนิคตลอด 1 ปีเต็ม (มูลค่า ฿12,000)',
      'ฟรี! อบรมการใช้งานระบบแบบตัวต่อตัวสำหรับเจ้าของร้าน',
      'ฟรี! ระบบสำรองข้อมูลอัตโนมัติ (Automated Backup)',
    ],
    ctaText: 'เลือกแพ็กเกจ Pro ซื้อขาด',
    ctaHref: '/contact?subject=pro-buyout',
  },
  {
    id: 'ultimate-buyout',
    title: 'Ultimate Buyout',
    subtitle: 'ติดตั้งบน Private Cloud ส่วนตัว กรรมสิทธิ์ข้อมูล 100%',
    description:
      'สำหรับธุรกิจขนาดกลางถึงใหญ่และแบรนด์ที่ต้องการแยกเซิร์ฟเวอร์และฐานข้อมูลเป็นของตัวเองโดยเฉพาะ',
    price: '59,000',
    originalPrice: '79,000',
    saveAmount: '20,000',
    breakEvenNote: 'เหมาะสำหรับธุรกิจที่ต้องการเซิร์ฟเวอร์ส่วนตัว',
    features: [
      {
        text: 'สิทธิ์ใช้งานระบบระดับ Enterprise ตลอดชีพ',
        icon: <IconTrophy size={18} stroke={1.5} />,
      },
      {
        text: 'ติดตั้งบน Private Cloud / VPS ส่วนตัวของลูกค้า',
        icon: <IconServer size={18} stroke={1.5} />,
      },
      {
        text: 'ฐานข้อมูลและ Application Deployment เป็นกรรมสิทธิ์ลูกค้า 100%',
        icon: <IconDatabase size={18} stroke={1.5} />,
      },
      {
        text: 'ไม่จำกัดจำนวนสินค้า, ไม่จำกัดสาขา, ไม่จำกัดพนักงาน',
        icon: <IconInfinity size={18} stroke={1.5} />,
      },
      {
        text: 'ระบบตัวแทนจำหน่าย (Reseller & Dropship)',
        icon: <IconDeviceDesktopAnalytics size={18} stroke={1.5} />,
      },
      {
        text: 'เชื่อมต่อ API และ Marketplace ครบวงจร',
        icon: <IconWorld size={18} stroke={1.5} />,
      },
      {
        text: 'เรทเครดิต AI และเช็คสลิปในราคาทุนสุดพิเศษ',
        icon: <IconSparkles size={18} stroke={1.5} />,
      },
    ],
    freeServices: [
      'ฟรี! สถาปนิกวิศวกรติดตั้งและปรับแต่ง Cloud Server ส่วนตัว (มูลค่า ฿15,000)',
      'ฟรี! VIP Priority Support 24/7 ดูแลระดับองค์กร 1 ปีเต็ม (มูลค่า ฿24,000)',
      'ฟรี! อบรมการใช้งานสำหรับพนักงานและทีมงานทุกแผนก',
      'ฟรี! บริการย้ายข้อมูล (Migration) สินค้าและลูกค้าจากระบบเดิม',
    ],
    ctaText: 'ติดต่อติดตั้งแพ็กเกจ Ultimate',
    ctaHref: '/contact?subject=ultimate-buyout',
  },
]

export const BUYOUT_BENEFITS_ICONS = [
  <IconServer key="server" className="text-primary size-6" />,
  <IconHeadset key="headset" className="text-primary size-6" />,
  <IconClockCheck key="clock" className="text-primary size-6" />,
  <IconDatabase key="database" className="text-primary size-6" />,
  <IconPercentage key="percentage" className="text-primary size-6" />,
  <IconShieldCheck key="shield" className="text-primary size-6" />,
]
