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
            metadata: {
              type: SchemaType.OBJECT,
              properties: {
                brand: { type: SchemaType.STRING },
                material: { type: SchemaType.STRING },
              },
            },
          },
        },
      },
    })

    const prompt = `ช่วยคิดข้อมูลสินค้าอย่างละเอียดสำหรับชื่อสินค้า: "${title || 'สินค้าใหม่'}". 
    โดยเน้นกลุ่มลูกค้าพรีเมียม, เจนชื่อ variants, ราคาที่เหมาะสม, และวัสดุที่ใช้. 
    สำหรับ categoryId ให้เลือกค่านี้เสมอ: "019d8c50-5e3a-7df1-8de0-e260f4f4f8dd" และเป็นภาษาไทยทั้งหมด`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    return JSON.parse(response)
  } catch (error) {
    console.log(error)

    console.error('Gemini Error:', error)
    throw new Error('Failed to generate content')
  }
}
