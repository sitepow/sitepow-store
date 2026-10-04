'use client'

import { useRouter } from 'next/navigation'

import {
  useDeleteUserAccount,
  useExportUserData,
} from '@/actions/storefront/pdpa/hooks'
import { IconShieldLock } from '@tabler/icons-react'

import { DeleteButton } from '@/components/shared/DeleteButton'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { authClient } from '@/lib/auth/client'

export function PdpaManagementForm() {
  const router = useRouter()

  const { mutate: exportData, isPending: isExporting } = useExportUserData()
  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteUserAccount()

  const handleDelete = () => {
    deleteAccount(undefined, {
      onSuccess: async (data) => {
        if (data?.success) {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.replace('/')
              },
            },
          })
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
          <DeleteButton
            isPending={isExporting}
            onDelete={() => exportData()}
            title="ยืนยันการขอส่งออกข้อมูล?"
            description="ระบบจะทำการรวบรวมข้อมูลส่วนตัว ประวัติการสั่งซื้อ และแต้มสะสมของคุณเพื่อเตรียมไฟล์ดาวน์โหลด"
          >
            <Button variant="outline" disabled={isExporting}>
              {isExporting ? 'กำลังเตรียมไฟล์...' : 'ร้องขอไฟล์ข้อมูล'}
            </Button>
          </DeleteButton>
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
          <DeleteButton
            isPending={isDeleting}
            onDelete={handleDelete}
            title="ยืนยันการลบบัญชีถาวร"
            description="การกระทำนี้ไม่สามารถย้อนกลับได้ บัญชีและข้อมูลโปรไฟล์ของคุณจะถูกลบออกจากระบบทันที และคุณจะออกจากระบบโดยอัตโนมัติ"
          >
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? 'กำลังลบ...' : 'ขอลบข้อมูลบัญชี'}
            </Button>
          </DeleteButton>
        </div>
      </CardContent>
    </Card>
  )
}
