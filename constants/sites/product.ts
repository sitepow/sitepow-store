import { DiscountType, Product } from '@/types/sites/product'

export const PRODUCTS: Product[] = [
  {
    productId: '019d8bd6-8766-77eb-828e-17cf227b9293',
    categoryId: '019d8c50-5e3a-7df1-8de0-e260f4f4f8dd',
    slug: 't-shirt-limited-x-logitech',
    title: 'เสื้อยืดลิมิเต็ด x Logitech',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
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
        rewardPoints: {
          amount: 50,
          isActive: true,
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
    categoryId: '019d8c50-5e3a-7df1-8de1-f370f5f5e9ee',
    slug: 'logitech-mx-master-3s',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'Logitech MX Master 3S',
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
    categoryId: '019d8d50-5e3a-7df1-8de2-a110b220c222',
    slug: 'iced-americano',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'อเมริกาโน่เย็น (Iced Americano)',
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
    categoryId: '019d8c50-5e3a-7df1-8de3-d440e550f444',
    slug: 'steam-wallet-code-global',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'Steam Wallet Code (Global)',
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
      tags: ['game', 'top-up', 'steam'],
    },
  },
  {
    productId: '019d8c30-1111-7abc-8888-17cf227b9001',
    categoryId: '019d8c50-5e3a-7df1-8de1-f370f5f5e9ee',
    slug: 'custom-mechanical-keyboard-k8',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'Custom Mechanical Keyboard K8',
    variants: [
      {
        variantId: 'v-k8-blue',
        title: 'Blue Switch / RGB',
        price: 2490.0,
        stock: 12,
        discount: {
          type: DiscountType.PERCENTAGE,
          amount: 6,
          active: true,
        },
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
    categoryId: '019d8c50-5e3b-7df1-8de4-b660c770d555',
    slug: 'gaming-chair-ergo-v2',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'Gaming Chair Ergo-V2',
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
    categoryId: '019d8c50-5e3a-7df1-8de3-d440e550f444',
    slug: 'netflix-premium-shared',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'Netflix Premium (Shared Account)',
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
    addons: [],
    metadata: {
      platform: 'Netflix',
      delivery_method: 'Email Login',
      tags: ['digital', 'streaming', 'netflix'],
    },
  },
  {
    productId: '019d8c45-4444-7abc-2222-17cf227b9004',
    categoryId: '019d8c50-5e3b-7df1-8de5-f880a990e666',
    slug: 'molly-space-x-spongebob-limited',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'Molly Space x SpongeBob (Limited Edition)',
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
  {
    productId: '019d8c4a-5555-7abc-3333-17cf227b9005',
    categoryId: '019d8c50-5e3a-7df1-8de1-f370f5f5e9ee',
    slug: 'sony-wh-1000xm5-wireless-noise-cancelling',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'Sony WH-1000XM5 Wireless Noise Cancelling',
    variants: [
      {
        variantId: 'v-sony-black',
        title: 'Black',
        price: 14990.0,
        discount: {
          type: DiscountType.FIXED,
          amount: 2000,
          active: true,
        },
        stock: 12,
        sku: 'SNY-XM5-BLK',
      },
      {
        variantId: 'v-sony-silver',
        title: 'Platinum Silver',
        price: 14990.0,
        stock: 8,
        sku: 'SNY-XM5-SLV',
      },
    ],
    options: [],
    addons: [
      {
        addonId: 'a-sony-1',
        title: 'Sony Care+ ประกันอุบัติเหตุ 2 ปี',
        price: 1290.0,
        isAvailable: true,
      },
      {
        addonId: 'a-sony-2',
        title: 'ขาตั้งหูฟัง Aluminum Stand',
        price: 590.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'Sony',
      features: ['Active Noise Cancelling', '30 Hours Battery'],
      tags: ['audio', 'headphones', 'sony'],
    },
  },
  {
    productId: '019d8c4f-6666-7abc-4444-17cf227b9006',
    categoryId: '019d8c50-5e3b-7df1-8de4-b660c770d555',
    slug: 'minimal-desk-mat',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'แผ่นรองเม้าส์แบบยาว (Minimal Desk Mat)',
    variants: [
      {
        variantId: 'v-mat-gray',
        title: 'Felt Grey / 90x40cm',
        price: 450.0,
        stock: 50,
        sku: 'ACC-MAT-GRY',
      },
      {
        variantId: 'v-mat-leather',
        title: 'Vegan Leather / 80x40cm',
        price: 690.0,
        stock: 30,
        sku: 'ACC-MAT-LTH',
      },
    ],
    options: [
      {
        title: 'สกรีนชื่อเล่น (Custom Laser)',
        maxSelect: 1,
        require: false,
        choices: [
          { name: 'ไม่รับสกรีน', extraPrice: 0 },
          { name: 'สกรีนชื่อ (ไม่เกิน 10 ตัวอักษร)', extraPrice: 100 },
        ],
      },
    ],
    addons: [],
    metadata: {
      material: 'Eco-Friendly',
      style: 'Minimalist',
      tags: ['desk-setup', 'accessory', 'work-from-home'],
    },
  },
  {
    productId: '019d8c55-7777-7abc-5555-17cf227b9007',
    categoryId: '019d8c50-5e3a-7df1-8de1-f370f5f5e9ee',
    slug: 'ipad-pro-m4-2024',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'iPad Pro M4 (2024)',
    variants: [
      {
        variantId: 'v-ipad-11-256',
        title: '11-inch / 256GB / Wi-Fi',
        price: 39900.0,
        stock: 10,
        sku: 'APL-IPD-11-256',
      },
      {
        variantId: 'v-ipad-13-512',
        title: '13-inch / 512GB / Wi-Fi',
        price: 52900.0,
        discount: {
          type: DiscountType.PERCENTAGE,
          amount: 5,
          active: true,
        },
        stock: 5,
        sku: 'APL-IPD-13-512',
      },
    ],
    options: [
      {
        title: 'ประเภทกระจกหน้าจอ',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'Standard Glass', extraPrice: 0 },
          {
            name: 'Nano-texture Glass (เฉพาะรุ่น 1TB ขึ้นไป)',
            extraPrice: 4000,
          },
        ],
      },
    ],
    addons: [
      {
        addonId: 'a-ipad-1',
        title: 'Apple Pencil Pro',
        price: 4990.0,
        isAvailable: true,
      },
      {
        addonId: 'a-ipad-2',
        title: 'Magic Keyboard',
        price: 11990.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'Apple',
      display: 'Ultra Retina XDR',
      tags: ['tablet', 'apple', 'gadget'],
    },
  },
  {
    productId: '019d8c5a-8888-7abc-6666-17cf227b9008',
    categoryId: '019d8d50-5e3a-7df1-8de2-a110b220c222',
    slug: 'signature-butter-croissant',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'ครัวซองต์เนยสด (Signature Croissant)',
    variants: [
      {
        variantId: 'v-crois-plain',
        title: 'Plain Butter',
        price: 85.0,
        stock: 20,
        sku: 'BAKE-CRO-PLN',
      },
      {
        variantId: 'v-crois-almond',
        title: 'Almond Cream',
        rewardPoints: {
          amount: 30,
          isActive: true,
        },
        price: 125.0,
        stock: 15,
        sku: 'BAKE-CRO-ALM',
      },
    ],
    options: [
      {
        title: 'ระดับความร้อน',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'อุ่นร้อนพร้อมทาน', extraPrice: 0 },
          { name: 'รับแบบเย็น (ไปอุ่นเอง)', extraPrice: 0 },
        ],
      },
    ],
    addons: [
      {
        addonId: 'a-crois-1',
        title: 'วิปครีมสด',
        price: 25.0,
        isAvailable: true,
      },
      {
        addonId: 'a-crois-2',
        title: 'แยมสตรอว์เบอร์รี่โฮมเมด',
        price: 30.0,
        isAvailable: true,
      },
    ],
    metadata: {
      calories: '280 kcal',
      contains_dairy: true,
      tags: ['bakery', 'food', 'dessert'],
    },
  },
  {
    productId: '019d8c60-9999-7abc-7777-17cf227b9009',
    categoryId: '019d8c50-5e3a-7df1-8de3-d440e550f444',
    slug: 'youtube-premium-family-share',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'YouTube Premium (Family Plan Share)',
    variants: [
      {
        variantId: 'v-yt-1m',
        title: '1 เดือน',
        price: 59.0,
        stock: 500,
        sku: 'DG-YT-1M',
      },
      {
        variantId: 'v-yt-12m',
        title: '1 ปี (คุ้มสุด)',
        price: 590.0,
        discount: {
          type: DiscountType.FIXED,
          amount: 100,
          active: true,
        },
        stock: 100,
        sku: 'DG-YT-12M',
      },
    ],
    options: [
      {
        title: 'วิธีการรับสิทธิ์',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'ใช้เมลเดิม (ส่งคำเชิญเข้า Family)', extraPrice: 0 },
          { name: 'รับเมลใหม่จากทางร้าน', extraPrice: 0 },
        ],
      },
    ],
    addons: [],
    metadata: {
      delivery_method: 'Email Invitation',
      tags: ['digital', 'subscription', 'youtube'],
    },
  },
  {
    productId: '019d8c65-aaaa-7abc-8888-17cf227b9010',
    categoryId: '019d8c50-5e3b-7df1-8de5-f880a990e666',
    slug: 'lego-star-wars-the-razor-crest',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'LEGO Star Wars: The Razor Crest',
    variants: [
      {
        variantId: 'v-lego-rzr',
        title: 'Standard Box',
        price: 21500.0,
        stock: 2,
        sku: 'TOY-LEGO-SW-01',
      },
    ],
    options: [],
    addons: [
      {
        addonId: 'a-lego-1',
        title: 'ตู้โชว์อะคริลิคฐานไม้ไฟ LED',
        price: 2500.0,
        isAvailable: true,
      },
      {
        addonId: 'a-lego-2',
        title: 'บริการต่อให้โดยผู้เชี่ยวชาญ',
        price: 1500.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'LEGO',
      pieces: '6187',
      recommended_age: '18+',
      tags: ['toy', 'lego', 'starwars', 'collector'],
    },
  },
  {
    productId: '019d8c6a-bbbb-7abc-9999-17cf227b9011',
    categoryId: '019d8c50-5e3b-7df1-8de4-b660c770d555',
    slug: 'electric-standing-smart-desk',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'โต๊ะคอมพิวเตอร์ปรับระดับไฟฟ้า (Smart Desk)',
    variants: [
      {
        variantId: 'v-desk-140',
        title: 'Size 140x70cm / สีไม้ Oak',
        price: 12900.0,
        stock: 4,
        sku: 'FUR-DSK-140-OAK',
      },
      {
        variantId: 'v-desk-160',
        title: 'Size 160x80cm / สีดำ Matte Black',
        price: 14500.0,
        stock: 3,
        sku: 'FUR-DSK-160-BLK',
      },
    ],
    options: [
      {
        title: 'แผงควบคุม (Controller)',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'ปุ่มกดธรรมดา Up-Down', extraPrice: 0 },
          { name: 'หน้าจอ Digital (บันทึกได้ 4 ระดับ)', extraPrice: 800 },
        ],
      },
    ],
    addons: [
      {
        addonId: 'a-desk-1',
        title: 'ช่องจัดเก็บสายไฟใต้โต๊ะ',
        price: 450.0,
        isAvailable: true,
      },
      {
        addonId: 'a-desk-2',
        title: 'ล้อเลื่อนแบบล็อคได้ (4 ชิ้น)',
        price: 350.0,
        isAvailable: true,
      },
    ],
    metadata: {
      brand: 'ErgoHome',
      warranty: '5 Years Motor Warranty',
      tags: ['furniture', 'office', 'ergonomic'],
    },
  },
  {
    productId: '019d8d55-1234-77eb-8f5c-99d8d646a001',
    categoryId: '019d8d50-5e3a-7df1-8de2-a110b220c111',
    slug: 'somtum-pala-premium',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'ส้มตำปูปลาร้า (สูตรนัวพิเศษ)',
    variants: [
      {
        variantId: 'v-st-pala-01',
        title: 'ชุดมาตรฐาน',
        price: 75.0,
        stock: 999,
        sku: 'SP-ST-PALA',
      },
    ],
    options: [
      {
        title: 'ระดับความเผ็ด',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'ไม่เผ็ด (พริก 0 เม็ด)', extraPrice: 0 },
          { name: 'เผ็ดน้อย (พริก 2 เม็ด)', extraPrice: 0 },
          { name: 'เผ็ดปกติ (พริก 5 เม็ด)', extraPrice: 0 },
          { name: 'เผ็ดจัด (พริก 10 เม็ด)', extraPrice: 0 },
          { name: 'เผ็ดตายไม่เอาเรื่อง (พริก 20 เม็ด)', extraPrice: 15 },
        ],
      },
      {
        title: 'ระดับความนัว (ปลาร้า)',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'นัวปกติ', extraPrice: 0 },
          { name: 'นัวพิเศษ (เพิ่มน้ำปลาร้า)', extraPrice: 5 },
          { name: 'ไม่ใส่ปลาร้า (ตำไทยแทน)', extraPrice: 0 },
        ],
      },
    ],
    addons: [
      {
        addonId: 'add-01',
        title: 'ขนมจีน',
        price: 15.0,
        isAvailable: true,
      },
      {
        addonId: 'add-02',
        title: 'แคบหมูไร้มัน',
        price: 20.0,
        isAvailable: true,
      },
    ],
    metadata: {
      tags: ['spicy', 'thai-food', 'somtum'],
    },
  },
  {
    productId: '019d8d55-5678-77eb-8f5c-99d8d646a002',
    categoryId: '019d8d50-5e3a-7df1-8de2-a110b220c111',
    slug: 'holy-basil-wagyu-beef',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'ข้าวกะเพราเนื้อวากิว (Wagyu Basil Rice)',
    variants: [
      {
        variantId: 'v-wg-basil-01',
        title: 'Wagyu Ground (เนื้อสับ)',
        price: 185.0,
        stock: 50,
        sku: 'SP-WG-BSL-S',
      },
      {
        variantId: 'v-wg-basil-02',
        title: 'Wagyu Sliced (เนื้อชิ้น)',
        price: 220.0,
        stock: 30,
        sku: 'SP-WG-BSL-L',
      },
    ],
    options: [
      {
        title: 'ความสุกของเนื้อ',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'Medium Rare', extraPrice: 0 },
          { name: 'Medium', extraPrice: 0 },
          { name: 'Well Done', extraPrice: 0 },
        ],
      },
      {
        title: 'ความเผ็ด',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'เผ็ดน้อย', extraPrice: 0 },
          { name: 'เผ็ดปกติ', extraPrice: 0 },
          { name: 'เผ็ดมาก (พริกแห้ง)', extraPrice: 0 },
        ],
      },
    ],
    addons: [
      {
        addonId: 'add-egg-duck',
        title: 'ไข่ดาวเป็ดลาวา',
        price: 25.0,
        isAvailable: true,
      },
    ],
    metadata: {
      tags: ['premium', 'beef', 'lunch'],
    },
  },
  {
    productId: '019d8d55-9012-77eb-8f5c-99d8d646a003',
    categoryId: '019d8d50-5e3a-7df1-8de2-a110b220c111',
    slug: 'salmon-yum-thai-style',
    images: [
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d30',
        url: '/',
        isPrimary: true,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d31',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d32',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d33',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d34',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d35',
        url: '/',
        isPrimary: false,
      },
      {
        imageId: '019d99b9-be28-750a-ad13-fab4db7d3d36',
        url: '/',
        isPrimary: false,
      },
    ],
    title: 'ยำแซลมอนสด (Thai-Style Salmon Salad)',
    variants: [
      {
        variantId: 'v-salmon-01',
        title: 'Size M (150g)',
        price: 290.0,
        stock: 20,
        sku: 'SP-SAL-M',
      },
      {
        variantId: 'v-salmon-02',
        title: 'Size L (300g)',
        price: 550.0,
        stock: 10,
        sku: 'SP-SAL-L',
      },
    ],
    options: [
      {
        title: 'น้ำยำ',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'น้ำยำสูตรปลาร้า', extraPrice: 0 },
          { name: 'น้ำยำสูตรซีฟู้ดมะนาวสด', extraPrice: 0 },
        ],
      },
      {
        title: 'ระดับความเผ็ด',
        maxSelect: 1,
        require: true,
        choices: [
          { name: 'เผ็ดน้อย', extraPrice: 0 },
          { name: 'เผ็ดกลาง', extraPrice: 0 },
          { name: 'เผ็ดมาก', extraPrice: 0 },
        ],
      },
    ],
    addons: [
      {
        addonId: 'add-ไหลบัว',
        title: 'เพิ่มไหลบัวกรอบ',
        price: 30.0,
        isAvailable: true,
      },
    ],
    metadata: {
      tags: ['seafood', 'spicy', 'clean-food'],
    },
  },
]
