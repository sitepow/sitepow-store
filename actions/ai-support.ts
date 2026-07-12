'use server'

import { GEMINI_MODEL } from '@/constants/ai'
import { getRelevantInfo } from '@/constants/help-center'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateAiSupportAction(
  userMessage: string,
  history: string,
) {
  const relevantInfo = getRelevantInfo(userMessage)

  try {
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      systemInstruction: `
        คุณคือผู้ช่วยอัจฉริยะสำหรับร้านค้าออนไลน์ ตอบแชทแทนเจ้าของร้านด้วยความเป็นกันเองและเป็นธรรมชาติเหมือนคนจริงๆ
        ข้อมูลร้านค้าอ้างอิง: ${relevantInfo || 'ไม่มีข้อมูลเฉพาะ'}
        กฎการตอบ:
        - ตอบสั้น กระชับ อ่านง่าย ใช้ Markdown ได้
        - หากไม่ทราบคำตอบ ให้ตอบว่า "ขออภัยครับ เดี๋ยวให้แอดมินมาตรวจสอบรายละเอียดเพิ่มเติมให้สักครู่นะครับ"
        - คำทักทาย/ขอบคุณ: ตอบสั้นๆ ไม่ต้องเป็นทางการ
        - นอกเรื่อง/กวน: ตอบปฏิเสธสุภาพ หรือให้พนักงานรับเรื่องต่อ แต่ถ้าลูกค้าขอโทษ/ปรับทุกข์ ให้แสดงความเข้าใจ
        - มุกตลก/ทั่วไป: เล่นไหลตามน้ำได้ ไม่ต้องยัดเยียดการขาย
        - ไอที/โค้ด: ช่วยเหลือเต็มที่ ตอบแบบเข้าใจง่าย ไม่ทางการ
        - ลิงก์: ใช้ [ข้อความ](URL) เท่านั้น และระบุให้เปิดหน้าใหม่ด้วย <a href="URL" target="_blank">ข้อความ</a>
        - เน้นคิดก่อนตอบเหมือนพนักงานจริง ไม่ต้องเน้นขายของจนเกินพอดี
      `,
    })

    const prompt = `
      ประวัติการสนทนาล่าสุด:
      ${history}
      คำถามจากลูกค้า: "${userMessage}"
    `

    const result = await model.generateContent(prompt)
    const responseText = result.response.text()
    const usageMetadata = result.response.usageMetadata

    return {
      success: true,
      data: responseText,
      usage: {
        inputTokens: usageMetadata?.promptTokenCount ?? 0,
        outputTokens: usageMetadata?.candidatesTokenCount ?? 0,
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
