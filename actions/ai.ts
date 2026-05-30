'use server'

import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateProductAiAction(title: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            slug: { type: SchemaType.STRING },
            categoryId: { type: SchemaType.STRING },
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
              },
            },
            metadata: {
              type: SchemaType.OBJECT,
              properties: {
                tags: {
                  type: SchemaType.ARRAY,
                  items: { type: SchemaType.STRING },
                },
                details: {
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
              required: ['tags', 'details'],
            },
          },
          required: ['title', 'slug', 'variants', 'metadata'],
        },
      },
    })

    const availableKeys = PRODUCT_METADATA_MASTER.flatMap((group) =>
      group.fields.map((field) => field.key),
    )

    const prompt = `ช่วยคิดข้อมูลสินค้า: "${title}". 
    - categoryId: "019d8c50-5e3a-7df1-8de0-e260f4f4f8dd"
    - ในส่วน "metadata.details": ให้เลือกคุณสมบัติเชิงลึกที่เกี่ยวข้องกับตัวสินค้าที่สุดจำนวน 3-5 อย่าง
    - ข้อบังคับสำคัญ: ฟิลด์ "key" จะต้องเลือกมาจากรายการที่กำหนดให้ต่อไปนี้เท่านั้น ห้ามคิดคีย์ใหม่เองเด็ดขาด!
      รายการคีย์ที่เลือกใช้ได้: ${JSON.stringify(availableKeys)}
    - ส่วน "value" ให้เติมค่าที่เหมาะสมเป็นภาษาไทย เช่น ถ้าเลือก key "battery_life" ให้ใส่ value เป็น "ใช้งานได้สูงสุด 40 ชั่วโมง"
    - metadata.tags: keywords 3-5 คำ (ภาษาไทย)
    - ข้อมูลที่เป็นภาษาไทย: title, variants.title, addons.title, และค่า (value) ใน metadata
    - ข้อมูลที่เป็นภาษาอังกฤษ: slug, variants.sku
    - variants[].discount: active: false, type: "PERCENTAGE", amount: 0 เสมอ
    - variants[].rewardPoints: isActive: false, amount: 0 เสมอ`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    return JSON.parse(responseText)
  } catch (error) {
    console.error('Gemini Error:', error)
    throw new Error('Failed to generate product content')
  }
}
