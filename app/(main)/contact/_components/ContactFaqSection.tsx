'use client'

import React from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const CONTACT_FAQS = [
  {
    q: 'ติดต่อทีมงานช่องทางใดได้รับคำตอบเร็วที่สุด?',
    a: 'แนะนำช่องทาง LINE Official Account (@830sdfow) ครับ ทีมงานของเราจะได้รับแจ้งเตือนโดยตรงและตอบกลับเฉลี่ยภายในเวลาไม่เกิน 15 นาที ระหว่างเวลาทำการ 09:00 - 24:00 น. ทุกวัน',
  },
  {
    q: 'สามารถนัดหมายขอรับชมการสาธิตระบบ (Live Demo) ได้หรือไม่?',
    a: 'ได้ครับ! สำหรับร้านค้าหรือแบรนด์ที่ต้องการดูภาพรวมการใช้งานจริงของระบบ POS, ระบบสต็อกหลายสาขา หรือแพ็กเกจ Enterprise สามารถกรอกแบบฟอร์มด้านบนหรือทัก LINE เพื่อนัดหมายวิดีโอคอลกับทีมงานได้ฟรี ไม่มีค่าใช้จ่าย',
  },
  {
    q: 'หากระบบมีปัญหาฉุกเฉินนอกเวลาทำการ จะได้รับการดูแลอย่างไร?',
    a: 'ระบบ Cloud Infrastructure ของ Sitepow Store มีระบบอัตโนมัติตรวจสอบสถานะการทำงาน (Uptime Monitoring) เฝ้าระวัง 24/7 และสำหรับลูกค้าแพ็กเกจ Enterprise จะมีช่องทาง Hotline ดูแลส่วนตัวตลอด 24 ชม.',
  },
  {
    q: 'มีทีมงานช่วยแนะนำการตั้งค่าเครื่องพิมพ์ใบเสร็จและอุปกรณ์หน้าร้านไหม?',
    a: 'มีครับ ทีมงาน Technical Support ของเราพร้อมให้คำแนะนำและช่วยเหลือการตั้งค่าไดรเวอร์เครื่องพิมพ์ความร้อน ลิ้นชักเก็บเงิน และเครื่องยิงบาร์โค้ดผ่าน LINE หรือโปรแกรม Remote Support ได้ทันที',
  },
]

export function ContactFaqSection() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="text-primary text-xs font-semibold">
          คำถามที่พบบ่อย
        </span>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
          คำถามที่พบบ่อยเกี่ยวกับการติดต่อและบริการ
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          ข้อมูลเกี่ยวกับการสนับสนุน การขอคำปรึกษา และการนัดหมายสาธิตระบบ
        </p>
      </div>

      {/* Accordion List */}
      <div className="border-border/80 bg-card/60 rounded-3xl border p-4 shadow-xs backdrop-blur-xs sm:p-6">
        <Accordion type="single" collapsible className="w-full">
          {CONTACT_FAQS.map((faq, idx) => (
            <AccordionItem
              key={idx}
              value={`contact-faq-${idx}`}
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
