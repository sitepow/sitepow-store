'use client'

import { useState } from 'react'

import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

import {
  useDeleteUserAccount,
  useExportUserData,
} from '@/actions/hooks/storefront/pdpa'
import { IconShieldLock } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function PdpaManagementForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const { mutate: exportData, isPending: isExporting } = useExportUserData()
  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteUserAccount()

  const handleDelete = () => {
    deleteAccount(undefined, {
      onSuccess: async (data) => {
        setOpen(false)
        if (data?.success) {
          await signOut({ redirect: false })
          router.replace('/')
        }
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconShieldLock}
          title="การจัดการข้อมูล (PDPA)"
          description="คุ้มครองความเป็นส่วนตัวและสิทธิ์ของข้อมูลคุณภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล"
        />
      </CardHeader>
      <CardContent className="divide-border divide-y">
        <div className="flex flex-wrap items-center justify-between gap-5 pb-4">
          <div className="pr-4">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              ขอส่งออกข้อมูลทั้งหมด
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              ดาวน์โหลดข้อมูลส่วนตัวทั้งหมด ประวัติการสั่งซื้อสินค้าทุกร้านค้า
              และแต้มสะสมที่มีในระบบออกมาเก็บไว้ในรูปแบบไฟล์ข้อมูลมาตรฐาน
              (JSON/CSV)
            </span>
          </div>
          <Button
            variant="outline"
            disabled={isExporting}
            onClick={() => exportData()}
          >
            {isExporting ? 'กำลังเตรียมไฟล์...' : 'ร้องขอไฟล์ข้อมูล'}
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 pt-4">
          <div className="pr-4">
            <span className="text-destructive block text-sm font-medium">
              ขอลบบัญชีและข้อมูลผู้ใช้งาน
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              ลบประวัติการใช้งานและข้อมูลโปรไฟล์ออกจากระบบอย่างถาวรตามกฎหมายสิทธิ์
              &quot;การถูกลืม&quot; (Right to Erasure)
            </span>
          </div>
          <Button variant="destructive" onClick={() => setOpen(true)}>
            ขอลบข้อมูลบัญชี
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ยืนยันการลบบัญชีถาวร</AlertDialogTitle>
            <AlertDialogDescription>
              การกระทำนี้ไม่สามารถย้อนกลับได้
              บัญชีและข้อมูลโปรไฟล์ของคุณจะถูกลบออกจากระบบทันที
              และคุณจะออกจากระบบโดยอัตโนมัติ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={handleDelete}
            >
              {isDeleting ? 'กำลังลบ...' : 'ยืนยันลบบัญชี'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
