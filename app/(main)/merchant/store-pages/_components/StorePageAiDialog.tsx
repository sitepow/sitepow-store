'use client'

import { IconSparkles } from '@tabler/icons-react'

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

import { PageItemConfig } from '../_hooks/use-store-pages-form'

interface StorePageAiDialogProps {
  aiConfirmPage: PageItemConfig | null
  aiEstimatedCost: number
  storeName?: string
  locale: string
  style?: React.CSSProperties
  onClose: () => void
  onConfirm: () => void
}

export function StorePageAiDialog({
  aiConfirmPage,
  aiEstimatedCost,
  storeName,
  locale,
  style,
  onClose,
  onConfirm,
}: StorePageAiDialogProps) {
  return (
    <AlertDialog
      open={!!aiConfirmPage}
      onOpenChange={onClose}
    >
      <AlertDialogContent style={style}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <IconSparkles className="text-primary size-5" />
            {locale === 'th'
              ? `ให้ AI ช่วยคิดเนื้อหาหน้า "${aiConfirmPage?.label}"`
              : `Generate content for "${aiConfirmPage?.label}" with AI`}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground space-y-3 pt-2 text-sm">
              <p>
                {locale === 'th'
                  ? `ระบบ AI จะนำข้อมูลร้านค้า "${storeName || ''}" (เช่น คำอธิบายร้านค้า, สินค้า, ข้อมูลติดต่อ) มาวิเคราะห์และสร้างเนื้อหาแบบ Markdown ที่ตรงกับร้านค้าของคุณให้อัตโนมัติ`
                  : `AI will analyze your store information and generate tailored Markdown content.`}
              </p>
              <div className="bg-muted/50 space-y-1 rounded-xl border p-3 text-xs">
                <div className="text-foreground flex items-center justify-between font-medium">
                  <span>
                    {locale === 'th'
                      ? 'ประมาณการค่าบริการ AI:'
                      : 'Estimated AI Cost:'}
                  </span>
                  <span className="text-primary text-sm font-bold">
                    {aiEstimatedCost} {locale === 'th' ? 'เครดิต' : 'Credits'}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px]">
                  {locale === 'th'
                    ? '* หักจากเครดิตคงเหลือของร้านค้าตามจำนวน Token ที่ใช้งานจริง'
                    : '* Deducted from store credits balance based on actual tokens used'}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            {locale === 'th' ? 'ยกเลิก' : 'Cancel'}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="cursor-pointer font-semibold"
          >
            <IconSparkles className="mr-1.5 size-4" />
            {locale === 'th'
              ? 'ยืนยันให้ AI สร้างเนื้อหา'
              : 'Confirm & Generate'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
