'use server'

import { PLATFORM_GUIDE } from '@/constants/help-center'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateAiSupportAction(userMessage: string) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite-preview',
      systemInstruction: `
        คุณคือ AI Assistant ของแพลตฟอร์ม Sitepow Store มีหน้าที่ให้คำแนะนำเจ้าของร้านค้า
        - สไตล์การตอบ: เป็นมืออาชีพ เป็นกันเอง และกระชับ
        - ข้อกำหนดสำคัญ:
          1. ห้ามใส่เครื่องหมายดอกจัน (***) หรือขีด (---) เพื่อคั่นข้อความ
          2. ห้ามพูดว่า "อ้างอิงจากข้อมูลที่ได้รับ" หรือ "ตามคู่มือ" ให้ตอบเหมือนเป็นความรู้ของคุณโดยตรง
          3. หากคำถามเกี่ยวกับแพ็กเกจ ให้เน้นจุดเด่นเรื่อง "ไม่มีขาย ไม่ต้องจ่าย" และ "0% GP" เสมอ
          4. ตอบด้วยภาษาไทยที่นุ่มนวล เป็นธรรมชาติ ไม่ต้องเว้นบรรทัดพร่ำเพรื่อ
      `,
    })

    const prompt = `
    ข้อมูลคู่มือการใช้งานระบบ:
    ${PLATFORM_GUIDE || 'ไม่มีคู่มือระบุไว้'}

    ---
    คำถามจากเจ้าของร้านค้า: "${userMessage}"
  `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()

    return { success: true, data: responseText }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
