export interface BulkProductRow {
  index: number
  title: string
  productType:
    | 'PHYSICAL'
    | 'DIGITAL_LINK'
    | 'DIGITAL_ITEM'
    | 'DIGITAL_SERVICE'
    | 'AFFILIATE_LINK'
  variantTitle: string
  sku: string
  price: number
  costPrice?: number
  categorySlug?: string
  initialStock?: number
  weight?: number
  digitalUrl?: string
  digitalItemContent?: string
  pointsAmount?: number
  discountType?: 'PERCENTAGE' | 'FIXED'
  discountAmount?: number
  error?: string
}

export type TemplateType =
  | 'ALL'
  | 'PHYSICAL'
  | 'DIGITAL_LINK'
  | 'DIGITAL_ITEM'
  | 'DIGITAL_SERVICE'
  | 'AFFILIATE_LINK'

export function downloadProductTemplate(type: TemplateType = 'ALL') {
  const headers = [
    'Title',
    'ProductType',
    'VariantTitle',
    'SKU',
    'Price',
    'CostPrice',
    'CategorySlug',
    'InitialStock',
    'WeightKg',
    'DigitalUrl',
    'DigitalItemContent',
    'PointsAmount',
    'DiscountType',
    'DiscountAmount',
  ].join(',')

  const samples: Record<TemplateType, string[]> = {
    ALL: [
      'เสื้อยืด Oversize สีดำ,PHYSICAL,Free Size,TSHIRT-BLK-OS,450,180,apparel,50,0.25,,,,PERCENTAGE,10',
      'คู่มือการตลาด E-Book 2026,DIGITAL_LINK,Standard,EBOOK-MKT-01,299,0,books,999,,https://drive.google.com/file/d/sample,,,',
      'Gift Card 500 THB,DIGITAL_ITEM,Standard,GC-500-01,500,480,gift-card,1,,,CARD-ABCD-1234-XYZ,10,,',
      'บริการตรวจสุขภาพประจำปี,DIGITAL_SERVICE,Standard,SRV-HEALTH-01,1500,600,service,999,,,,50,,',
      'หูฟังไร้สาย Bluetooth,AFFILIATE_LINK,Shopee Mall,AFF-SHP-EAR-01,399,0,electronics,999,,https://s.shopee.co.th/sample,,,PERCENTAGE,20',
    ],
    PHYSICAL: [
      'เสื้อยืด Oversize สีดำ,PHYSICAL,Free Size,TSHIRT-BLK-OS,450,180,apparel,50,0.25,,,,PERCENTAGE,10',
      'กางเกงยีนส์ขากระบอก,PHYSICAL,32,JEANS-BLU-32,890,350,apparel,20,0.6,,,,,',
    ],
    DIGITAL_LINK: [
      'คู่มือการตลาด E-Book 2026,DIGITAL_LINK,Standard,EBOOK-MKT-01,299,0,books,999,,https://drive.google.com/file/d/sample,,,',
      'ชุด Preset แต่งภาพ Lightroom,DIGITAL_LINK,Standard,LR-PRESET-01,490,0,software,999,,https://example.com/download/preset.zip,10,,',
    ],
    DIGITAL_ITEM: [
      'Gift Card 500 THB,DIGITAL_ITEM,Standard,GC-500-01,500,480,gift-card,1,,,CARD-ABCD-1234-XYZ,10,,',
      'Serial Key โปรแกรมตัดต่อ,DIGITAL_ITEM,Standard,KEY-SOFT-01,1200,900,keys,1,,,PRO-XXXX-YYYY-ZZZZ,,,',
    ],
    DIGITAL_SERVICE: [
      'บริการตรวจสุขภาพประจำปี,DIGITAL_SERVICE,Standard,SRV-HEALTH-01,1500,600,service,999,,,,50,,',
      'ปรึกษาผู้เชี่ยวชาญ 1 ชม.,DIGITAL_SERVICE,Standard,SRV-CONSULT-01,2500,0,service,999,,,,100,,',
    ],
    AFFILIATE_LINK: [
      'หูฟังไร้สาย Bluetooth,AFFILIATE_LINK,Shopee Mall,AFF-SHP-EAR-01,399,0,electronics,999,,https://s.shopee.co.th/sample,,,PERCENTAGE,20',
      'โต๊ะคอมพิวเตอร์ปรับระดับ,AFFILIATE_LINK,Lazada Official,AFF-LAZ-DSK-01,2490,0,furniture,999,,https://s.lazada.co.th/s.sample,,,FIXED,500',
      'ไมโครโฟนไร้สายมือถือ,AFFILIATE_LINK,TikTok Shop,AFF-TIK-MIC-01,590,0,gadgets,999,,https://vt.tiktok.com/sample,,,',
    ],
  }

  const fileNames: Record<TemplateType, string> = {
    ALL: 'products_template_all.csv',
    PHYSICAL: 'products_template_physical.csv',
    DIGITAL_LINK: 'products_template_digital_link.csv',
    DIGITAL_ITEM: 'products_template_digital_item.csv',
    DIGITAL_SERVICE: 'products_template_digital_service.csv',
    AFFILIATE_LINK: 'products_template_affiliate.csv',
  }

  const csvContent = headers + '\n' + samples[type].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], {
    type: 'text/csv;charset=utf-8;',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', fileNames[type])
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function parseProductCsvText(
  text: string,
  errorTranslations: {
    errTitleMin: string
    errSkuEmpty: string
    errPriceNonNegative: string
    errDigitalUrlRequired: string
    errDigitalItemContentRequired: string
  },
): BulkProductRow[] {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length === 0) {
    return []
  }

  const firstLine = lines[0].toLowerCase()
  const startIndex =
    firstLine.includes('sku') || firstLine.includes('title') ? 1 : 0

  const rows: BulkProductRow[] = []

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i]
      .split(',')
      .map((col) => col.trim().replace(/^["']|["']$/g, ''))

    const title = cols[0] || ''
    const rawType = (cols[1] || 'PHYSICAL').toUpperCase()
    const productType = (
      [
        'PHYSICAL',
        'DIGITAL_LINK',
        'DIGITAL_ITEM',
        'DIGITAL_SERVICE',
        'AFFILIATE_LINK',
      ].includes(rawType)
        ? rawType
        : 'PHYSICAL'
    ) as BulkProductRow['productType']

    const variantTitle = cols[2] || 'Standard'
    const sku = cols[3] || ''
    const price = parseFloat(cols[4])
    const costPrice = cols[5] ? parseFloat(cols[5]) : 0
    const categorySlug = cols[6] || ''
    const initialStock = cols[7] ? parseInt(cols[7], 10) : 0
    const weight = cols[8] ? parseFloat(cols[8]) : undefined
    const digitalUrl = cols[9] || undefined
    const digitalItemContent = cols[10] || undefined
    const pointsAmount = cols[11] ? parseInt(cols[11], 10) : 0
    const rawDiscountType = (cols[12] || '').toUpperCase()
    const discountType = ['PERCENTAGE', 'FIXED'].includes(rawDiscountType)
      ? (rawDiscountType as 'PERCENTAGE' | 'FIXED')
      : undefined
    const discountAmount = cols[13] ? parseFloat(cols[13]) : undefined

    let error = ''
    if (!title) error = errorTranslations.errTitleMin
    else if (!sku) error = errorTranslations.errSkuEmpty
    else if (isNaN(price) || price < 0)
      error = errorTranslations.errPriceNonNegative
    else if (
      (productType === 'DIGITAL_LINK' || productType === 'AFFILIATE_LINK') &&
      !digitalUrl
    ) {
      error = errorTranslations.errDigitalUrlRequired
    } else if (productType === 'DIGITAL_ITEM' && !digitalItemContent) {
      error = errorTranslations.errDigitalItemContentRequired
    }

    rows.push({
      index: i + 1,
      title,
      productType,
      variantTitle,
      sku,
      price: isNaN(price) ? 0 : price,
      costPrice: isNaN(costPrice) ? 0 : costPrice,
      categorySlug,
      initialStock: isNaN(initialStock) ? 0 : initialStock,
      weight,
      digitalUrl,
      digitalItemContent,
      pointsAmount,
      discountType,
      discountAmount,
      error: error || undefined,
    })
  }

  return rows
}

