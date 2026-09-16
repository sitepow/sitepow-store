import { Plan } from '@/generated/prisma/enums'
import { AiGenTask } from '@/types/ai'
import { Schema, SchemaType } from '@google/generative-ai'

export const GEMINI_MODEL = 'gemini-3.1-flash-lite-preview'

export const GEMINI_PRICING_USD_PER_1M: Record<
  string,
  { input: number; output: number }
> = {
  [GEMINI_MODEL]: { input: 0.25, output: 1.5 },
}

export const AI_MARGIN_MULTIPLIER = 1.8
export const USD_TO_THB_RATE = 33.63
export const TOKENS_PER_UNIT = 1_000_000
export const BASE_CREDIT_VALUE_THB = 0.85

export const SLIP_CREDIT_COST: Record<Plan, number> = {
  FREE: 4.0,
  STARTER: 2.5,
  PRO: 1.8,
  ULTIMATE: 1.5,
}

export const AVG_INPUT_TOKENS = 500
export const AVG_OUTPUT_TOKENS = 200

export const PRODUCT_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    slug: { type: SchemaType.STRING },
    variants: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          price: { type: SchemaType.NUMBER },
          stock: { type: SchemaType.NUMBER },
          sku: { type: SchemaType.STRING },
          discount: {
            type: SchemaType.OBJECT,
            properties: {
              active: { type: SchemaType.BOOLEAN },
              type: { type: SchemaType.STRING },
              amount: { type: SchemaType.NUMBER },
            },
            required: ['active', 'type', 'amount'],
          },
          rewardPoints: {
            type: SchemaType.OBJECT,
            properties: {
              isActive: { type: SchemaType.BOOLEAN },
              amount: { type: SchemaType.NUMBER },
            },
            required: ['isActive', 'amount'],
          },
        },
      },
    },
    addons: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          price: { type: SchemaType.NUMBER },
          isAvailable: { type: SchemaType.BOOLEAN },
        },
        required: ['title', 'price', 'isAvailable'],
      },
    },
    metadata: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          key: { type: SchemaType.STRING },
          value: { type: SchemaType.STRING },
        },
        required: ['key', 'value'],
      },
    },
    tags: { type: SchemaType.STRING },
  },
  required: ['title', 'slug', 'variants', 'metadata'],
} as const

export const PRODUCT_SCHEMA_PARTS: Record<AiGenTask, Schema> = {
  [AiGenTask.TITLE]: {
    type: SchemaType.OBJECT,
    properties: { title: { type: SchemaType.STRING } },
    required: ['title'],
  },
  [AiGenTask.SLUG]: {
    type: SchemaType.OBJECT,
    properties: { slug: { type: SchemaType.STRING } },
    required: ['slug'],
  },
  [AiGenTask.METADATA]: {
    type: SchemaType.OBJECT,
    properties: {
      metadata: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            key: { type: SchemaType.STRING },
            value: { type: SchemaType.STRING },
          },
          required: ['key', 'value'],
        },
      },
    },
    required: ['metadata'],
  },
  [AiGenTask.ADDONS]: {
    type: SchemaType.OBJECT,
    properties: {
      addons: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            price: { type: SchemaType.NUMBER },
            isAvailable: { type: SchemaType.BOOLEAN },
          },
          required: ['title', 'price', 'isAvailable'],
        },
      },
    },
    required: ['addons'],
  },
  [AiGenTask.VARIANTS]: {
    type: SchemaType.OBJECT,
    properties: {
      variants: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            price: { type: SchemaType.NUMBER },
            sku: { type: SchemaType.STRING },
          },
          required: ['title', 'price'],
        },
      },
    },
    required: ['variants'],
  },
  [AiGenTask.TAGS]: {
    type: SchemaType.OBJECT,
    properties: {
      tags: { type: SchemaType.STRING },
    },
    required: ['tags'],
  },
  [AiGenTask.ALL]: PRODUCT_SCHEMA,
} as const

export const CATEGORY_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: 'ชื่อหมวดหมู่สินค้าที่ปรับแต่งให้ดูน่าสนใจและส่งเสริม SEO',
    },
    slug: {
      type: SchemaType.STRING,
      description:
        'URL slug ภาษาอังกฤษแบบ kebab-case เช่น fashion-and-clothing',
    },
    description: {
      type: SchemaType.STRING,
      description: 'คำอธิบายหมวดหมู่สินค้าสั้นๆ น่าสนใจ สำหรับ SEO',
    },
  },
  required: ['title', 'slug'],
}

export const STORE_SEO_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    seoTitle: {
      type: SchemaType.STRING,
      description:
        'หัวข้อ SEO (Meta Title) ที่กระชับ น่าสนใจ และดึงดูดการค้นหา ความยาวประมาณ 50-60 ตัวอักษร',
    },
    seoDescription: {
      type: SchemaType.STRING,
      description:
        'คำอธิบาย SEO (Meta Description) ที่น่าเชื่อถือ ชวนคลิก ความยาวประมาณ 130-160 ตัวอักษร',
    },
    seoKeywords: {
      type: SchemaType.STRING,
      description:
        'คำค้นหา SEO ที่เกี่ยวข้องกับร้านค้า 5-8 คำ คั่นด้วยเครื่องหมายจุลภาค (,)',
    },
  },
  required: ['seoTitle', 'seoDescription', 'seoKeywords'],
}

export const BLOG_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description: 'ชื่อบทความที่ดึงดูด น่าสนใจ และส่งเสริม SEO',
    },
    slug: {
      type: SchemaType.STRING,
      description: 'SEO slug ภาษาอังกฤษรูปแบบ kebab-case',
    },
    content: {
      type: SchemaType.STRING,
      description: 'เนื้อหาบทความแบบฉบับเต็ม รูปแบบ Markdown',
    },
    tags: {
      type: SchemaType.STRING,
      description: 'แท็กบทความ คั่นด้วยเครื่องหมายจุลภาค (,)',
    },
  },
  required: ['title', 'slug', 'content', 'tags'],
}

export const BLOG_SCHEMA_PARTS: Record<string, Schema> = {
  [AiGenTask.TITLE]: {
    type: SchemaType.OBJECT,
    properties: {
      title: {
        type: SchemaType.STRING,
        description: 'ชื่อบทความที่ดึงดูด น่าสนใจ และส่งเสริม SEO',
      },
    },
    required: ['title'],
  },
  [AiGenTask.SLUG]: {
    type: SchemaType.OBJECT,
    properties: {
      slug: {
        type: SchemaType.STRING,
        description: 'SEO slug ภาษาอังกฤษรูปแบบ kebab-case',
      },
    },
    required: ['slug'],
  },
  [AiGenTask.TAGS]: {
    type: SchemaType.OBJECT,
    properties: {
      tags: {
        type: SchemaType.STRING,
        description: 'แท็กบทความ 3-5 คำ คั่นด้วยเครื่องหมายจุลภาค (,)',
      },
    },
    required: ['tags'],
  },
}

export const ANALYTICS_INSIGHTS_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    businessSummary: {
      type: SchemaType.STRING,
      description: 'สรุปภาพรวมสุขภาพธุรกิจใน 2-3 ประโยค',
    },
    operatingHoursStrategy: {
      type: SchemaType.OBJECT,
      properties: {
        recommendedStartHour: {
          type: SchemaType.STRING,
          description: 'เวลาที่ควรเริ่มเปิดร้าน เช่น 10:00 น.',
        },
        peakHoursNotice: {
          type: SchemaType.STRING,
          description: 'วิเคราะห์ช่วงเวลาขายดีและวิธีเตรียมพร้อม',
        },
        actionPlan: {
          type: SchemaType.STRING,
          description: 'คำแนะนำการจัดกำลังคน/วัตถุดิบในช่วง Peak',
        },
      },
      required: ['recommendedStartHour', 'peakHoursNotice', 'actionPlan'],
    },
    productAndBundlingStrategy: {
      type: SchemaType.OBJECT,
      properties: {
        topProductInsight: {
          type: SchemaType.STRING,
          description: 'วิเคราะห์สินค้าขายดีและแนวทางดันยอด',
        },
        bundleSuggestions: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              pairName: { type: SchemaType.STRING },
              promotionIdea: {
                type: SchemaType.STRING,
                description: 'ไอเดียจัดโปรโมชั่นเซ็ตคู่',
              },
            },
            required: ['pairName', 'promotionIdea'],
          },
        },
      },
      required: ['topProductInsight', 'bundleSuggestions'],
    },
    retentionAndMarketingStrategy: {
      type: SchemaType.OBJECT,
      properties: {
        customerInsight: {
          type: SchemaType.STRING,
          description: 'วิเคราะห์อัตราการซื้อซ้ำ (Repeat Purchase Rate)',
        },
        actionableSteps: {
          type: SchemaType.ARRAY,
          items: { type: SchemaType.STRING },
          description:
            '3-4 สิ่งที่ร้านค้าต้องทำทันทีเพื่อเพิ่มยอดขายและลูกค้าซื้อซ้ำ',
        },
      },
      required: ['customerInsight', 'actionableSteps'],
    },
  },
  required: [
    'businessSummary',
    'operatingHoursStrategy',
    'productAndBundlingStrategy',
    'retentionAndMarketingStrategy',
  ],
}

export const AFFILIATE_PRODUCT_AI_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    title: {
      type: SchemaType.STRING,
      description:
        'ชื่อสินค้าที่เขียนใหม่แบบมืออาชีพ สละสลวย น่าซื้อ (ไม่ใช่ก็อปปี้ชื่อดิบจากมาร์เก็ตเพลส)',
    },
    slug: {
      type: SchemaType.STRING,
      description:
        'URL slug ภาษาอังกฤษ ตัวพิมพ์เล็กและขีดกลาง เช่น ergonomic-chair-pro',
    },
    description: {
      type: SchemaType.STRING,
      description:
        'รายละเอียดสินค้าที่มีการเว้นบรรทัด ขึ้นบรรทัดใหม่ จัดย่อหน้าให้อ่านง่าย ห้ามใส่อีโมจิเด็ดขาด หากมีรายการ List ให้ใช้เครื่องหมายขีด (-) นำหน้า',
    },
    price: {
      type: SchemaType.NUMBER,
      description: 'ราคาขายจริง (ตัวเลข ไม่ติดลบ)',
    },
    originalPrice: {
      type: SchemaType.NUMBER,
      description: 'ราคาเต็มก่อนลด (ถ้าไม่มีให้เท่ากับราคาขาย)',
    },
    isOnSale: {
      type: SchemaType.BOOLEAN,
      description: 'กำลังลดราคาหรือไม่',
    },
    discountText: {
      type: SchemaType.STRING,
      description: 'ข้อความป้ายโปรโมชั่น เช่น ลด 30%, Flash Sale, ส่งฟรี',
    },
    platform: {
      type: SchemaType.STRING,
      description: 'SHOPEE, LAZADA, TIKTOK, หรือ OTHER',
    },
    platformLabel: {
      type: SchemaType.STRING,
      description: 'ชื่อป้ายร้านค้า เช่น Shopee Mall, LazMall, ร้านทางการ',
    },
    imageUrl: {
      type: SchemaType.STRING,
      description: 'URL รูปภาพสินค้าหลักที่ตรวจพบ',
    },
    images: {
      type: SchemaType.ARRAY,
      description: 'รายการ URL รูปภาพสินค้าทั้งหมด',
      items: {
        type: SchemaType.STRING,
      },
    },
    videoUrl: {
      type: SchemaType.STRING,
      description: 'URL วิดีโอสินค้าถ้ามี (เช่น TikTok หรือ mp4)',
    },
    tags: {
      type: SchemaType.STRING,
      description:
        'แท็กสินค้า คั่นด้วยจุลภาค เช่น เก้าอี้ทำงาน, สุขภาพ, ergonomic',
    },
    metadata: {
      type: SchemaType.ARRAY,
      description: 'คุณสมบัติและสเปกสินค้า เช่น แบรนด์, วัสดุ, การรับประกัน',
      items: {
        type: SchemaType.OBJECT,
        properties: {
          key: { type: SchemaType.STRING },
          value: { type: SchemaType.STRING },
        },
        required: ['key', 'value'],
      },
    },
  },
  required: ['title', 'slug', 'description', 'price', 'platform', 'isOnSale'],
}

export const STORE_PAGE_AI_SCHEMA: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    content: {
      type: SchemaType.STRING,
      description:
        'เนื้อหาหน้าเว็บแบบ Markdown ภาษาไทย จัดโครงสร้างหัวข้อ (#, ##, ###), รายการ, ตัวหนา, และข้อมูลอย่างสวยงาม ครบถ้วน',
    },
  },
  required: ['content'],
}
