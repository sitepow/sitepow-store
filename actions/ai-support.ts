'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateAiSupportAction(
  userMessage: string,
  context?: string,
) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
    })

    const prompt = `
      คุณคือผู้ช่วยอัจฉริยะสำหรับร้านค้าออนไลน์ มีหน้าที่ตอบแชทลูกค้าแทนเจ้าของร้าน
      - ให้คำตอบที่เป็นมิตร สุภาพ และเป็นกันเอง
      - ถ้าลูกค้าถามเกี่ยวกับข้อมูลสินค้า ให้ใช้ข้อมูลนี้ประกอบ: ${context || 'ไม่มีข้อมูลสินค้าเฉพาะเจาะจง'}
      - ถ้าไม่ทราบคำตอบ ให้ตอบแบบสุภาพว่า "ขออภัยครับ เดี๋ยวผมจะให้แอดมินมาตรวจสอบรายละเอียดเพิ่มเติมให้สักครู่นะครับ"
      - ตอบให้สั้น กระชับ แต่อ่านเข้าใจง่าย
      - คำถามลูกค้า: "${userMessage}"
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    return { success: true, data: responseText }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
