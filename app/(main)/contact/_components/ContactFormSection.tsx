'use client'

import React, { useState } from 'react'
import { toast } from 'react-hot-toast'

import {
  IconCheck,
  IconLoader2,
  IconMessageCircle,
  IconSend,
  IconSparkles,
} from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const TOPICS = [
  'ปรึกษาเปิดร้านค้าใหม่ & แนะนำฟังก์ชัน',
  'สอบถามระบบคิดเงินหน้าร้าน POS & อุปกรณ์ฮาร์ดแวร์',
  'ขอใบเสนอราคาแพ็กเกจ Enterprise สำหรับธุรกิจ',
  'สอบถามการเชื่อมต่อ API / Webhook',
  'แจ้งปัญหาการใช้งานหรือขอความช่วยเหลือทางเทคนิค',
  'เรื่องอื่น ๆ',
]

export function ContactFormSection() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [topic, setTopic] = useState(TOPICS[0])
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!fullName || !email || !message) {
      toast.error('กรุณากรอกข้อมูลสำคัญ (ชื่อ, อีเมล, ข้อความ) ให้ครบถ้วน')
      return
    }

    setIsSubmitting(true)
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
      toast.success('ส่งข้อความสำเร็จ! ทีมงานจะติดต่อกลับโดยเร็วที่สุด')
    }, 1000)
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <span className="text-primary text-xs font-semibold">
          ส่งข้อความถึงเรา
        </span>
        <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
          ส่งข้อความหรือขอคำปรึกษากับเรา
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          กรอกข้อมูลและรายละเอียดด้านล่าง
          เจ้าหน้าที่ผู้เชี่ยวชาญจะติดต่อกลับหาคุณโดยเร็วที่สุด
        </p>
      </div>

      {/* Form Card with BorderBeam */}
      <div className="border-border/80 bg-card/70 relative overflow-hidden rounded-3xl border p-5 shadow-xl backdrop-blur-md sm:p-8 md:p-10">
        <BorderBeam
          size={200}
          duration={10}
          colorFrom="#f97316"
          colorTo="#3b82f6"
          borderWidth={2}
        />

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
              <IconCheck size={36} strokeWidth={2.5} />
            </div>
            <h3 className="text-foreground text-2xl font-bold">
              ได้รับข้อความของคุณเรียบร้อยแล้ว!
            </h3>
            <p className="text-muted-foreground max-w-md text-sm leading-relaxed">
              ขอบคุณที่ให้ความสนใจ Sitepow Store
              เจ้าหน้าที่ของเราได้รับข้อมูลและจะติดต่อกลับผ่านอีเมลหรือเบอร์โทรศัพท์ที่คุณระบุภายใน
              15-30 นาที
            </p>
            <Button
              onClick={() => {
                setIsSuccess(false)
                setMessage('')
              }}
              variant="outline"
              className="mt-4 cursor-pointer"
            >
              ส่งข้อความเพิ่มเติม
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2">
                <Label
                  htmlFor="fullName"
                  className="text-foreground text-xs font-semibold"
                >
                  ชื่อ - นามสกุล หรือชื่อร้านค้า{' '}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="เช่น สมชาย ใจดี หรือ ร้านค้าสวยงาม"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="bg-background/50 h-11 rounded-xl text-sm"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-foreground text-xs font-semibold"
                >
                  เบอร์โทรศัพท์สำหรับติดต่อ
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bg-background/50 h-11 rounded-xl text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-foreground text-xs font-semibold"
                >
                  อีเมล (Email) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@yourdomain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50 h-11 rounded-xl text-sm"
                />
              </div>

              {/* Topic Select */}
              <div className="space-y-2">
                <Label
                  htmlFor="topic"
                  className="text-foreground text-xs font-semibold"
                >
                  หัวข้อที่ต้องการติดต่อ
                </Label>
                <select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="border-input bg-background/50 ring-offset-background focus-visible:ring-ring flex h-11 w-full rounded-xl border px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm"
                >
                  {TOPICS.map((t, idx) => (
                    <option
                      key={idx}
                      value={t}
                      className="bg-background text-foreground"
                    >
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label
                htmlFor="message"
                className="text-foreground text-xs font-semibold"
              >
                รายละเอียดข้อความหรือความต้องการ{' '}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="ระบุข้อความ ปัญหา หรือคำถามที่คุณต้องการสอบถาม เช่น สนใจต้องการเปิดระบบ POS และขอคำแนะนำเรื่องเครื่องพิมพ์ใบเสร็จ..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                className="bg-background/50 rounded-xl text-sm leading-relaxed"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="shadow-primary/20 flex h-11 w-full cursor-pointer items-center justify-center gap-2 text-sm font-semibold shadow-md"
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 size={18} className="animate-spin" />
                    <span>กำลังส่งข้อความ...</span>
                  </>
                ) : (
                  <>
                    <IconSend size={18} />
                    <span>ส่งข้อความติดต่อทีมงาน</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
