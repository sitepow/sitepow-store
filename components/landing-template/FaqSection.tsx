'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQS = [
  {
    q: 'Sitepow Store คิดค่าธรรมเนียม GP ต่อยอดขายหรือไม่?',
    a: 'ไม่มีเลยครับ! เราให้บริการแบบ 0% GP ไม่มีการหักเปอร์เซ็นต์ส่วนแบ่งยอดขายใดๆ ทั้งสิ้น ยอดเงินจากการสั่งซื้อของลูกค้าจะโอนตรงเข้าบัญชีธนาคารของคุณ 100%',
  },
  {
    q: 'ระบบ POS หน้าร้าน ต้องใช้อุปกรณ์อะไรบ้าง?',
    a: 'คุณสามารถใช้อุปกรณ์ที่มีอยู่แล้วได้ทันที ไม่ว่าจะเป็นคอมพิวเตอร์, แล็ปท็อป, iPad หรือมือถือสมาร์ทโฟน เพียงเปิดใช้งานผ่านเบราว์เซอร์ และรองรับการเชื่อมต่อกับเครื่องยิงบาร์โค้ดรวมถึงเครื่องพิมพ์ใบเสร็จความร้อน (Thermal Printer)',
  },
  {
    q: 'ระบบตรวจสลิปโอนเงินด้วย AI ทำงานอย่างไร?',
    a: 'เมื่อลูกค้าอัปโหลดสลิปโอนเงิน ระบบ AI จะทำการสแกน QR Code และอ่านข้อความบนสลิป ตรวจสอบความถูกต้องของยอดเงิน เวลาที่โอน และชื่อบัญชีปลายทาง พร้อมระบบตรวจสอบความซ้ำซ้อนเพื่อป้องกันการนำสลิปเก่ามาใช้ซ้ำ 100%',
  },
  {
    q: 'สามารถขายสินค้าประเภท Digital Key หรือไฟล์ดาวน์โหลดได้ไหม?',
    a: 'ได้ครับ! ระบบรองรับทั้งสินค้าที่มีการจัดส่งจริง (Physical), คีย์รหัสเกม/บัตรเติมเงินแบบจ่ายอัตโนมัติ (Digital Key), ลิงก์ดาวน์โหลดไฟล์ (Digital Link) และส่ง Webhook ไปยังเซิร์ฟเวอร์ของคุณ',
  },
  {
    q: 'ถ้ามีสินค้าเยอะๆ บน Shopee หรือ Lazada สามารถย้ายมาได้ไหม?',
    a: 'สามารถนำเข้าสินค้าจำนวนมากได้สะดวกรวดเร็วผ่านการอัปโหลดไฟล์ CSV หรือ JSON ทำให้คุณเปิดร้านใหม่ได้ภายในเวลาเพียงไม่กี่นาที',
  },
]

export function FaqSection() {
  return (
    <section
      id="faq"
      className="border-border/40 relative w-full border-t py-16 md:py-24"
    >
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 pb-6 text-center">
          <h2 className="text-primary text-sm font-semibold">คำถามที่พบบ่อย</h2>
          <h3 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
            คำถามที่พบบ่อย
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg">
            ข้อสงสัยทั่วไปเกี่ยวกับการเริ่มต้นใช้งาน Sitepow Store
          </p>
        </div>

        <div className="mt-10">
          <Accordion
            type="single"
            collapsible
            className="w-full space-y-3 border-none"
          >
            {FAQS.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`faq-${idx}`}
                className="border-border/80 bg-card data-[state=open]:border-primary/40 rounded-2xl border px-4 shadow-xs transition-all data-[state=open]:shadow-md sm:px-6"
              >
                <AccordionTrigger className="text-card-foreground py-4 text-left text-sm font-semibold hover:no-underline sm:text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4 text-xs leading-relaxed sm:text-sm">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
