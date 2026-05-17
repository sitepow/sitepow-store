'use client'

import { useState } from 'react'

import {
  IconCalendarTime,
  IconCamera,
  IconDeviceFloppy,
  IconMail,
  IconPhone,
  IconShieldCheck,
  IconUser,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const MOCK_BUYER_PROFILE = {
  firstName: 'สมชาย',
  lastName: 'ใจดี',
  email: 'somchai.jd@gmail.com',
  phone: '081-234-5678',
  joinedDate: '2026-02-20',
  avatarUrl: null,
}

export function ProfileContent() {
  const [profile, setProfile] = useState(MOCK_BUYER_PROFILE)
  const [firstName, setFirstName] = useState(profile.firstName)
  const [lastName, setLastName] = useState(profile.lastName)
  const [phone, setPhone] = useState(profile.phone)

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconUser}
        title="โปรไฟล์ส่วนตัว"
        description="จัดการข้อมูลบัญชีผู้ซื้อ ชื่อ-นามสกุล
          และเบอร์โทรศัพท์สำหรับติดต่อและรับสิทธิ์สมาชิก"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card className="overflow-hidden text-center">
            <div className="bg-muted/40 h-20" />
            <CardContent className="relative -mt-10 flex flex-col items-center pt-0 pb-6">
              <div className="group relative">
                <div className="border-background bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-full border-4 text-xl font-bold shadow-sm">
                  <span>{firstName[0]}</span>
                </div>
                <button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 rounded-full p-1.5 shadow-md transition-colors"
                >
                  <IconCamera size={12} />
                </button>
              </div>

              <h3 className="text-foreground mt-3 text-sm font-bold">
                {firstName} {lastName}
              </h3>
              <p className="text-muted-foreground font-mono text-[11px]">
                {profile.email}
              </p>
            </CardContent>

            <div className="bg-muted/10 text-muted-foreground flex items-center justify-between border-t px-4 py-2.5 text-left text-[11px]">
              <span className="flex items-center gap-1">
                <IconCalendarTime size={14} /> วันที่เริ่มใช้งาน:
              </span>
              <span className="text-foreground font-mono font-semibold">
                {profile.joinedDate}
              </span>
            </div>
          </Card>
        </div>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-bold">
              แก้ไขข้อมูลส่วนบุคคล
            </CardTitle>
            <CardDescription>
              อัปเดตข้อมูลของคุณให้เป็นปัจจุบัน
              เพื่อประโยชน์ในการติดต่อประสานงานและจัดส่งสินค้า
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="by-fname" className="font-semibold">
                  ชื่อจริง
                </Label>
                <Input
                  id="by-fname"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="by-lname" className="font-semibold">
                  นามสกุล
                </Label>
                <Input
                  id="by-lname"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="max-w-md space-y-1.5">
              <Label
                htmlFor="by-email"
                className="text-muted-foreground flex items-center gap-1 font-semibold"
              >
                <IconMail size={14} /> อีเมลลงทะเบียน (ใช้เข้าสู่ระบบ)
              </Label>
              <Input
                id="by-email"
                value={profile.email}
                disabled
                className="bg-muted text-muted-foreground font-mono text-xs"
              />
            </div>

            <div className="max-w-md space-y-1.5">
              <Label
                htmlFor="by-phone"
                className="flex items-center gap-1 font-semibold"
              >
                <IconPhone size={14} className="text-muted-foreground" />{' '}
                เบอร์โทรศัพท์ติดต่อหลัก
              </Label>
              <Input
                id="by-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="font-mono text-xs"
                placeholder="เช่น 0812345678"
              />
              <div className="mt-1 flex items-start gap-1 rounded-lg border border-amber-100 bg-amber-50/50 p-2 text-[10px] text-amber-600">
                <IconShieldCheck size={14} className="mt-0.5 shrink-0" />
                <span>
                  <strong>ข้อมูลสำคัญ:</strong>{' '}
                  เบอร์โทรศัพท์นี้ระบบจะใช้เชื่อมโยงกับฐานข้อมูลสมาชิกร้านค้า
                  (Loyalty Points) ทั้งฝั่งออนไลน์ Sale Page และออฟไลน์หน้าร้าน
                  POS เพื่อสะสมแต้มให้คุณโดยอัตโนมัติ
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/5 flex justify-end border-t pt-3 pb-3">
            <Button size="sm" className="gap-1.5 text-xs">
              <IconDeviceFloppy size={14} />
              บันทึกข้อมูลโปรไฟล์
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
