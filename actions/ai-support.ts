'use server'

import { PLATFORM_GUIDE } from '@/constants/help-center'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateAiSupportAction(userMessage: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
    })

    const prompt = `
      คุณคือผู้ช่วยอัจฉริยะสำหรับร้านค้าออนไลน์ มีหน้าที่ตอบแชทลูกค้าแทนเจ้าของร้าน
      - ให้คำตอบที่เป็นมิตร สุภาพ และเป็นกันเอง
      - ถ้าลูกค้าถามเกี่ยวกับข้อมูลสินค้า ให้ใช้ข้อมูลนี้ประกอบ: ${PLATFORM_GUIDE || 'ไม่มีข้อมูลสินค้าเฉพาะเจาะจง'}
      - ถ้าไม่ทราบคำตอบ ให้ตอบแบบสุภาพว่า "ขออภัยครับ เดี๋ยวผมจะให้แอดมินมาตรวจสอบรายละเอียดเพิ่มเติมให้สักครู่นะครับ"
      - ตอบให้สั้น กระชับ แต่อ่านเข้าใจง่าย ถ้าลูกค้าตอบขอบคุณครับ หรือสวัสดีครับก็ตอบสั้นๆพอนะ ไม่ต้องยาว ไม่ต้องบอกอะไรเยอะ ลดการใช้ : กับพวกหัวข้อนะครับ แต่ยังตอบเป็น .md ได้เหมือนเดิม
      - ถ้าลูกค้าถามนอกเรื่อง ให้ตอบกลับว่าเราไม่มีข้อมูลสำหรับคำถามนี้ครับ ให้รอแอดมินตัวจริงเข้ามาตอบ แต่ก็ต้องพิจารณาเอานะครับว่านอกเรื่องขนาดไหน แต่ถ้าเขาขอโทด หรือ เขาไม่สบายใจอะไรก็ ตอบไม่เป็นไร เหมือนเข้าใจเขานะครับ
      - แต่ถ้าเขาเล่นมุกตลกๆ ก็เล่นไหลตามน้ำไปนะครับ ให้เอ็นจอย ไม่ต้องเชียร์ขายของมากนะครับ ลูกค้าต้องการคนที่เข้าใจเล่นมุกตลกได้ ไม่ได้จะขายของอย่างเดียว
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
