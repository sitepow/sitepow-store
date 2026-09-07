'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const POS_FAQS = [
  {
    q: 'สามารถใช้งานเมื่อไม่มีอินเทอร์เน็ต (Offline) ได้หรือไม่?',
    a: 'ได้ครับ หากอินเทอร์เน็ตหลุดชั่วคราว ระบบ POS ยังคงเปิดบิล คิดเงิน และพิมพ์ใบเสร็จรับเงินสดหน้าร้านได้อย่างต่อเนื่อง และเมื่ออินเทอร์เน็ตกลับมาเชื่อมต่อ ระบบจะทำการส่งข้อมูลยอดขายและตัดสต็อกขึ้นระบบคลาวด์ให้อัตโนมัติทันที',
  },
  {
    q: 'ต้องซื้ออุปกรณ์หรือเครื่อง POS เฉพาะทางจาก Sitepow หรือไม่?',
    a: 'ไม่จำเป็นเลยครับ! คุณสามารถใช้อุปกรณ์ที่คุณมีอยู่แล้วได้ทันที ไม่ว่าจะเป็นคอมพิวเตอร์ Windows, MacBook, iPad, แท็บเล็ต Android หรือสมาร์ทโฟนทั่วไป และสามารถใช้อุปกรณ์พิมพ์ใบเสร็จหรือสแกนเนอร์บาร์โค้ดทั่วไปในท้องตลาดได้เลย',
  },
  {
    q: 'เครื่องพิมพ์ใบเสร็จความร้อนรุ่นใดบ้างที่รองรับ?',
    a: 'รองรับเครื่องพิมพ์ใบเสร็จความร้อนที่ใช้มาตรฐาน ESC/POS ทุกรุ่น ทั้งขนาดกระดาษ 58 มม. และ 80 มม. เช่นยี่ห้อ Xprinter, Epson, Rongta, Sunmi, Star Micronics ทั้งแบบต่อสาย USB, Wi-Fi, LAN หรือบลูทูธไร้สาย',
  },
  {
    q: 'สต็อกสินค้าจะตัดตรงกับหน้าร้านออนไลน์ทันทีหรือไม่?',
    a: 'ใช่ครับ ทันทีที่มีการสแกนคิดเงินและปิดบิลที่หน้าร้าน POS สต็อกสินค้าในคลังส่วนกลางจะถูกตัดออกทันทีแบบ Real-time ทำให้ลูกค้าที่เข้าชมเว็บไซต์ออนไลน์เห็นจำนวนสินค้าที่อัปเดตล่าสุด ป้องกันปัญหาขายของชนกันได้ 100%',
  },
  {
    q: 'สามารถใช้งานระบบ POS ได้พร้อมกันกี่จุด / กี่สาขา?',
    a: 'ขึ้นอยู่กับแพ็กเกจที่คุณเลือกใช้งาน โดยคุณสามารถเพิ่มจุดขาย (Cashier Points) และแยกคลังสินค้าตามสาขาได้ไม่จำกัด พร้อมกำหนดสิทธิ์ของพนักงานแต่ละคนให้เข้าถึงเฉพาะเครื่องคิดเงินที่กำหนดได้',
  },
  {
    q: 'เชื่อมต่อลิ้นชักเก็บเงินให้เด้งเปิดอัตโนมัติได้อย่างไร?',
    a: 'เพียงเสียบสาย RJ11 จากลิ้นชักเก็บเงินเข้ากับพอร์ตด้านหลังเครื่องพิมพ์ใบเสร็จ เมื่อคุณกดรับชำระเงินสดและสั่งพิมพ์บิล เครื่องพิมพ์จะส่งสัญญาณเปิดลิ้นชักให้เด้งออกอัตโนมัติทันที',
  },
]

export function PosFaqSection() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="text-primary text-xs font-semibold">
          คำถามที่พบบ่อย
        </span>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          คำถามที่พบบ่อยเกี่ยวกับระบบ POS & ฮาร์ดแวร์
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          ข้อสงสัยเกี่ยวกับการติดตั้ง การเชื่อมต่ออุปกรณ์ และการใช้งานหน้าร้าน
        </p>
      </div>

      <div className="border-border/80 bg-card/60 rounded-3xl border p-4 shadow-xs backdrop-blur-xs sm:p-6">
        <Accordion type="single" collapsible className="w-full">
          {POS_FAQS.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`pos-faq-${idx}`}
              className="border-border/60"
            >
              <AccordionTrigger className="text-foreground hover:text-primary cursor-pointer py-4 text-left text-sm font-semibold sm:text-base">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 text-xs leading-relaxed sm:text-sm">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  )
}
