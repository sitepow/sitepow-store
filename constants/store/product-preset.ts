import { DiscountType } from '@/generated/prisma/enums'
import { ProductFormValues } from '@/zod/catalog/product'

export const PRODUCT_PRESETS_MASTER = [
  {
    id: 'clx0y1z2a000008l43g9x9v8r',
    label: 'สินค้าอิเล็กทรอนิกส์ (Smartphone)',
    toastLabel: 'Smartphone',
    data: {
      title: 'Apple iPhone 15 Pro (128GB, Natural Titanium)',
      slug: 'apple-iphone-15-pro-128gb-natural-titanium',
      images: [],
      variants: [
        {
          title: 'เครื่องเปล่า (ประกันศูนย์ 1 ปี)',
          price: 41900,
          sku: 'APL-IP15P-128-NT',
          stocks: [{ branchId: '', quantity: 50, minStock: 10 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 2000 },
          rewardPoints: { isActive: true, amount: 400 },
        },
      ],
      addons: [
        {
          title: 'AppleCare+ สำหรับ iPhone 15 Pro',
          price: 6500,
          isAvailable: true,
        },
        {
          title: 'อะแดปเตอร์แปลงไฟ Apple 20W USB-C',
          price: 790,
          isAvailable: true,
        },
        {
          title: 'เคสซิลิโคนพร้อม MagSafe - สี Clay',
          price: 1990,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'brand', value: 'Apple' },
        { key: 'model', value: 'iPhone 15 Pro' },
        { key: 'material', value: 'ไทเทเนียมระดับอากาศยาน' },
        { key: 'battery_capacity', value: '3274 mAh' },
        { key: 'processor_cpu', value: 'A17 Pro chip' },
        { key: 'operating_system', value: 'iOS' },
      ],
      tags: 'apple, iphone, smartphone, มือถือ, ไอที',
    },
  },
  {
    id: 'clx0y1z2a000108l49z8n7m6p',
    label: 'เสื้อผ้าแฟชั่น (Unisex)',
    toastLabel: 'แฟชั่น',
    data: {
      title: 'Uniqlo เสื้อยืดคอกลม ผ้าคอตตอน (U Crew Neck T-Shirt)',
      slug: 'uniqlo-u-crew-neck-tshirt',
      images: [],
      variants: [
        {
          title: 'สีขาว (White) - Size M',
          price: 590,
          sku: 'UNI-UT-WHT-M',
          stocks: [{ branchId: '', quantity: 100, minStock: 20 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 5 },
        },
        {
          title: 'สีดำ (Black) - Size L',
          price: 590,
          sku: 'UNI-UT-BLK-L',
          stocks: [{ branchId: '', quantity: 80, minStock: 20 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 5 },
        },
      ],
      addons: [{ title: 'บริการห่อของขวัญ', price: 30, isAvailable: true }],
      metadata: [
        { key: 'brand', value: 'Uniqlo' },
        { key: 'material', value: 'Cotton 100%' },
        { key: 'gender', value: 'Unisex' },
      ],
      tags: 'เสื้อยืด, เสื้อผ้า, uniqlo, แฟชั่น',
    },
  },
  {
    id: 'clx0y1z2a000208l42b5k8j9q',
    label: 'หนังสือดิจิทัล (E-Book)',
    toastLabel: 'E-Book',
    data: {
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      slug: 'clean-code-robert-martin',
      images: [],
      variants: [
        {
          title: 'Digital PDF (Standard)',
          price: 990,
          sku: 'EB-CLEANCODE-PDF',
          stocks: [{ branchId: '', quantity: 99999, minStock: 0 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 10 },
          rewardPoints: { isActive: true, amount: 90 },
        },
      ],
      addons: [],
      metadata: [
        { key: 'author_creator', value: 'Robert C. Martin' },
        { key: 'language', value: 'English' },
        { key: 'page_count', value: '464' },
      ],
      tags: 'software, development, programming, book, ebook',
    },
  },
  {
    id: 'clx0y1z2a000308l41d9c7w6r',
    label: 'คอร์สเรียนออนไลน์',
    toastLabel: 'คอร์สเรียน',
    data: {
      title: 'The Complete Web Development Bootcamp 2026',
      slug: 'web-dev-bootcamp-2026',
      images: [],
      variants: [
        {
          title: 'Lifetime Access (Self-paced)',
          price: 2990,
          sku: 'CRS-WEB-2026-FULL',
          stocks: [{ branchId: '', quantity: 99999, minStock: 0 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 500 },
          rewardPoints: { isActive: true, amount: 100 },
        },
      ],
      addons: [
        {
          title: 'ตรวจ Code การบ้านส่วนตัว (1 เดือน)',
          price: 1500,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'brand', value: 'Udemy' },
        { key: 'language', value: 'English' },
        { key: 'page_count', value: '60 ชั่วโมง' },
      ],
      tags: 'coding, web, bootcamp, development',
    },
  },
  {
    id: 'clx0y1z2a000408l46s3p2f5h',
    label: 'อุปกรณ์สำนักงาน (Mouse)',
    toastLabel: 'Mouse',
    data: {
      title: 'Logitech MX Master 3S Wireless Performance Mouse',
      slug: 'logitech-mx-master-3s',
      images: [],
      variants: [
        {
          title: 'Graphite (ประกันศูนย์ 1 ปี)',
          price: 4290,
          sku: 'LOGI-MX3S-GRP',
          stocks: [{ branchId: '', quantity: 20, minStock: 5 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 300 },
          rewardPoints: { isActive: true, amount: 40 },
        },
      ],
      addons: [
        {
          title: 'แผ่นรองเมาส์ขนาดใหญ่ (Desk Mat)',
          price: 490,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'brand', value: 'Logitech' },
        { key: 'connectivity_type', value: 'Bluetooth / Logi Bolt' },
        { key: 'sensor_type', value: '8000 DPI Darkfield' },
      ],
      tags: 'logitech, mouse, อุปกรณ์ไอที, เมาส์ไร้สาย, ออฟฟิศ',
    },
  },
  {
    id: 'clx0y1z2a000508l44f1t8v9k',
    label: 'เครื่องใช้ไฟฟ้าในบ้าน (Air Purifier)',
    toastLabel: 'เครื่องฟอกอากาศ',
    data: {
      title: 'Xiaomi Smart Air Purifier 4 Pro',
      slug: 'xiaomi-air-purifier-4-pro',
      images: [],
      variants: [
        {
          title: 'Standard White',
          price: 7990,
          sku: 'XIAOMI-AIR-4PRO',
          stocks: [{ branchId: '', quantity: 15, minStock: 2 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 10 },
          rewardPoints: { isActive: true, amount: 100 },
        },
      ],
      addons: [{ title: 'ไส้กรอง HEPA สำรอง', price: 1290, isAvailable: true }],
      metadata: [
        { key: 'brand', value: 'Xiaomi' },
        { key: 'capacity_volume', value: '35-60 ตร.ม.' },
      ],
      tags: 'xiaomi, เครื่องฟอกอากาศ, สุขภาพ, บ้านและสวน',
    },
  },
  {
    id: 'clx0y1z2a000608l49w2q5m7n',
    label: 'รองเท้ากีฬา (Running Shoes)',
    toastLabel: 'รองเท้ากีฬา',
    data: {
      title: 'Nike Air Zoom Pegasus 41',
      slug: 'nike-pegasus-41',
      images: [],
      variants: [
        {
          title: 'Black/White - US 9',
          price: 4700,
          sku: 'NIKE-PEG41-BW-09',
          stocks: [{ branchId: '', quantity: 10, minStock: 2 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 50 },
        },
      ],
      addons: [
        { title: 'ถุงเท้าวิ่งแบบหนาพิเศษ', price: 250, isAvailable: true },
      ],
      metadata: [
        { key: 'brand', value: 'Nike' },
        { key: 'sport_type', value: 'Running' },
      ],
      tags: 'nike, รองเท้าวิ่ง, กีฬา, ออกกำลังกาย',
    },
  },
  {
    id: 'clx0y1z2a000708l41k4b9p3x',
    label: 'บัตรของขวัญ / เวาเชอร์ (Gift Voucher)',
    toastLabel: 'Gift Voucher',
    data: {
      title: 'Central Department Store Digital Gift Card - 1,000 THB',
      slug: 'central-gift-card-1000',
      images: [],
      variants: [
        {
          title: 'มูลค่า 1,000 บาท',
          price: 1000,
          sku: 'CENTRAL-GC-1000',
          stocks: [{ branchId: '', quantity: 500, minStock: 0 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 10 },
        },
      ],
      addons: [],
      metadata: [
        { key: 'brand', value: 'Central' },
        { key: 'expiration_date_info', value: '1 ปีนับจากวันที่ซื้อ' },
      ],
      tags: 'voucher, ของขวัญ, บัตรกำนัล, เซ็นทรัล',
    },
  },
  {
    id: 'clx0y1z2a000808l43j7d5m2s',
    label: 'เบเกอรี่ (เค้กวันเกิด)',
    toastLabel: 'เค้กวันเกิด',
    data: {
      title: 'เค้กช็อกโกแลตหน้านิ่มสูตรดาร์กโกโก้ (Soft Dark Chocolate Cake)',
      slug: 'soft-dark-chocolate-cake',
      images: [],
      variants: [
        {
          title: 'ขนาด 1 ปอนด์',
          price: 490,
          sku: 'CAKE-CHOC-1LB',
          stocks: [{ branchId: '', quantity: 10, minStock: 2 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 40 },
          rewardPoints: { isActive: true, amount: 10 },
        },
        {
          title: 'ขนาด 2 ปอนด์',
          price: 890,
          sku: 'CAKE-CHOC-2LB',
          stocks: [{ branchId: '', quantity: 5, minStock: 1 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 80 },
          rewardPoints: { isActive: true, amount: 20 },
        },
      ],
      addons: [
        { title: 'ชุดเทียนวันเกิดพรีเมียม', price: 35, isAvailable: true },
        { title: 'บริการเขียนข้อความบนหน้าเค้ก', price: 0, isAvailable: true },
        {
          title: 'เพิ่มป้าย Happy Birthday อะคริลิค',
          price: 50,
          isAvailable: true,
        },
        { title: 'ถุงเก็บความเย็นพิเศษ', price: 40, isAvailable: true },
      ],
      metadata: [
        { key: 'brand', value: 'BakeryHouse' },
        { key: 'ingredients', value: 'Dark Chocolate 70%' },
        { key: 'expiration_date_info', value: '3-5 วัน (แช่เย็น)' },
        { key: 'allergen_information', value: 'แป้งสาลี, ไข่, นม, ถั่ว' },
      ],
      tags: 'เค้ก, เบเกอรี่, ขนมหวาน, เค้กช็อกโกแลต, เค้กวันเกิด',
    },
  },
  {
    id: 'clx0y1z2a000908l46v4r8n9p',
    label: 'เบเกอรี่ (เซ็ตของขวัญ)',
    toastLabel: 'เซ็ตคุกกี้',
    data: {
      title: 'Premium Butter Cookie Selection Set (กล่องเหล็ก)',
      slug: 'premium-butter-cookie-set',
      images: [],
      variants: [
        {
          title: 'กล่องไซส์ S (200g)',
          price: 250,
          sku: 'COOK-SET-S',
          stocks: [{ branchId: '', quantity: 30, minStock: 5 }],
          discount: { active: false, type: DiscountType.PERCENTAGE, amount: 0 },
          rewardPoints: { isActive: true, amount: 5 },
        },
      ],
      addons: [
        { title: 'การ์ดอวยพรเขียนมือ', price: 20, isAvailable: true },
        { title: 'ริบบิ้นและถุงกระดาษแบรนด์', price: 15, isAvailable: true },
      ],
      metadata: [
        { key: 'brand', value: 'BakeryHouse' },
        { key: 'style', value: 'Homemade' },
        { key: 'country_of_origin', value: 'Thailand' },
      ],
      tags: 'คุกกี้, ของขวัญ, ขนมทานเล่น, เบเกอรี่',
    },
  },
  {
    id: 'clx0y1z2a001008l48p2w5k7q',
    label: 'เบเกอรี่ (ขนมปังสด)',
    toastLabel: 'ครัวซองต์',
    data: {
      title: 'Signature Butter Croissant (อบสดใหม่ทุกเช้า)',
      slug: 'signature-butter-croissant',
      images: [],
      variants: [
        {
          title: 'ชิ้นเดี่ยว (Single)',
          price: 85,
          sku: 'CRO-BUTTER-01',
          stocks: [{ branchId: '', quantity: 50, minStock: 10 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 2 },
        },
        {
          title: 'เซ็ต 3 ชิ้น (Box of 3)',
          price: 240,
          sku: 'CRO-BUTTER-03',
          stocks: [{ branchId: '', quantity: 20, minStock: 5 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 15 },
          rewardPoints: { isActive: true, amount: 5 },
        },
      ],
      addons: [
        { title: 'แยมสตรอว์เบอร์รีโฮมเมด', price: 30, isAvailable: true },
        { title: 'เนยสดฝรั่งเศส (ถ้วยเล็ก)', price: 25, isAvailable: true },
      ],
      metadata: [
        { key: 'brand', value: 'BakeryHouse' },
        { key: 'storage_instruction', value: 'ควรทานภายในวันเดียวกัน' },
      ],
      tags: 'ครัวซองต์, ขนมปัง, เบเกอรี่, ขนมอบ',
    },
  },
  {
    id: 'clx0y1z2a001108l41f9d3v5r',
    label: 'อาหารตามสั่ง (เมนูยอดฮิต)',
    toastLabel: 'กะเพราถาดยักษ์',
    data: {
      title: 'กะเพราหมูสับคลุกข้าว (ถาดกลาง)',
      slug: 'basil-minced-pork-rice',
      images: [],
      variants: [
        {
          title: 'เผ็ดน้อย',
          price: 65,
          sku: 'KAPRAO-PORK-LOW',
          stocks: [{ branchId: '', quantity: 99, minStock: 10 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 2 },
        },
        {
          title: 'เผ็ดปกติ',
          price: 65,
          sku: 'KAPRAO-PORK-MID',
          stocks: [{ branchId: '', quantity: 99, minStock: 10 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 2 },
        },
        {
          title: 'เผ็ดมาก (พริกแห้งสวน)',
          price: 70,
          sku: 'KAPRAO-PORK-HIGH',
          stocks: [{ branchId: '', quantity: 99, minStock: 10 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 2 },
        },
      ],
      addons: [
        { title: 'ไข่ดาว (ไข่เป็ด)', price: 12, isAvailable: true },
        { title: 'ไข่เจียว', price: 10, isAvailable: true },
        { title: 'เพิ่มพิเศษ (หมูสับ +20g)', price: 15, isAvailable: true },
        { title: 'เพิ่มพริกน้ำปลาพิเศษ', price: 0, isAvailable: true },
      ],
      metadata: [{ key: 'style', value: 'อาหารจานเดียว' }],
      tags: 'อาหารตามสั่ง, กะเพรา, อาหารไทย, อาหารจานเดียว, ส่งด่วน',
    },
  },
  {
    id: 'clx0y1z2a001208l43s2q6n8p',
    label: 'อาหารตามสั่ง (เส้น)',
    toastLabel: 'ผัดซีอิ๊ว',
    data: {
      title: 'ผัดซีอิ๊วเส้นใหญ่หมูหมัก',
      slug: 'stir-fried-wide-rice-noodle-pork',
      images: [],
      variants: [
        {
          title: 'ธรรมดา',
          price: 55,
          sku: 'PADSEE-PORK-STD',
          stocks: [{ branchId: '', quantity: 50, minStock: 5 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 1 },
        },
        {
          title: 'พิเศษ (เพิ่มเส้นและหมู)',
          price: 65,
          sku: 'PADSEE-PORK-SPEC',
          stocks: [{ branchId: '', quantity: 50, minStock: 5 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 2 },
        },
      ],
      addons: [
        { title: 'เพิ่มคะน้ากรอบ', price: 5, isAvailable: true },
        { title: 'เพิ่มไข่ไก่ (ผัดรวม)', price: 8, isAvailable: true },
      ],
      metadata: [{ key: 'brand', value: 'ครัวตามสั่งใจดี' }],
      tags: 'อาหารตามสั่ง, เส้นใหญ่, ผัดซีอิ๊ว, อาหารไทย',
    },
  },
  {
    id: 'clx0y1z2a001308l45m9w2n6p',
    label: 'อุปกรณ์กีฬา (Smartwatch)',
    toastLabel: 'Smartwatch',
    data: {
      title: 'Garmin Forerunner 265 GPS Running Watch',
      slug: 'garmin-forerunner-265',
      images: [],
      variants: [
        {
          title: 'Whitestone',
          price: 15990,
          sku: 'GAR-FR265-WH',
          stocks: [{ branchId: '', quantity: 20, minStock: 5 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 5 },
          rewardPoints: { isActive: true, amount: 150 },
        },
      ],
      addons: [{ title: 'ฟิล์มกระจกนิรภัย', price: 199, isAvailable: true }],
      metadata: [
        { key: 'brand', value: 'Garmin' },
        { key: 'display_type', value: 'AMOLED' },
        { key: 'waterproof_rating', value: '5 ATM' },
        { key: 'battery_life', value: 'สูงสุด 13 วัน' },
        { key: 'sport_type', value: 'Running / Triathlon' },
      ],
      tags: 'garmin, smartwatch, วิ่ง, ออกกำลังกาย, นาฬิกา',
    },
  },
  {
    id: 'clx0y1z2a001408l42k7d8v4s',
    label: 'เครื่องใช้ไฟฟ้าในครัว (Air Fryer)',
    toastLabel: 'หม้อทอดไร้น้ำมัน',
    data: {
      title: 'Philips หม้อทอดไร้น้ำมัน Airfryer รุ่น HD9200',
      slug: 'philips-airfryer-hd9200',
      images: [],
      variants: [
        {
          title: 'ความจุ 4.1 ลิตร',
          price: 2990,
          sku: 'PHI-AF-HD9200',
          stocks: [{ branchId: '', quantity: 40, minStock: 8 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 200 },
          rewardPoints: { isActive: true, amount: 30 },
        },
      ],
      addons: [
        { title: 'กระดาษรองหม้อทอด (50 แผ่น)', price: 150, isAvailable: true },
      ],
      metadata: [
        { key: 'brand', value: 'Philips' },
        { key: 'capacity_volume', value: '4.1 ลิตร' },
        { key: 'power_consumption', value: '1400 วัตต์' },
        { key: 'plug_type', value: '3-pin (ไทย)' },
        { key: 'certifications', value: 'มอก.' },
      ],
      tags: 'philips, หม้อทอดไร้น้ำมัน, เครื่องใช้ไฟฟ้า, ทำอาหาร',
    },
  },
  {
    id: 'clx0y1z2a001508l47r3q9n2p',
    label: 'สินค้าแม่และเด็ก (ผ้าอ้อม)',
    toastLabel: 'ผ้าอ้อมเด็ก',
    data: {
      title: 'BabyLove Day&Night Pants ไซส์ M',
      slug: 'babylove-day-night-pants-m',
      images: [],
      variants: [
        {
          title: 'ยกลัง (160 ชิ้น)',
          price: 1250,
          sku: 'BL-PANTS-M-BULK',
          stocks: [{ branchId: '', quantity: 200, minStock: 50 }],
          discount: { active: true, type: DiscountType.PERCENTAGE, amount: 15 },
          rewardPoints: { isActive: true, amount: 12 },
        },
      ],
      addons: [],
      metadata: [
        { key: 'brand', value: 'BabyLove' },
        { key: 'recommended_age', value: '6-12 เดือน' },
        { key: 'material', value: 'Soft Cotton' },
      ],
      tags: 'ผ้าอ้อม, แม่และเด็ก, babylove',
    },
  },
  {
    id: 'clx0y1z2a001608l41a8b9v2p',
    label: 'คีย์เกม (PC Steam Key)',
    toastLabel: 'Game Key',
    data: {
      title: 'ELDEN RING - Steam Key (Global)',
      slug: 'elden-ring-steam-key',
      images: [],
      variants: [
        {
          title: 'Standard Edition',
          price: 1790,
          sku: 'STEAM-ER-STD',
          stocks: [{ branchId: '', quantity: 500, minStock: 50 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 100 },
          rewardPoints: { isActive: true, amount: 15 },
        },
      ],
      addons: [
        {
          title: 'Official Strategy Guide (PDF)',
          price: 199,
          isAvailable: true,
        },
      ],
      metadata: [
        { key: 'brand', value: 'FromSoftware' },
        { key: 'connectivity_type', value: 'Steam (Digital Download)' },
        { key: 'language', value: 'Multi-language' },
        { key: 'style', value: 'Action RPG' },
      ],
      tags: 'elden ring, steam, key, game, เกม pc',
    },
  },
  {
    id: 'clx0y1z2a001708l44d9f6n3s',
    label: 'บริการเติมเกม (Currency Top-up)',
    toastLabel: 'Top-up',
    data: {
      title: 'Genshin Impact - Genesis Crystals (6480 Crystals)',
      slug: 'genshin-impact-6480-crystals',
      images: [],
      variants: [
        {
          title: 'เติมผ่าน UID (Server Asia)',
          price: 3290,
          sku: 'GI-CRYSTAL-6480',
          stocks: [{ branchId: '', quantity: 99999, minStock: 0 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 50 },
        },
      ],
      addons: [],
      metadata: [
        { key: 'brand', value: 'HoYoverse' },
        { key: 'connectivity_type', value: 'Direct Top-up via UID' },
        { key: 'benefits', value: 'Premium In-game Currency' },
      ],
      tags: 'genshin, topup, เติมเกม, crystals',
    },
  },
  {
    id: 'clx0y1z2a001808l49p2w6v3q',
    label: 'บัตรเติมเงินออนไลน์ (Steam Wallet)',
    toastLabel: 'Steam Wallet',
    data: {
      title: 'Steam Wallet Code Thailand (Digital Code)',
      slug: 'steam-wallet-th-digital',
      images: [],
      variants: [
        {
          title: '50 THB',
          price: 50,
          sku: 'STEAM-WALLET-50',
          stocks: [{ branchId: '', quantity: 100, minStock: 10 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 1 },
        },
        {
          title: '200 THB',
          price: 200,
          sku: 'STEAM-WALLET-200',
          stocks: [{ branchId: '', quantity: 100, minStock: 10 }],
          discount: { active: false, type: DiscountType.FIXED, amount: 0 },
          rewardPoints: { isActive: true, amount: 4 },
        },
        {
          title: '500 THB',
          price: 500,
          sku: 'STEAM-WALLET-500',
          stocks: [{ branchId: '', quantity: 50, minStock: 5 }],
          discount: { active: true, type: DiscountType.FIXED, amount: 10 },
          rewardPoints: { isActive: true, amount: 10 },
        },
      ],
      addons: [],
      metadata: [
        { key: 'brand', value: 'Steam' },
        { key: 'connectivity_type', value: 'Digital Code (Instant Delivery)' },
        { key: 'benefits', value: 'เติมเข้ากระเป๋าตังค์ Steam Wallet โดยตรง' },
      ],
      tags: 'steam, wallet, เติมเงิน, เกม, บัตรเติมเงิน',
    },
  },
] satisfies {
  id: string
  label: string
  toastLabel: string
  data: Partial<ProductFormValues>
}[]
