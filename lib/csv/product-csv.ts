import { ProductType } from '@/generated/prisma/enums'

export interface RawProductCsvRow {
  title: string
  slug?: string
  category: string
  productType: string
  price: string | number
  costPrice?: string | number
  sku?: string
  variantTitle?: string
  stock?: string | number
  branch?: string
  digitalUrl?: string
  digitalKeys?: string
  weight?: string | number
  width?: string | number
  height?: string | number
  length?: string | number
  tags?: string
  isPublished?: string | boolean
  images?: string
  description?: string
}

export interface ParsedVariant {
  title: string
  price: number
  costPrice: number
  sku: string
  stockQuantity: number
  branchName?: string
  digitalUrl?: string
  digitalKeys: string[]
  weight?: number
  width?: number
  height?: number
  length?: number
  isAvailable: boolean
}

export interface ParsedProduct {
  rowIndex: number
  title: string
  slug: string
  category: string
  productType: ProductType
  isPublished: boolean
  tags: string[]
  images: string[]
  description?: string
  variants: ParsedVariant[]
  errors: string[]
  warnings: string[]
}

/**
 * Standard CSV Column Headers (English + Thai aliases mapped to standard field keys)
 */
const HEADER_MAPPING: Record<string, keyof RawProductCsvRow> = {
  // Title
  title: 'title',
  'product title': 'title',
  'product name': 'title',
  name: 'title',
  ชื่อสินค้า: 'title',
  ชื่อ: 'title',

  // Slug
  slug: 'slug',
  url: 'slug',
  'url slug': 'slug',
  รหัสurl: 'slug',
  สลัก: 'slug',

  // Category
  category: 'category',
  'category name': 'category',
  หมวดหมู่: 'category',
  หมวดหมู่สินค้า: 'category',

  // Product Type
  producttype: 'productType',
  'product type': 'productType',
  type: 'productType',
  ประเภท: 'productType',
  ประเภทสินค้า: 'productType',

  // Price
  price: 'price',
  'sale price': 'price',
  ราคา: 'price',
  ราคาขาย: 'price',

  // Cost Price
  costprice: 'costPrice',
  'cost price': 'costPrice',
  cost: 'costPrice',
  ต้นทุน: 'costPrice',
  ราคาต้นทุน: 'costPrice',

  // SKU
  sku: 'sku',
  รหัสสินค้า: 'sku',
  รหัส: 'sku',

  // Variant Title
  varianttitle: 'variantTitle',
  'variant title': 'variantTitle',
  variant: 'variantTitle',
  'option name': 'variantTitle',
  ชื่อตัวเลือก: 'variantTitle',
  ตัวเลือก: 'variantTitle',

  // Stock
  stock: 'stock',
  quantity: 'stock',
  'stock quantity': 'stock',
  qty: 'stock',
  สต็อก: 'stock',
  จำนวน: 'stock',
  จำนวนสต็อก: 'stock',

  // Branch
  branch: 'branch',
  'branch name': 'branch',
  สาขา: 'branch',
  ชื่อสาขา: 'branch',

  // Digital URL
  digitalurl: 'digitalUrl',
  'digital url': 'digitalUrl',
  'download url': 'digitalUrl',
  link: 'digitalUrl',
  ลิงก์ดิจิทัล: 'digitalUrl',
  ลิงก์ดาวน์โหลด: 'digitalUrl',
  urlดาวน์โหลด: 'digitalUrl',
  ลิงก์: 'digitalUrl',

  // Digital Keys
  digitalkeys: 'digitalKeys',
  'digital keys': 'digitalKeys',
  'serial keys': 'digitalKeys',
  keys: 'digitalKeys',
  codes: 'digitalKeys',
  items: 'digitalKeys',
  คีย์ดิจิทัล: 'digitalKeys',
  รหัสคีย์: 'digitalKeys',
  คีย์: 'digitalKeys',
  รหัสสินค้าดิจิทัล: 'digitalKeys',

  // Weight / Dimensions
  weight: 'weight',
  'weight(g)': 'weight',
  น้ำหนัก: 'weight',
  'น้ำหนัก(กรัม)': 'weight',

  width: 'width',
  'width(cm)': 'width',
  กว้าง: 'width',
  'กว้าง(ซม)': 'width',

  height: 'height',
  'height(cm)': 'height',
  สูง: 'height',
  'สูง(ซม)': 'height',

  length: 'length',
  'length(cm)': 'length',
  ยาว: 'length',
  'ยาว(ซม)': 'length',

  // Tags
  tags: 'tags',
  tag: 'tags',
  แท็ก: 'tags',

  // isPublished
  ispublished: 'isPublished',
  'is published': 'isPublished',
  published: 'isPublished',
  status: 'isPublished',
  เปิดขายทันที: 'isPublished',
  เปิดขาย: 'isPublished',
  สถานะ: 'isPublished',

  // Images
  images: 'images',
  image: 'images',
  'image url': 'images',
  'image urls': 'images',
  รูปภาพ: 'images',
  รูป: 'images',

  // Description
  description: 'description',
  details: 'description',
  รายละเอียด: 'description',
  คำอธิบาย: 'description',
}

/**
 * Normalizes input string to resolve header key
 */
function normalizeHeaderName(rawHeader: string): keyof RawProductCsvRow | null {
  const clean = rawHeader
    .trim()
    .toLowerCase()
    .replace(/[\r\n\t_]/g, ' ')
    .replace(/\s+/g, ' ')

  if (HEADER_MAPPING[clean]) {
    return HEADER_MAPPING[clean]
  }

  // Fallback: check without spaces
  const noSpace = clean.replace(/\s+/g, '')
  if (HEADER_MAPPING[noSpace]) {
    return HEADER_MAPPING[noSpace]
  }

  return null
}

/**
 * Robust RFC-4180 CSV parser supporting multiline, escaped quotes, and commas
 */
export function parseCsvText(csvText: string): string[][] {
  // Strip BOM if present
  let text = csvText
  if (text.charCodeAt(0) === 0xfeff) {
    text = text.slice(1)
  }

  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          // Escaped quote
          currentCell += '"'
          i++
        } else {
          // Closing quote
          inQuotes = false
        }
      } else {
        currentCell += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === ',') {
        currentRow.push(currentCell.trim())
        currentCell = ''
      } else if (char === '\r') {
        if (nextChar === '\n') {
          i++
        }
        currentRow.push(currentCell.trim())
        currentCell = ''
        if (currentRow.some((c) => c !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
      } else if (char === '\n') {
        currentRow.push(currentCell.trim())
        currentCell = ''
        if (currentRow.some((c) => c !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
      } else {
        currentCell += char
      }
    }
  }

  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim())
    if (currentRow.some((c) => c !== '')) {
      rows.push(currentRow)
    }
  }

  return rows
}

/**
 * Resolves standard ProductType enum from various Thai/English aliases
 */
export function parseProductType(raw: string | undefined): ProductType | null {
  if (!raw) return ProductType.PHYSICAL
  const val = raw.trim().toUpperCase()

  if (val === 'PHYSICAL' || val.includes('ทั่วไป') || val.includes('จับต้อง')) {
    return ProductType.PHYSICAL
  }
  if (
    val === 'DIGITAL_LINK' ||
    val.includes('LINK') ||
    val.includes('ลิงก์') ||
    val.includes('ลิงค์')
  ) {
    return ProductType.DIGITAL_LINK
  }
  if (
    val === 'DIGITAL_ITEM' ||
    val.includes('ITEM') ||
    val.includes('KEY') ||
    val.includes('คีย์') ||
    val.includes('รหัส') ||
    val.includes('โค้ด')
  ) {
    return ProductType.DIGITAL_ITEM
  }
  if (
    val === 'DIGITAL_SERVICE' ||
    val.includes('SERVICE') ||
    val.includes('บริการ') ||
    val.includes('เติมเกม')
  ) {
    return ProductType.DIGITAL_SERVICE
  }

  return null
}

/**
 * Parses raw CSV text into validated and grouped ParsedProduct[]
 */
export function parseProductCsv(csvContent: string): {
  products: ParsedProduct[]
  totalRows: number
  errors: string[]
} {
  const rows = parseCsvText(csvContent)
  if (rows.length < 2) {
    return {
      products: [],
      totalRows: 0,
      errors: ['ไฟล์ CSV ต้องมีแถวหัวตาราง (Header) และข้อมูลสินค้าอย่างน้อย 1 แถว'],
    }
  }

  const rawHeaders = rows[0]
  const headerKeys: (keyof RawProductCsvRow | null)[] = rawHeaders.map((h) =>
    normalizeHeaderName(h),
  )

  // Validate mandatory headers
  const hasTitle = headerKeys.includes('title')
  const hasPrice = headerKeys.includes('price')

  if (!hasTitle) {
    return {
      products: [],
      totalRows: rows.length - 1,
      errors: ['ไม่พบคอลัมน์ "ชื่อสินค้า" หรือ "title" ในไฟล์ CSV'],
    }
  }
  if (!hasPrice) {
    return {
      products: [],
      totalRows: rows.length - 1,
      errors: ['ไม่พบคอลัมน์ "ราคา" หรือ "price" ในไฟล์ CSV'],
    }
  }

  // Parse each row into an object
  const rawRows: { rowIndex: number; data: RawProductCsvRow }[] = []

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r]
    if (cells.every((c) => !c || c.trim() === '')) {
      continue
    }

    const rowObj: Partial<RawProductCsvRow> = {}
    for (let c = 0; c < headerKeys.length; c++) {
      const key = headerKeys[c]
      if (key && cells[c] !== undefined) {
        rowObj[key] = cells[c]
      }
    }

    rawRows.push({
      rowIndex: r + 1,
      data: rowObj as RawProductCsvRow,
    })
  }

  // Group rows by Title + Category (or slug) to allow multiple variants for one product
  const productGroupMap = new Map<string, typeof rawRows>()

  for (const item of rawRows) {
    const title = (item.data.title || '').trim()
    const category = (item.data.category || '').trim()
    const slug = (item.data.slug || '').trim()
    const groupKey = slug ? `slug:${slug}` : `name:${title.toLowerCase()}::${category.toLowerCase()}`

    const existing = productGroupMap.get(groupKey) ?? []
    existing.push(item)
    productGroupMap.set(groupKey, existing)
  }

  const products: ParsedProduct[] = []

  for (const [, groupItems] of productGroupMap.entries()) {
    const firstRow = groupItems[0]
    const rowErrors: string[] = []
    const rowWarnings: string[] = []

    const title = (firstRow.data.title || '').trim()
    if (!title) {
      rowErrors.push('ชื่อสินค้าต้องไม่ว่างเปล่า')
    }

    const category = (firstRow.data.category || 'ทั่วไป').trim()
    const productType = parseProductType(firstRow.data.productType)
    if (!productType) {
      rowErrors.push(
        `ประเภทสินค้า "${firstRow.data.productType}" ไม่ถูกต้อง (ต้องเป็น PHYSICAL, DIGITAL_LINK, DIGITAL_ITEM หรือ DIGITAL_SERVICE)`,
      )
    }

    const slug = (firstRow.data.slug || '').trim()

    // Parse boolean published
    const pubVal = String(firstRow.data.isPublished ?? 'true').toLowerCase().trim()
    const isPublished =
      pubVal === 'true' ||
      pubVal === '1' ||
      pubVal === 'ใช่' ||
      pubVal === 'yes' ||
      pubVal === ''

    // Parse tags
    const tags = firstRow.data.tags
      ? firstRow.data.tags
          .split(/[,|]/)
          .map((t) => t.trim())
          .filter(Boolean)
      : []

    // Parse images
    const images = firstRow.data.images
      ? firstRow.data.images
          .split(/[|;]/)
          .map((img) => img.trim())
          .filter((img) => img.startsWith('http://') || img.startsWith('https://'))
      : []

    // Parse variants
    const variants: ParsedVariant[] = []

    for (let i = 0; i < groupItems.length; i++) {
      const vRow = groupItems[i]
      const vData = vRow.data

      const price = parseFloat(String(vData.price || '0').replace(/[^0-9.-]+/g, ''))
      if (isNaN(price) || price < 0) {
        rowErrors.push(
          `แถวที่ ${vRow.rowIndex}: ราคา "${vData.price}" ต้องเป็นตัวเลขมากกว่าหรือเท่ากับ 0`,
        )
      }

      const costPrice = parseFloat(
        String(vData.costPrice || '0').replace(/[^0-9.-]+/g, ''),
      )

      const variantTitle = (
        vData.variantTitle ||
        (groupItems.length > 1 ? `ตัวเลือกที่ ${i + 1}` : 'มาตรฐาน')
      ).trim()

      const stockQuantity = parseInt(
        String(vData.stock || '0').replace(/[^0-9-]+/g, ''),
        10,
      )

      // Digital Link check
      const digitalUrl = (vData.digitalUrl || '').trim()
      if (productType === ProductType.DIGITAL_LINK && !digitalUrl) {
        rowWarnings.push(
          `แถวที่ ${vRow.rowIndex}: สินค้าแบบ DIGITAL_LINK ควรระบุลิงก์ดาวน์โหลด (digitalUrl)`,
        )
      }

      // Digital Item check
      const rawKeys = (vData.digitalKeys || '').trim()
      const digitalKeys = rawKeys
        ? rawKeys
            .split(/[|\n]/)
            .map((k) => k.trim())
            .filter(Boolean)
        : []

      if (productType === ProductType.DIGITAL_ITEM && digitalKeys.length === 0) {
        rowWarnings.push(
          `แถวที่ ${vRow.rowIndex}: สินค้าแบบ DIGITAL_ITEM ยังไม่มีคีย์/รหัสในไฟล์ (สามารถเพิ่มในระบบภายหลังได้)`,
        )
      }

      variants.push({
        title: variantTitle,
        price: isNaN(price) ? 0 : price,
        costPrice: isNaN(costPrice) ? 0 : costPrice,
        sku: (vData.sku || '').trim(),
        stockQuantity: isNaN(stockQuantity) ? 0 : Math.max(0, stockQuantity),
        branchName: (vData.branch || '').trim() || undefined,
        digitalUrl: digitalUrl || undefined,
        digitalKeys,
        weight: vData.weight ? parseFloat(String(vData.weight)) : undefined,
        width: vData.width ? parseFloat(String(vData.width)) : undefined,
        height: vData.height ? parseFloat(String(vData.height)) : undefined,
        length: vData.length ? parseFloat(String(vData.length)) : undefined,
        isAvailable: true,
      })
    }

    products.push({
      rowIndex: firstRow.rowIndex,
      title,
      slug,
      category,
      productType: productType || ProductType.PHYSICAL,
      isPublished,
      tags,
      images,
      description: firstRow.data.description?.trim(),
      variants,
      errors: rowErrors,
      warnings: rowWarnings,
    })
  }

  return {
    products,
    totalRows: rawRows.length,
    errors: [],
  }
}

/**
 * Converts array of rows into properly escaped RFC-4180 CSV string with UTF-8 BOM
 */
export function buildCsvString(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const lines = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ]

  // Add UTF-8 BOM for Microsoft Excel compatibility
  return '\uFEFF' + lines.join('\r\n')
}

/**
 * Triggers a browser download of the CSV content
 */
export function triggerCsvDownload(fileName: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', fileName)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Pre-built CSV Templates for All Product Types
 */

// 1. All Types Combined Template
export function getSampleCsvAllTypes(): string {
  const headers = [
    'title',
    'category',
    'productType',
    'variantTitle',
    'price',
    'costPrice',
    'sku',
    'stock',
    'branch',
    'digitalUrl',
    'digitalKeys',
    'weight',
    'width',
    'height',
    'length',
    'tags',
    'isPublished',
    'images',
  ]

  const rows: (string | number)[][] = [
    // 1. PHYSICAL (Multi-variant)
    [
      'เสื้อยืด Oversize ลาย Minimal',
      'เสื้อผ้าแฟชั่น',
      'PHYSICAL',
      'สีดำ - Size M',
      390,
      180,
      'TSH-OVR-BLK-M',
      50,
      '',
      '',
      '',
      200,
      20,
      2,
      25,
      'เสื้อยืด, มินิมอล, แฟชั่น',
      'true',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    ],
    [
      'เสื้อยืด Oversize ลาย Minimal',
      'เสื้อผ้าแฟชั่น',
      'PHYSICAL',
      'สีดำ - Size L',
      390,
      180,
      'TSH-OVR-BLK-L',
      35,
      '',
      '',
      '',
      220,
      20,
      2,
      25,
      'เสื้อยืด, มินิมอล, แฟชั่น',
      'true',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800',
    ],

    // 2. DIGITAL_LINK
    [
      'Template Canva โพสต์ IG 50 สไตล์',
      'เทมเพลตดิจิทัล',
      'DIGITAL_LINK',
      'ชุดรวม 50 เทมเพลต',
      199,
      0,
      'CNV-IG-50',
      0,
      '',
      'https://www.canva.com/design/example-invite-link',
      '',
      0,
      0,
      0,
      0,
      'canva, template, instagram',
      'true',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
    ],
    [
      'E-Book คู่มือเขียนโปรแกรม Next.js ฉบับสมบูรณ์',
      'อีบุ๊กและคู่มือ',
      'DIGITAL_LINK',
      'PDF + Source Code',
      299,
      0,
      'EBK-NEXTJS-01',
      0,
      '',
      'https://drive.google.com/drive/folders/example-folder-id',
      '',
      0,
      0,
      0,
      0,
      'ebook, nextjs, react',
      'true',
      'https://images.unsplash.com/photo-1532012164546-f432f2e3777a?w=800',
    ],

    // 3. DIGITAL_ITEM (Keys / Codes)
    [
      'บัตรเติมเงิน Steam Wallet 300 THB',
      'บัตรเติมเงินและคีย์เกม',
      'DIGITAL_ITEM',
      '300 บาท',
      300,
      285,
      'STM-WLT-300',
      0,
      '',
      '',
      'STM-A1B2-C3D4-E5F6|STM-F6E5-D4C3-B2A1|STM-9988-7766-5544',
      0,
      0,
      0,
      0,
      'steam, giftcard, game',
      'true',
      'https://images.unsplash.com/photo-1612287232230-675084931a74?w=800',
    ],
    [
      'Netflix Premium 30 วัน (รหัสแอคเคาท์)',
      'ไอดีและสมาชิก',
      'DIGITAL_ITEM',
      '1 จอ 4K UHD',
      169,
      120,
      'NFLX-30D-01',
      0,
      '',
      '',
      'user1@mail.com:pass1234|user2@mail.com:pass5678',
      0,
      0,
      0,
      0,
      'netflix, streaming',
      'true',
      'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=800',
    ],

    // 4. DIGITAL_SERVICE (Webhook / Game Top-up)
    [
      'เติม Valorant Points 1,000 VP (ผ่าน Webhook)',
      'บริการเติมเกม',
      'DIGITAL_SERVICE',
      '1,000 VP',
      295,
      270,
      'VLR-1000VP',
      0,
      '',
      '',
      '',
      0,
      0,
      0,
      0,
      'valorant, topup, webhook',
      'true',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    ],
    [
      'เติม RoV 150 คูปอง (ส่งไวผ่านระบบ)',
      'บริการเติมเกม',
      'DIGITAL_SERVICE',
      '150 คูปอง',
      100,
      90,
      'ROV-150CP',
      0,
      '',
      '',
      '',
      0,
      0,
      0,
      0,
      'rov, topup, coupon',
      'true',
      'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800',
    ],
  ]

  return buildCsvString(headers, rows)
}

// 2. Physical Products Only Template
export function getSampleCsvPhysical(): string {
  const headers = [
    'title',
    'category',
    'productType',
    'variantTitle',
    'price',
    'costPrice',
    'sku',
    'stock',
    'branch',
    'weight',
    'width',
    'height',
    'length',
    'tags',
    'isPublished',
    'images',
  ]
  const rows: (string | number)[][] = [
    [
      'แก้วกาแฟ Ceramic Tumbler 500ml',
      'เครื่องใช้ในบ้าน',
      'PHYSICAL',
      'สี Matte Black',
      350,
      150,
      'CUP-BLK-500',
      40,
      '',
      300,
      10,
      18,
      10,
      'แก้วน้ำ, กาแฟ, tumbler',
      'true',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
    ],
    [
      'แก้วกาแฟ Ceramic Tumbler 500ml',
      'เครื่องใช้ในบ้าน',
      'PHYSICAL',
      'สี Cream White',
      350,
      150,
      'CUP-WHT-500',
      25,
      '',
      300,
      10,
      18,
      10,
      'แก้วน้ำ, กาแฟ, tumbler',
      'true',
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800',
    ],
  ]
  return buildCsvString(headers, rows)
}

// 3. Digital Link Only Template
export function getSampleCsvDigitalLink(): string {
  const headers = [
    'title',
    'category',
    'productType',
    'variantTitle',
    'price',
    'costPrice',
    'sku',
    'digitalUrl',
    'tags',
    'isPublished',
    'images',
  ]
  const rows: (string | number)[][] = [
    [
      'Lightroom Preset คุมโทนสไตล์ญี่ปุ่น 30 โทน',
      'พรีเซ็ตและฟิลเตอร์',
      'DIGITAL_LINK',
      'Preset Pack (DNG + XMP)',
      159,
      0,
      'LR-JPN-30',
      'https://drive.google.com/drive/folders/example-preset-folder',
      'lightroom, preset, photo',
      'true',
      'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800',
    ],
  ]
  return buildCsvString(headers, rows)
}

// 4. Digital Item (Keys/Codes) Only Template
export function getSampleCsvDigitalItem(): string {
  const headers = [
    'title',
    'category',
    'productType',
    'variantTitle',
    'price',
    'costPrice',
    'sku',
    'digitalKeys',
    'tags',
    'isPublished',
    'images',
  ]
  const rows: (string | number)[][] = [
    [
      'Windows 11 Pro Retail Key (ของแท้)',
      'ซอฟต์แวร์และลิขสิทธิ์',
      'DIGITAL_ITEM',
      '1 PC License',
      450,
      300,
      'WIN11-PRO',
      'W269N-WFGWX-YVC9B-4J6C9-T83GX|VK7JG-NPHTM-C97JM-9MPGT-3V66T',
      'windows, software, license',
      'true',
      'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800',
    ],
  ]
  return buildCsvString(headers, rows)
}

// 5. Digital Service (Game Top-Up/Webhook) Only Template
export function getSampleCsvDigitalService(): string {
  const headers = [
    'title',
    'category',
    'productType',
    'variantTitle',
    'price',
    'costPrice',
    'sku',
    'tags',
    'isPublished',
    'images',
  ]
  const rows: (string | number)[][] = [
    [
      'เติมเพชร Free Fire 310 เพชร (ส่งไวระบบอัตโนมัติ)',
      'บริการเติมเกม',
      'DIGITAL_SERVICE',
      '310 เพชร (UID)',
      99,
      88,
      'FF-310DM',
      'freefire, topup, diamond',
      'true',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    ],
    [
      'เติมเพชร Free Fire 1,060 เพชร (ส่งไวระบบอัตโนมัติ)',
      'บริการเติมเกม',
      'DIGITAL_SERVICE',
      '1,060 เพชร (UID)',
      315,
      285,
      'FF-1060DM',
      'freefire, topup, diamond',
      'true',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800',
    ],
  ]
  return buildCsvString(headers, rows)
}
