import { DiscountType } from '@/generated/prisma/enums'
import { ProductFormValues } from '@/zod/product'

export const PRODUCT_PRESETS_MASTER = [
  {
    type: 'PHYSICAL_STANDARD',
    label: 'ตัวอย่าง สินค้าทั่วไป (ชิ้นเดี่ยว)',
    toastLabel: 'สินค้าทั่วไป (ชิ้นเดี่ยว)',
    data: {
      title: '[ตัวอย่าง] สมาร์ทโฟน X-Phone Pro 15 (256GB, Black)',
      slug: 'x-phone-pro-15-256gb-black',
      images: [],
      variants: [
        {
          title: 'เครื่องเปล่า (รับประกันศูนย์ 1 ปี)',
          price: 35900,
          sku: 'XP-15PRO-256-BLK',
          stocks: [{ branchId: '', quantity: 45, minStock: 5 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 2000 },
          rewardPoints: { isActive: true, amount: 350 },
        },
      ],
      addons: [
        {
          title: 'ฟิล์มกระจกกันรอยนิรภัยแบบเต็มจอ (รวมติดตั้ง)',
          price: 490,
          isAvailable: true,
        },
        {
          title: 'หัวชาร์จเร็ว Fast Charge 35W Type-C',
          price: 790,
          isAvailable: true,
        },
        {
          title: 'ประกันอุบัติเหตุหน้าจอแตกเพิ่มเป็น 2 ปี',
          price: 1500,
          isAvailable: true,
        },
        {
          title: 'เคสกันกระแทกเกดทหารกันตก 2 เมตร',
          price: 890,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'brand', value: 'X-Brand' },
        { key: 'model', value: 'X-Phone Pro 15' },
        { key: 'series', value: 'Pro Series' },
        { key: 'country_of_origin', value: 'ประเทศไต้หวัน' },
        { key: 'warranty_period', value: '1 ปี' },
        { key: 'warranty_type', value: 'การรับประกันจากผู้ผลิตภายในประเทศ' },
        { key: 'condition', value: 'ใหม่มือหนึ่ง' },
        {
          key: 'material',
          value: 'ไทเทเนียมเกรดการแพทย์ และกระจก Matte Glass',
        },
        { key: 'capacity_volume', value: 'ความจุ 256GB' },
        { key: 'power_consumption', value: '25' },
        { key: 'battery_capacity', value: '4352 mAh' },
        { key: 'charging_port', value: 'USB-C' },
        { key: 'operating_system', value: 'iOS / Android Compatible' },
        { key: 'resolution', value: '48 Megapixels' },
        { key: 'display_type', value: 'Super Retina XDR OLED' },
        { key: 'refresh_rate', value: '120 Hz' },
        { key: 'processor_cpu', value: 'A17 Pro Bionic' },
        { key: 'ram_capacity', value: '8GB' },
        { key: 'storage_capacity', value: '256GB' },
        { key: 'waterproof_rating', value: 'IP68' },
        { key: 'certifications', value: 'มอก. 2555-2560' },
      ],
      tags: 'สมาร์ทโฟน, มือถือ, ไอที, xphone, โทรศัพท์มือถือ, สินค้าขายดี',
      weight: 0.22,
      width: 7.6,
      height: 16.0,
      length: 0.8,
    },
  },
  {
    type: 'PHYSICAL_CLOTHES',
    label: 'ตัวอย่าง สินค้าแฟชั่น (หลายไซส์/สี)',
    toastLabel: 'สินค้าแฟชั่น (หลายไซส์/สี)',
    data: {
      title:
        '[ตัวอย่าง] กางเกงคาร์โก้ขายาว ทรง Loose-Fit เนื้อผ้า Premium Twill',
      slug: 'premium-twill-cargo-pants',
      images: [],
      variants: [
        {
          title: 'สีเขียวทหาร (Military Green) - Size M',
          price: 790,
          sku: 'CG-GRN-M',
          stocks: [{ branchId: '', quantity: 30, minStock: 3 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 10 },
          rewardPoints: { isActive: true, amount: 15 },
        },
        {
          title: 'สีเขียวทหาร (Military Green) - Size L',
          price: 790,
          sku: 'CG-GRN-L',
          stocks: [{ branchId: '', quantity: 25, minStock: 3 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 10 },
          rewardPoints: { isActive: true, amount: 15 },
        },
        {
          title: 'สีเขียวทหาร (Military Green) - Size XL',
          price: 820,
          sku: 'CG-GRN-XL',
          stocks: [{ branchId: '', quantity: 10, minStock: 2 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 10 },
          rewardPoints: { isActive: true, amount: 15 },
        },
        {
          title: 'สีสีกรมท่า (Midnight Navy) - Size M',
          price: 850,
          sku: 'CG-NVY-M',
          stocks: [{ branchId: '', quantity: 20, minStock: 2 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 20 },
        },
        {
          title: 'สีสีกรมท่า (Midnight Navy) - Size L',
          price: 850,
          sku: 'CG-NVY-L',
          stocks: [{ branchId: '', quantity: 15, minStock: 2 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 20 },
        },
        {
          title: 'สีสีกรมท่า (Midnight Navy) - Size XL',
          price: 890,
          sku: 'CG-NVY-XL',
          stocks: [{ branchId: '', quantity: 8, minStock: 1 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 20 },
        },
      ],
      addons: [
        {
          title: 'เข็มขัดผ้าสไตล์ Tactical เข้าชุดกัน',
          price: 190,
          isAvailable: true,
        },
        {
          title: 'บริการตัดขากางเกงตามความยาวที่ต้องการ',
          price: 50,
          isAvailable: true,
        },
        {
          title: 'กล่องของขวัญและพัสดุผูกโบว์สไตล์พรีเมียม',
          price: 60,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'brand', value: 'UrbanWeave' },
        { key: 'condition', value: 'ใหม่มือหนึ่ง' },
        { key: 'material', value: 'ผ้าคอตตอนทวิล (Premium Twill Cotton 100%)' },
        { key: 'size', value: 'M, L, XL' },
        { key: 'color', value: 'Military Green, Midnight Navy' },
        { key: 'fabric_type', value: 'Twill Cotton 100%' },
        { key: 'fit_type', value: 'Loose-Fit / ทรงหลวมสบาย' },
        { key: 'gender', value: 'Unisex / ใส่ได้ทุกเพศ' },
        { key: 'style', value: 'สตรีทแฟชั่น / คาร์โก้มินิมอล' },
        { key: 'closure_type', value: 'กระดุมและซิปหน้า' },
        { key: 'pattern', value: 'สีพื้นเรียบ' },
      ],
      tags: 'กางเกงคาร์โก้, เสื้อผ้าผู้ชาย, กางเกงขายาว, แฟชั่นสตรีท, แฟชั่นเกาหลี',
      weight: 0.45,
      width: 25.0,
      height: 4.0,
      length: 35.0,
    },
  },
  {
    type: 'EBOOK',
    label: 'ตัวอย่าง E-book',
    toastLabel: 'E-book',
    data: {
      title:
        '[ตัวอย่าง] มหากาพย์คู่มือการเขียนโค้ด Next.js 14 & โครงสร้างซอฟต์แวร์ระดับองค์กร',
      slug: 'epic-nextjs-enterprise-architecture-guide',
      images: [],
      variants: [
        {
          title: 'Standard PDF (สำหรับอ่านส่วนบุคคล)',
          price: 590,
          sku: 'EB-NEXT-STD',
          stocks: [{ branchId: '', quantity: 99999, minStock: 0 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 100 },
          rewardPoints: { isActive: true, amount: 30 },
        },
        {
          title: 'Premium Bundle (PDF + ไฟล์ Source Code ตัวอย่างโปรเจกต์)',
          price: 1290,
          sku: 'EB-NEXT-PREM',
          stocks: [{ branchId: '', quantity: 99999, minStock: 0 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 80 },
        },
        {
          title:
            'Corporate License (สิทธิ์ให้ทีมงานในองค์กรอ่านได้สูงสุด 10 คน)',
          price: 3900,
          sku: 'EB-NEXT-CORP',
          stocks: [{ branchId: '', quantity: 99999, minStock: 0 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 15 },
          rewardPoints: { isActive: true, amount: 250 },
        },
      ],
      addons: [
        {
          title: 'สิทธิ์เข้าร่วมกลุ่ม Discord สอบถามปัญหาโค้ดกับผู้เขียน',
          price: 300,
          isAvailable: true,
        },
        {
          title: 'อัปเดตเนื้อหาฟรีเมื่อมีเวอร์ชันใหม่เวอร์ชันถัดไป (1 ปี)',
          price: 200,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'author_creator', value: 'นักพัฒนาซอฟต์แวร์นิรนาม' },
        { key: 'publisher', value: 'DevPress Publishing' },
        { key: 'isbn_issn', value: '978-616-12345-6-7' },
        { key: 'page_count', value: '540 หน้า' },
        { key: 'language', value: 'ภาษาไทย (มีศัพท์เทคนิคอังกฤษกำกับ)' },
        {
          key: 'book_binding',
          value: 'ไฟล์ดิจิทัลดาวน์โหลด (E-Book รูปแบบไฟล์ PDF)',
        },
        { key: 'condition', value: 'สินค้าดิจิทัลใหม่' },
      ],
      tags: 'nextjs, react, typescript, ebook, พัฒนาเว็บ, คู่มือเขียนโปรแกรม, หนังสือคอมพิวเตอร์',
      weight: undefined,
      width: undefined,
      height: undefined,
      length: undefined,
    },
  },
  {
    type: 'COURSE',
    label: 'ตัวอย่าง คอร์สออนไลน์',
    toastLabel: 'คอร์สออนไลน์',
    data: {
      title:
        '[ตัวอย่าง] Full-Stack Web Development Bootcamp (จากศูนย์สู่โปรมืออาชีพ)',
      slug: 'fullstack-web-development-bootcamp',
      images: [],
      variants: [
        {
          title: 'Self-Paced (เรียนด้วยตัวเองผ่านระบบวิดีโอ เข้าดูได้ตลอดชีพ)',
          price: 4900,
          sku: 'CRS-FS-SELF',
          stocks: [{ branchId: '', quantity: 99999, minStock: 0 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 1000 },
          rewardPoints: { isActive: true, amount: 200 },
        },
        {
          title:
            'Mentorship (เรียนวิดีโอ + โค้ชชิ่งตรวจการบ้านรายสัปดาห์ 3 เดือน)',
          price: 12500,
          sku: 'CRS-FS-MENTOR',
          stocks: [{ branchId: '', quantity: 30, minStock: 5 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 600 },
        },
        {
          title:
            'VIP Fast-Track (วิดีโอ + โค้ชชิ่ง 1-on-1 แบบส่วนตัวจนกว่าจะสัญญางานผ่าน)',
          price: 29900,
          sku: 'CRS-FS-VIP',
          stocks: [{ branchId: '', quantity: 5, minStock: 1 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 3000 },
          rewardPoints: { isActive: true, amount: 1500 },
        },
      ],
      addons: [
        {
          title: 'คอร์สปรับพื้นฐานภาษาอังกฤษสำหรับ Programmer',
          price: 990,
          isAvailable: true,
        },
        {
          title: 'สิทธิ์จำลองการสอบสัมภาษณ์งาน (Mock Interview) 1 ชั่วโมง',
          price: 1500,
          isAvailable: true,
        },
        {
          title: 'ใบประกาศนียบัตรแบบพิมพ์เป็นแผ่น แสตมป์ตราสถาบันส่งถึงบ้าน',
          price: 350,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'brand', value: 'สถาบัน TechAcademy' },
        {
          key: 'author_creator',
          value: 'ทีมอาจารย์ผู้เชี่ยวชาญจากสถาบัน TechAcademy',
        },
        { key: 'page_count', value: '45 ชั่วโมง (มากกว่า 120 บทเรียน)' },
        { key: 'language', value: 'บรรยายภาษาไทย / โค้ดภาษาอังกฤษ' },
        { key: 'warranty_period', value: '7 วัน' },
        { key: 'warranty_type', value: 'การรับประกันความพึงพอใจยินดีคืนเงิน' },
      ],
      tags: 'คอร์สออนไลน์, เรียนเขียนโค้ด, fullstack, javascript, nodejs, พัฒนาซอฟต์แวร์',
      weight: undefined,
      width: undefined,
      height: undefined,
      length: undefined,
    },
  },
  {
    type: 'SERVICE_TICKET',
    label: 'ตัวอย่าง บริการ / บัตรอีเวนต์',
    toastLabel: 'บริการ / บัตรอีเวนต์',
    data: {
      title:
        '[ตัวอย่าง] บัตรเข้างานสัมมนาการลงทุนระดับโลก Global Investment Forum 2026',
      slug: 'global-investment-forum-2026',
      images: [],
      variants: [
        {
          title: 'บัตร Regular (เข้าฟังสัมมนาได้ทุกฮอลล์ + อาหารว่าง)',
          price: 2500,
          sku: 'EV-GIF2026-REG',
          stocks: [{ branchId: '', quantity: 500, minStock: 20 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 15 },
          rewardPoints: { isActive: true, amount: 50 },
        },
        {
          title:
            'บัตร VIP (แถวหน้าสุด + อาหารกลางวันบุฟเฟต์โรงแรม + สิทธิ์เข้า After Party)',
          price: 6500,
          sku: 'EV-GIF2026-VIP',
          stocks: [{ branchId: '', quantity: 80, minStock: 10 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 200 },
        },
        {
          title:
            'บัตร VVIP Elite (สิทธิ์นั่งโซฟาหน้าสุด + ดินเนอร์ส่วนตัวกับ Speaker ชื่อดัง)',
          price: 15000,
          sku: 'EV-GIF2026-VVIP',
          stocks: [{ branchId: '', quantity: 15, minStock: 2 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 500 },
        },
      ],
      addons: [
        {
          title: 'หนังสือสรุปบทวิเคราะห์ตลาดทุนครึ่งปีหลัง (เล่มพิมพ์ปกแข็ง)',
          price: 450,
          isAvailable: true,
        },
        {
          title: 'หูฟังแปลภาษาแบบ Real-time ตลอดวันงาน',
          price: 300,
          isAvailable: true,
        },
        {
          title: 'จองสิทธิ์ที่จอดรถโซนพิเศษภายในงาน 1 คัน',
          price: 200,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'brand', value: 'สถาบันวิจัยการลงทุน WealthX' },
        {
          key: 'certifications',
          value: 'เลขที่อนุญาตการจัดกิจกรรมสมาคมฯ 104/2026',
        },
      ],
      tags: 'งานสัมมนา, บัตรเข้างาน, ตั๋ว, การลงทุน, หุ้น, คริปโต, อสังหาริมทรัพย์',
      weight: undefined,
      width: undefined,
      height: undefined,
      length: undefined,
    },
  },
] satisfies {
  type: string
  label: string
  toastLabel: string
  data: Partial<ProductFormValues>
}[]
