'use server'

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

    const prompt = `ช่วยคิดข้อมูลสินค้า: "${title}". 
    - categoryId: "019d8c50-5e3a-7df1-8de0-e260f4f4f8dd"
    - ในส่วน "metadata.details": ให้เพิ่มคุณสมบัติเชิงลึก 3-5 อย่าง โดยใช้ key เป็นภาษาอังกฤษ (snake_case) และ value เป็นภาษาไทย เช่น {"key": "brand", "value": "ชื่อแบรนด์"}
    - metadata.tags: keywords 3-5 คำ
    - ข้อมูลที่เป็นภาษาไทย: title, variants.title, addons.title, และค่า (value) ใน metadata
    - ข้อมูลที่เป็นภาษาอังกฤษ: slug, variants.sku, และชื่อคีย์ (key) ใน metadata`

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    return JSON.parse(responseText)
  } catch (error) {
    console.error('Gemini Error:', error)
    throw new Error('Failed to generate product content')
  }
}
