import { DiscountType, Product } from '@/types/sites/product'

export const PRODUCTS: Product[] = [
  {
    productId: '019d8bd6-8766-77eb-828e-17cf227b9293',
    title: 'เสื้อยืดลิมิเต็ด x Logitech',
    image: '/images/tshirt-logi.jpg',
    variants: [
      {
        variantId: '019d8bd6-b16c-7df1-bde0-e260f4f4f8dd',
        title: 'ไซส์ M / สีขาว',
        price: 590.0,
        discount: {
          type: DiscountType.PERCENTAGE,
          amount: 10,
          active: true,
        },
        stock: 15,
        sku: 'SP-TSH-WHT-M',
      },
      {
        variantId: '019d8bd6-b16c-7df1-bde1-f370f5f5e9ee',
        title: 'ไซส์ L / สีขาว',
        price: 590.0,
        discount: {
          type: DiscountType.FIXED,
          amount: 50,
          active: true,
        },
        stock: 10,
        sku: 'SP-TSH-WHT-L',
      },
    ],
    options: [
      {
        title: 'ตำแหน่งปักโลโก้',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'หน้าอกซ้าย', extraPrice: 0 },
          { name: 'แขนเสื้อขวา', extraPrice: 0 },
        ],
      },
    ],
    addons: [
      {
        addonId: '019d8bd9-a03f-7f78-9dc2-0f478c64a4f0',
        title: 'บริการห่อของขวัญ + การ์ดอวยพร',
        price: 50.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'Logitech',
      material: 'Cotton 100%',
      tags: ['fashion', 'limited'],
    },
  },
  {
    productId: '019d8c01-4475-7f91-8f5c-99d8d646a782',
    title: 'Logitech MX Master 3S',
    image: '/images/mx-master-3s.jpg',
    variants: [
      {
        variantId: '019d8c01-5e8a-788b-a342-990838890212',
        title: 'Graphite',
        price: 3590.0,
        stock: 20,
        sku: 'LOGI-MX3S-GRP',
      },
      {
        variantId: '019d8c01-5e8a-788b-a342-990838890213',
        title: 'Pale Gray',
        price: 3590.0,
        stock: 5,
        sku: 'LOGI-MX3S-GRY',
      },
    ],
    options: [
      {
        title: 'ประเภทหัวปลั๊กที่ต้องการ (ในกล่อง)',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'Thai Standard', extraPrice: 0 },
          { name: 'Universal Adapter', extraPrice: 150 },
        ],
      },
    ],
    addons: [
      {
        addonId: '019d8c05-1234-7abc-9999-0f478c64a111',
        title: 'ประกันเพิ่ม Extended Warranty 1 ปี',
        price: 490.0,
        isAvailable: true,
      },
      {
        addonId: '019d8c05-5678-7def-8888-0f478c64a222',
        title: 'เคสกันกระแทกใส่เมาส์ตรงรุ่น',
        price: 250.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'Logitech',
      warranty: '1 Year Official',
      attributes: [
        { label: 'DPI', value: '8000' },
        { label: 'Silent Click', value: 'Yes' },
      ],
      tags: ['it', 'mouse', 'wireless'],
    },
  },
  {
    productId: '019d8c0a-7b32-7011-89d2-17cf227b3456',
    title: 'อเมริกาโน่เย็น (Iced Americano)',
    image: '/images/coffee.jpg',
    variants: [
      {
        variantId: '019d8c0a-8a12-7882-b111-e260f4f4f001',
        title: 'แก้วปกติ (16 oz)',
        price: 65.0,
        stock: 999,
        sku: 'CAFE-AME-16',
      },
      {
        variantId: '019d8c0a-8a12-7882-b112-e260f4f4f002',
        title: 'แก้วใหญ่ (22 oz)',
        price: 80.0,
        stock: 999,
        sku: 'CAFE-AME-22',
      },
    ],
    options: [
      {
        title: 'ระดับความหวาน',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'ไม่หวาน (0%)', extraPrice: 0 },
          { name: 'หวานน้อย (25%)', extraPrice: 0 },
          { name: 'หวานปกติ (100%)', extraPrice: 0 },
        ],
      },
      {
        title: 'ประเภทเมล็ดกาแฟ',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'House Blend (คั่วเข้ม)', extraPrice: 0 },
          { name: 'Specialty (คั่วกลาง-อ่อน)', extraPrice: 30 },
        ],
      },
    ],
    addons: [
      {
        addonId: '019d8c11-9999-7abc-9999-0f478c64a001',
        title: 'เพิ่มช็อตกาแฟ (Extra Shot)',
        price: 20.0,
        isAvailable: true,
      },
      {
        addonId: '019d8c11-8888-7abc-9999-0f478c64a002',
        title: 'บุกคอฟฟี่เจลลี่',
        price: 15.0,
        isAvailable: true,
      },
    ],
    metadata: {
      calories: '15 kcal',
      is_vegan: true,
      tags: ['drink', 'coffee', 'iced'],
    },
  },
  {
    productId: '019d8c22-3a5b-77f1-8888-17cf227b9abc',
    title: 'Steam Wallet Code (Global)',
    image: '/images/steam-card.jpg',
    variants: [
      {
        variantId: '019d8c22-4e11-7882-b333-e260f4f4f001',
        title: '500 THB',
        price: 525.0,
        discount: {
          type: DiscountType.PERCENTAGE,
          amount: 45,
          active: true,
        },
        stock: 100,
        sku: 'DG-STEAM-500',
      },
      {
        variantId: '019d8c22-4e11-7882-b334-e260f4f4f002',
        title: '1,000 THB',
        price: 1040.0,
        stock: 50,
        sku: 'DG-STEAM-1000',
      },
    ],
    options: [
      {
        title: 'ภูมิภาคของไอดี (Region)',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'Thai Store', extraPrice: 0 },
          { name: 'Global Store', extraPrice: 0 },
        ],
      },
    ],
    addons: [
      {
        addonId: '019d8c25-9999-7abc-1111-0f478c64a777',
        title: 'บริการเติมให้ทันที (Direct Top-up)',
        price: 20.0,
        isAvailable: true,
      },
      {
        addonId: '019d8c25-9999-7abc-2222-0f478c64a888',
        title: 'ประกัน Code เสีย/ใช้ไม่ได้ (7 Days)',
        price: 10.0,
        isAvailable: true,
      },
    ],
    metadata: {
      delivery_method: 'Email / SMS / Instant Dashboard',
      platform: 'Steam',
      region: 'Global / Thailand',
      instructions: 'กรอกรหัส 15 หลักในหน้า Redeem ของ Steam',
      is_digital: true,
      tags: ['game', 'top-up', 'steam'],
    },
  },
  {
    productId: '019d8c30-1111-7abc-8888-17cf227b9001',
    title: 'Custom Mechanical Keyboard K8',
    image: '/images/keyboard-k8.jpg',
    variants: [
      {
        variantId: 'v-k8-blue',
        title: 'Blue Switch / RGB',
        price: 2490.0,
        stock: 12,
        sku: 'KB-K8-BLUE',
      },
      {
        variantId: 'v-k8-red',
        title: 'Red Switch / RGB',
        price: 2490.0,
        stock: 8,
        sku: 'KB-K8-RED',
      },
    ],
    options: [
      {
        title: 'ภาษาบนคีย์แคป (Keycap Layout)',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'Thai/Eng', extraPrice: 0 },
          { name: 'Eng Only', extraPrice: 0 },
        ],
      },
    ],
    addons: [
      {
        addonId: 'a-k8-1',
        title: 'ที่รองข้อมือ (Wooden Wrist Rest)',
        price: 450.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'Keychron',
      connectivity: 'Wireless/Wired',
      tags: ['keyboard', 'gaming', 'custom'],
    },
  },
  {
    productId: '019d8c35-2222-7abc-9999-17cf227b9002',
    title: 'Gaming Chair Ergo-V2',
    image: '/images/chair-ergo.jpg',
    variants: [
      {
        variantId: 'v-chair-black',
        title: 'Midnight Black',
        price: 8900.0,
        stock: 5,
        sku: 'CH-ERGO-BLK',
      },
    ],
    options: [
      {
        title: 'บริการประกอบสินค้า',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'รับไปประกอบเอง', extraPrice: 0 },
          { name: 'ให้ช่างไปประกอบที่บ้าน', extraPrice: 500 },
        ],
      },
    ],
    addons: [
      {
        addonId: 'a-chair-1',
        title: 'ล้อเลื่อนแบบถนอมพื้นไม้ (Premium Wheels)',
        price: 390.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'SecretLab Clone',
      material: 'PU Leather',
      weight_limit: '150kg',
      tags: ['furniture', 'gaming', 'ergonomic'],
    },
  },
  {
    productId: '019d8c40-3333-7abc-1111-17cf227b9003',
    title: 'Netflix Premium (Shared Account)',
    image: '/images/netflix.jpg',
    variants: [
      {
        variantId: 'v-netflix-30',
        title: '30 วัน / 4K UHD',
        price: 150.0,
        stock: 100,
        sku: 'DG-NFLX-30',
      },
      {
        variantId: 'v-netflix-90',
        title: '90 วัน / 4K UHD',
        price: 420.0,
        stock: 50,
        sku: 'DG-NFLX-90',
      },
    ],
    options: [
      {
        title: 'เลือกประเภทโปรไฟล์',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'โปรไฟล์ชื่อตัวเอง (+รหัสล็อก)', extraPrice: 30 },
          { name: 'โปรไฟล์สุ่ม (Shared)', extraPrice: 0 },
        ],
      },
    ],
    addons: [], // ไม่มีแอดออน
    metadata: {
      is_digital: true,
      platform: 'Netflix',
      delivery_method: 'Email Login',
      tags: ['digital', 'streaming', 'netflix'],
    },
  },
  {
    productId: '019d8c45-4444-7abc-2222-17cf227b9004',
    title: 'Molly Space x SpongeBob (Limited Edition)',
    image: '/images/molly-spongebob.jpg',
    variants: [
      {
        variantId: 'v-molly-100',
        title: 'Size 100%',
        price: 1200.0,
        stock: 3,
        sku: 'AT-MOLLY-100',
      },
      {
        variantId: 'v-molly-400',
        title: 'Size 400%',
        price: 4500.0,
        discount: {
          type: DiscountType.PERCENTAGE,
          amount: 5,
          active: true,
        },
        stock: 1,
        sku: 'AT-MOLLY-400',
      },
    ],
    options: [
      {
        title: 'การแกะเช็คสินค้า',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'ไม่แกะกล่อง (ลุ้นซีเคร็ท)', extraPrice: 0 },
          { name: 'แกะกล่องเช็คการ์ด (ไม่แกะซอง)', extraPrice: 0 },
        ],
      },
    ],
    addons: [
      {
        addonId: 'a-molly-1',
        title: 'กล่องอะคริลิคกันฝุ่นตรงรุ่น',
        price: 290.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'Pop Mart',
      series: 'Space Molly',
      is_limited: true,
      tags: ['toy', 'collectible', 'arttoy'],
    },
  },
]
