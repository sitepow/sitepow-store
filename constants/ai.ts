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
