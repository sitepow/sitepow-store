export interface ChannelStockInfo {
  quantity: number
  status: 'IN_SYNC' | 'SYNCING' | 'MISMATCH' | 'OUT_OF_STOCK'
  lastSyncedAt: string
  externalId?: string
}

export interface SmartStockItem {
  id: string
  title: string
  variantTitle: string
  sku: string
  barcode?: string
  image: string
  category: string
  price: number
  costPrice: number
  totalAvailable: number
  minStockAlert: number
  localStock: number
  channels: {
    shopee: ChannelStockInfo
    lazada: ChannelStockInfo
    facebook: ChannelStockInfo
  }
  syncMode: 'SHARED_POOL' | 'ALLOCATED'
  isAutoSyncEnabled: boolean
}

export const MOCK_SMART_STOCK_ITEMS: SmartStockItem[] = [
  {
    id: 'prod-1',
    title: 'เสื้อยืด Premium Cotton โอเวอร์ไซส์',
    variantTitle: 'สีดำ / Size L',
    sku: 'TSHIRT-BLK-L',
    barcode: '885123456001',
    image:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300&auto=format&fit=crop&q=80',
    category: 'เสื้อผ้าแฟชั่น',
    price: 490,
    costPrice: 190,
    totalAvailable: 150,
    minStockAlert: 20,
    localStock: 150,
    channels: {
      shopee: {
        quantity: 150,
        status: 'IN_SYNC',
        lastSyncedAt: '2 นาทีที่แล้ว',
        externalId: 'SHP-99281',
      },
      lazada: {
        quantity: 150,
        status: 'IN_SYNC',
        lastSyncedAt: '2 นาทีที่แล้ว',
        externalId: 'LZD-44120',
      },
      facebook: {
        quantity: 150,
        status: 'IN_SYNC',
        lastSyncedAt: '2 นาทีที่แล้ว',
        externalId: 'FB-88310',
      },
    },
    syncMode: 'SHARED_POOL',
    isAutoSyncEnabled: true,
  },
  {
    id: 'prod-2',
    title: 'แก้วเก็บความเย็นสแตนเลส 30oz',
    variantTitle: 'สี Matt Black',
    sku: 'TUMBLER-30-BLK',
    barcode: '885123456002',
    image:
      'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=300&auto=format&fit=crop&q=80',
    category: 'เครื่องใช้ในบ้าน',
    price: 350,
    costPrice: 120,
    totalAvailable: 42,
    minStockAlert: 15,
    localStock: 42,
    channels: {
      shopee: {
        quantity: 42,
        status: 'IN_SYNC',
        lastSyncedAt: '5 นาทีที่แล้ว',
        externalId: 'SHP-99282',
      },
      lazada: {
        quantity: 40,
        status: 'MISMATCH',
        lastSyncedAt: '45 นาทีที่แล้ว',
        externalId: 'LZD-44121',
      },
      facebook: {
        quantity: 42,
        status: 'IN_SYNC',
        lastSyncedAt: '5 นาทีที่แล้ว',
        externalId: 'FB-88311',
      },
    },
    syncMode: 'SHARED_POOL',
    isAutoSyncEnabled: true,
  },
  {
    id: 'prod-3',
    title: 'หูฟังไร้สาย Bluetooth 5.3 ตัดเสียงรบกวน ANC',
    variantTitle: 'สีขาว Snow White',
    sku: 'EAR-ANC-WHT',
    barcode: '885123456003',
    image:
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=300&auto=format&fit=crop&q=80',
    category: 'อุปกรณ์อิเล็กทรอนิกส์',
    price: 1290,
    costPrice: 650,
    totalAvailable: 85,
    minStockAlert: 10,
    localStock: 85,
    channels: {
      shopee: {
        quantity: 85,
        status: 'IN_SYNC',
        lastSyncedAt: '10 นาทีที่แล้ว',
        externalId: 'SHP-99283',
      },
      lazada: {
        quantity: 85,
        status: 'IN_SYNC',
        lastSyncedAt: '10 นาทีที่แล้ว',
        externalId: 'LZD-44122',
      },
      facebook: {
        quantity: 85,
        status: 'IN_SYNC',
        lastSyncedAt: '10 นาทีที่แล้ว',
        externalId: 'FB-88312',
      },
    },
    syncMode: 'SHARED_POOL',
    isAutoSyncEnabled: true,
  },
  {
    id: 'prod-4',
    title: 'กระเป๋าสะพายข้างกันน้ำ Minimalist Sling Bag',
    variantTitle: 'สีเทา Charcoal Grey',
    sku: 'BAG-SLING-GRY',
    barcode: '885123456004',
    image:
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&auto=format&fit=crop&q=80',
    category: 'กระเป๋าและแฟชั่น',
    price: 790,
    costPrice: 320,
    totalAvailable: 8,
    minStockAlert: 10,
    localStock: 8,
    channels: {
      shopee: {
        quantity: 8,
        status: 'IN_SYNC',
        lastSyncedAt: '1 ชั่วโมงที่แล้ว',
        externalId: 'SHP-99284',
      },
      lazada: {
        quantity: 8,
        status: 'IN_SYNC',
        lastSyncedAt: '1 ชั่วโมงที่แล้ว',
        externalId: 'LZD-44123',
      },
      facebook: {
        quantity: 8,
        status: 'IN_SYNC',
        lastSyncedAt: '1 ชั่วโมงที่แล้ว',
        externalId: 'FB-88313',
      },
    },
    syncMode: 'SHARED_POOL',
    isAutoSyncEnabled: true,
  },
  {
    id: 'prod-5',
    title: 'เมาส์ไร้สายเพื่อสุขภาพ Ergonomic Wireless Mouse',
    variantTitle: 'สีดำด้าน Silent Click',
    sku: 'MOUSE-ERGO-BLK',
    barcode: '885123456005',
    image:
      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=300&auto=format&fit=crop&q=80',
    category: 'อุปกรณ์คอมพิวเตอร์',
    price: 890,
    costPrice: 390,
    totalAvailable: 0,
    minStockAlert: 5,
    localStock: 0,
    channels: {
      shopee: {
        quantity: 0,
        status: 'OUT_OF_STOCK',
        lastSyncedAt: '3 นาทีที่แล้ว',
        externalId: 'SHP-99285',
      },
      lazada: {
        quantity: 0,
        status: 'OUT_OF_STOCK',
        lastSyncedAt: '3 นาทีที่แล้ว',
        externalId: 'LZD-44124',
      },
      facebook: {
        quantity: 0,
        status: 'OUT_OF_STOCK',
        lastSyncedAt: '3 นาทีที่แล้ว',
        externalId: 'FB-88314',
      },
    },
    syncMode: 'SHARED_POOL',
    isAutoSyncEnabled: true,
  },
  {
    id: 'prod-6',
    title: 'โคมไฟตั้งโต๊ะ LED ปรับอุณหภูมิสีและหรี่แสงได้',
    variantTitle: 'สีขาว Warm/Cool Light',
    sku: 'LAMP-LED-WHT',
    barcode: '885123456006',
    image:
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop&q=80',
    category: 'ของแต่งบ้าน',
    price: 650,
    costPrice: 280,
    totalAvailable: 64,
    minStockAlert: 10,
    localStock: 64,
    channels: {
      shopee: {
        quantity: 64,
        status: 'IN_SYNC',
        lastSyncedAt: '15 นาทีที่แล้ว',
        externalId: 'SHP-99286',
      },
      lazada: {
        quantity: 64,
        status: 'IN_SYNC',
        lastSyncedAt: '15 นาทีที่แล้ว',
        externalId: 'LZD-44125',
      },
      facebook: {
        quantity: 64,
        status: 'IN_SYNC',
        lastSyncedAt: '15 นาทีที่แล้ว',
        externalId: 'FB-88315',
      },
    },
    syncMode: 'SHARED_POOL',
    isAutoSyncEnabled: true,
  },
]

export const MOCK_SMART_STOCK_STATS = {
  totalSkus: 6,
  totalStockUnits: 349,
  syncedPercentage: 98.2,
  mismatchCount: 1,
  lowStockCount: 2,
  channels: {
    local: {
      name: 'หน้าร้าน / คลังหลัก (HQ)',
      activeSkus: 6,
      totalUnits: 349,
      isHealthy: true,
    },
    shopee: {
      name: 'Shopee Official Store',
      activeSkus: 6,
      totalUnits: 349,
      isHealthy: true,
    },
    lazada: {
      name: 'Lazada Flagship',
      activeSkus: 6,
      totalUnits: 347,
      isHealthy: false,
    },
    facebook: {
      name: 'FB Marketplace & Catalog',
      activeSkus: 6,
      totalUnits: 349,
      isHealthy: true,
    },
  },
}
