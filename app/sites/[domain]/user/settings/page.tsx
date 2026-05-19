'use client'

import { useState } from 'react'

import {
  IconBell,
  IconExclamationCircle,
  IconEye,
  IconEyeOff,
  IconFileExport,
  IconLock,
  IconSettings,
  IconShieldLock,
  IconTrash,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { BuyerLayout } from '@/components/layout/BuyerLayout'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { Switch } from '@/components/ui/switch'

export default function StoreUserSettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [orderNotify, setOrderNotify] = useState(true)
  const [marketingNotify, setMarketingNotify] = useState(false)

  return (
    <BuyerLayout>
      <PageTabHeader
        icon={IconSettings}
        title="ตั้งค่าบัญชีและความเป็นส่วนตัว"
        description="จัดการความปลอดภัยของรหัสผ่าน การรับข้อมูลแจ้งเตือน
          และรักษาสิทธิ์ของข้อมูลส่วนบุคคล (PDPA) ของคุณ"
      />
      <div className="grid grid-cols-1 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-1.5 text-sm font-bold">
              <IconLock size={16} className="text-muted-foreground" />
              เปลี่ยนรหัสผ่าน (Change Password)
            </CardTitle>
            <CardDescription className="text-xs">
              แนะนำให้ใช้รหัสผ่านที่ปลอดภัย ผสมอักษรและตัวเลข
              เพื่อปกป้องกระเป๋าเงินรวมถึงแต้มสะสมทั้งหมดของคุณ
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor="curr-pass"
                  className="text-foreground font-semibold"
                >
                  รหัสผ่านปัจจุบัน
                </Label>
                <div className="relative">
                  <Input
                    id="curr-pass"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        currentPassword: e.target.value,
                      })
                    }
                    className="bg-background h-9 pr-9 text-xs shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 transition-colors focus:outline-none"
                    aria-label={
                      showCurrentPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'
                    }
                  >
                    {showCurrentPassword ? (
                      <IconEyeOff size={16} />
                    ) : (
                      <IconEye size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="new-pass"
                  className="text-foreground font-semibold"
                >
                  รหัสผ่านใหม่
                </Label>
                <div className="relative">
                  <Input
                    id="new-pass"
                    type={showNewPassword ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        newPassword: e.target.value,
                      })
                    }
                    className="bg-background h-9 pr-9 text-xs shadow-sm"
                    placeholder="อย่างน้อย 8 ตัวอักษร"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 transition-colors focus:outline-none"
                  >
                    {showNewPassword ? (
                      <IconEyeOff size={16} />
                    ) : (
                      <IconEye size={16} />
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="confirm-pass"
                  className="text-foreground font-semibold"
                >
                  ยืนยันรหัสผ่านใหม่
                </Label>
                <div className="relative">
                  <Input
                    id="confirm-pass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="bg-background h-9 pr-9 text-xs shadow-sm"
                    placeholder="พิมพ์รหัสผ่านใหม่อีกครั้ง"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-muted-foreground hover:text-foreground absolute top-2.5 right-3 transition-colors focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <IconEyeOff size={16} />
                    ) : (
                      <IconEye size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/30 flex justify-end border-t border-slate-200 py-3 dark:border-slate-800">
            <Button
              size="sm"
              className="h-8 px-4 text-xs font-medium shadow-sm"
            >
              อัปเดตรหัสผ่าน
            </Button>
          </CardFooter>
        </Card>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-1.5 text-sm font-bold">
              <IconBell size={16} className="text-muted-foreground" />
              ตั้งค่าการแจ้งเตือน (Notifications)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="mr-4 space-y-1">
                <Label
                  htmlFor="notify-orders"
                  className="text-foreground block cursor-pointer text-xs font-semibold"
                >
                  แจ้งเตือนสถานะคำสั่งซื้อ
                </Label>
                <span className="text-muted-foreground block text-[11px] leading-normal font-normal">
                  รับการยืนยันทางอีเมลและการแจ้งเตือนในระบบเมื่อสินค้าถูกจัดส่ง
                  ชำระเงินผ่าน หรืออัปเดตสเตตัสพัสดุ
                </span>
              </div>
              <Switch
                id="notify-orders"
                checked={orderNotify}
                onCheckedChange={setOrderNotify}
              />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="mr-4 space-y-1">
                <Label
                  htmlFor="notify-marketing"
                  className="text-foreground block cursor-pointer text-xs font-semibold"
                >
                  ข่าวสารและโปรโมชั่นพิเศษ
                </Label>
                <span className="text-muted-foreground block text-[11px] leading-normal font-normal">
                  รับข้อมูลรหัสคูปองส่วนลด แคมเปญลดกระหน่ำประจำเดือน
                  และกิจกรรมการตลาดต่างๆ จากระบบ
                </span>
              </div>
              <Switch
                id="notify-marketing"
                checked={marketingNotify}
                onCheckedChange={setMarketingNotify}
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200/60 bg-red-50/10 shadow-sm dark:border-red-950 dark:bg-red-950/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm font-bold text-red-600 dark:text-red-400">
              <IconShieldLock size={16} />
              การจัดการข้อมูลส่วนบุคคล (PDPA)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              คุ้มครองความเป็นส่วนตัวและสิทธิ์ของข้อมูลคุณภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="bg-background flex flex-col justify-between gap-3 rounded-xl border border-slate-200 p-4 shadow-sm sm:flex-row sm:items-center dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-foreground flex items-center gap-1 text-xs font-semibold">
                  <IconFileExport size={14} className="text-blue-500" />
                  ขอส่งออกข้อมูลทั้งหมด (Data Portability)
                </span>
                <span className="text-muted-foreground block max-w-xl text-[11px] leading-relaxed">
                  ดาวน์โหลดข้อมูลส่วนตัวทั้งหมด
                  ประวัติการสั่งซื้อสินค้าทุกร้านค้า
                  และแต้มสะสมที่มีในระบบออกมาเก็บไว้ในรูปแบบไฟล์ข้อมูลมาตรฐาน
                  (JSON/CSV)
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-background h-8 shrink-0 text-xs font-medium shadow-sm"
              >
                ร้องขอไฟล์ข้อมูล
              </Button>
            </div>
            <div className="bg-background flex flex-col justify-between gap-3 rounded-xl border border-red-200 p-4 shadow-sm sm:flex-row sm:items-center dark:border-red-900">
              <div className="space-y-0.5">
                <span className="flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  <IconTrash size={14} />
                  ขอลบบัญชีและข้อมูลผู้ใช้งาน (Delete Account)
                </span>
                <span className="text-muted-foreground block max-w-xl text-[11px] leading-relaxed">
                  ลบประวัติการใช้งานและข้อมูลโปรไฟล์ออกจากระบบอย่างถาวรตามกฎหมายสิทธิ์
                  &quot;การถูกลืม&quot; (Right to Erasure)
                </span>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 shrink-0 border border-transparent bg-red-600 text-xs font-medium text-white shadow-sm hover:bg-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900"
                  >
                    ขอลบข้อมูลบัญชี
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-md p-6">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-base font-bold text-red-600 dark:text-red-400">
                      <IconExclamationCircle size={22} />
                      ยืนยันต้องการลบบัญชีผู้ใช้งานถาวร?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-3.5 pt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      <p>
                        ขั้นตอนนี้จะเป็นการลบข้อมูลแบบถาวร
                        **ไม่สามารถกู้คืนหรือย้อนกลับได้**
                        ข้อมูลของคุณทั้งหมดต่อไปนี้จะถูกลบออกทันที:
                      </p>
                      <ul className="text-foreground bg-muted/40 list-disc space-y-1.5 rounded-xl border p-3 pl-7 font-medium">
                        <li>ข้อมูลโปรไฟล์ ที่อยู่ และการติดต่อทั้งหมด</li>
                        <li className="text-red-600 dark:text-red-400">
                          <strong>
                            แต้มคะแนนสะสม (Loyalty Points) จะถูกรีเซ็ตเป็นศูนย์
                          </strong>
                        </li>
                        <li>คูปองส่วนลดของร้านค้าต่างๆ ที่ยังไม่ได้ใช้งาน</li>
                        <li>
                          เงินคงเหลือใน Wallet (กรุณาถอนเงินออกก่อนส่งคำขอ)
                        </li>
                        <li>
                          ประวัติคำสั่งซื้อ ตะกร้าสินค้า และรายการโปรดทั้งหมด
                        </li>
                      </ul>
                      <p className="pt-1 font-bold text-red-500 italic dark:text-red-400">
                        *
                        คุณตรวจสอบและยอมรับว่าต้องการลบบัญชีนี้ออกจากระบบใช่หรือไม่?
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-4 gap-2 text-xs">
                    <AlertDialogCancel className="h-9 text-xs">
                      ยกเลิก
                    </AlertDialogCancel>
                    <AlertDialogAction className="h-9 border bg-red-600 text-xs font-medium text-white hover:bg-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900">
                      ยืนยันลบข้อมูลถาวร
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </BuyerLayout>
  )
}
