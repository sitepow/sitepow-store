'use client'

import { useState } from 'react'

import {
  IconCamera,
  IconCrown,
  IconDeviceFloppy,
  IconLanguage,
  IconMail,
  IconPhone,
  IconSunMoon,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const MOCK_USER_PROFILE = {
  firstName: 'สมสิทธิ์',
  lastName: 'เก่งงานโค้ด',
  email: 'owner@sitepow.com',
  phone: '086-555-9999',
  avatarUrl: null,
  language: 'th',
  theme: 'light',
  accountTier: 'ENTERPRISE',
  joinedDate: '2026-01-15',
}

export function ProfileContent() {
  const [profile, setProfile] = useState(MOCK_USER_PROFILE)

  const handleInputChange = (field: string, value: string) => {
    setProfile({ ...profile, [field]: value })
  }

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconUser}
        title="โปรไฟล์ส่วนตัว"
        description=" จัดการข้อมูลผู้ใช้งานหลักของคุณ ตั้งค่าภาษา และการแสดงผลส่วนบุคคล"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="overflow-hidden text-center">
            <div className="from-primary/20 to-primary/5 h-24 bg-linear-to-r" />
            <CardContent className="relative -mt-12 flex flex-col items-center pt-0 pb-6">
              <div className="group relative">
                <div className="border-background bg-muted text-muted-foreground flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 text-2xl font-bold shadow-sm">
                  <span>{profile.firstName[0]}</span>
                </div>
                <button
                  type="button"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 absolute right-0 bottom-0 rounded-full p-1.5 shadow-md transition-colors"
                >
                  <IconCamera size={14} />
                </button>
              </div>

              <h2 className="text-foreground mt-4 text-base font-bold">
                {profile.firstName} {profile.lastName}
              </h2>
              <p className="text-muted-foreground font-mono text-xs">
                {profile.email}
              </p>

              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">
                <IconCrown
                  size={14}
                  className="fill-amber-500 text-amber-600"
                />
                <span>{profile.accountTier} Plan</span>
              </div>
            </CardContent>
            <div className="bg-muted/20 text-muted-foreground flex justify-between border-t px-5 py-3 text-left text-[11px]">
              <span>เป็นสมาชิกตั้งแต่:</span>
              <span className="text-foreground font-mono font-semibold">
                {profile.joinedDate}
              </span>
            </div>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">ข้อมูลส่วนตัว</CardTitle>
              <CardDescription>
                ข้อมูลนี้จะใช้สำหรับระบุตัวตนของคุณในฐานะเจ้าของระบบและใช้รับอีเมลแจ้งเตือนสำคัญ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="pf-fname" className="font-semibold">
                    ชื่อจริง
                  </Label>
                  <Input
                    id="pf-fname"
                    value={profile.firstName}
                    onChange={(e) =>
                      handleInputChange('firstName', e.target.value)
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pf-lname" className="font-semibold">
                    นามสกุล
                  </Label>
                  <Input
                    id="pf-lname"
                    value={profile.lastName}
                    onChange={(e) =>
                      handleInputChange('lastName', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pf-email"
                    className="flex items-center gap-1 font-semibold"
                  >
                    <IconMail size={14} className="text-muted-foreground" />{' '}
                    อีเมลหลักของบัญชี (ล็อกอิน)
                  </Label>
                  <Input
                    id="pf-email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="bg-muted text-muted-foreground"
                  />
                  <p className="text-muted-foreground text-[10px]">
                    อีเมลล็อกอินไม่สามารถเปลี่ยนได้เอง กรุณาติดต่อฝ่ายสนับสนุน
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pf-phone"
                    className="flex items-center gap-1 font-semibold"
                  >
                    <IconPhone size={14} className="text-muted-foreground" />{' '}
                    เบอร์โทรศัพท์ติดต่อ
                  </Label>
                  <Input
                    id="pf-phone"
                    value={profile.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold">
                ตั้งค่าการแสดงผลส่วนตัว (Preferences)
              </CardTitle>
              <CardDescription>
                ปรับแต่งภาษาและธีมของหน้าแดชบอร์ดตามความถนัดของคุณ
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 font-semibold">
                  <IconLanguage size={14} className="text-muted-foreground" />{' '}
                  ภาษาที่ใช้งาน (Language)
                </Label>
                <Select
                  value={profile.language}
                  onValueChange={(val) => handleInputChange('language', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="th">ภาษาไทย (Thai)</SelectItem>
                    <SelectItem value="en">English (US)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 font-semibold">
                  <IconSunMoon size={14} className="text-muted-foreground" />{' '}
                  ธีมระบบ (Display Theme)
                </Label>
                <Select
                  value={profile.theme}
                  onValueChange={(val) => handleInputChange('theme', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="light">
                      Light Mode (โหมดสว่าง)
                    </SelectItem>
                    <SelectItem value="dark">Dark Mode (โหมดมืด)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="bg-muted/5 flex justify-end border-t pt-3 pb-3">
              <Button size="sm" className="gap-1.5 text-xs">
                <IconDeviceFloppy size={14} /> บันทึกโปรไฟล์ส่วนตัว
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
