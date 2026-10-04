export const PLATFORM_DATA = {
  philosophy: `จุดเด่น: จ่ายตามยอดขาย (ไม่มีขายไม่ต้องจ่าย), 0% GP รับกำไรเต็ม, รองรับการขยายตัว`,
  pricing: `แพ็กเกจ: Free (5 ชิ้น), Starter (490บ./50 ชิ้น), Pro (990บ./ไม่จำกัด/AI+Slip), Ultimate (1,990บ./CRM+Support)`,
  features: `ฟีเจอร์: AI ตั้งชื่อ/หาของ, รับชำระ QR/Stripe, คำนวณค่าส่งอัจฉริยะ, รันบน AMD EPYC ปลอดภัยสูง`,
  navigation: `เมนูจัดการ: จัดการร้านค้า, ออเดอร์, สต็อก/พนักงาน, เครดิต AI, ระบบตลาด, การตั้งค่า`,
  logistics: `การขนส่ง: คำนวณตามโซนอัตโนมัติ (ใกล้/ไกล/ห่างไกล/เกาะ), รองรับขนส่งหลัก (Flash, Kerry, ฯลฯ)`,
}

export function getRelevantInfo(userMessage: string): string {
  const msg = userMessage.toLowerCase()
  let info = ''

  if (msg.includes('ราคา') || msg.includes('แพ็กเกจ') || msg.includes('จ่าย'))
    info += PLATFORM_DATA.pricing + '\n'
  if (
    msg.includes('ฟีเจอร์') ||
    msg.includes('ทำอะไรได้') ||
    msg.includes('ai')
  )
    info += PLATFORM_DATA.features + '\n'
  if (msg.includes('ขนส่ง') || msg.includes('ค่าส่ง'))
    info += PLATFORM_DATA.logistics + '\n'
  if (msg.includes('เมนู') || msg.includes('จัดการ'))
    info += PLATFORM_DATA.navigation + '\n'

  return info || PLATFORM_DATA.philosophy
}
