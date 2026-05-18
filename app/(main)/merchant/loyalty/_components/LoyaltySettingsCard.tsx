'use client'

import { ComponentProps } from 'react'

import { IconDeviceFloppy } from '@tabler/icons-react'

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

import { cn } from '@/lib/utils'

interface LoyaltySettings {
  isEnabled: boolean
  earnRate: number
  rewardValue: number
  minRedeemPoints: number
}

interface LoyaltySettingsCardProps extends ComponentProps<typeof Card> {
  settings: LoyaltySettings
  onToggleLoyalty: (checked: boolean) => void
  onInputChange: (field: string, value: number) => void
}

export function LoyaltySettingsCard({
  settings,
  onToggleLoyalty,
  onInputChange,
  className,
  ...props
}: LoyaltySettingsCardProps) {
  return (
    <Card className={cn('h-fit', className)} {...props}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>เงื่อนไขการคำนวณแต้ม</CardTitle>
          <Switch
            checked={settings?.isEnabled}
            onCheckedChange={onToggleLoyalty}
          />
        </div>
        <CardDescription>
          เปิดใช้ระบบคะแนนสะสมและกำหนดสัดส่วนมูลค่าเงินเป็นคะแนน
        </CardDescription>
      </CardHeader>
      <CardContent
        className={`space-y-5 transition-opacity duration-200 ${
          !settings?.isEnabled
            ? 'pointer-events-none opacity-40 select-none'
            : ''
        }`}
      >
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            ยอดซื้อขั้นต่ำต่อการรับ 1 แต้ม
          </Label>
          <div className="flex items-center">
            <Input
              type="number"
              value={settings?.earnRate || ''}
              onChange={(e) =>
                onInputChange('earnRate', Number(e.target.value))
              }
              className="rounded-r-none"
            />
            <span className="bg-muted text-muted-foreground rounded-r-md border border-l-0 px-3 py-2 text-xs whitespace-nowrap">
              บาท = 1 แต้ม
            </span>
          </div>
          <p className="text-muted-foreground text-[10px]">
            เช่น ซื้อครบ 100 บาท ระบบจะคำนวณให้ 1 คะแนนเข้าสู่บัญชีลูกค้า
          </p>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            มูลค่าส่วนลดต่อ 1 แต้ม
          </Label>
          <div className="flex items-center">
            <Input
              type="number"
              value={settings?.rewardValue || ''}
              onChange={(e) =>
                onInputChange('rewardValue', Number(e.target.value))
              }
              className="rounded-r-none"
            />
            <span className="bg-muted text-muted-foreground rounded-r-md border border-l-0 px-3 py-2 text-xs whitespace-nowrap">
              แต้ม = ลด 1 บาท
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-semibold">
            จำนวนแต้มขั้นต่ำที่สามารถแลกได้
          </Label>
          <div className="flex items-center">
            <Input
              type="number"
              value={settings?.minRedeemPoints || ''}
              onChange={(e) =>
                onInputChange('minRedeemPoints', Number(e.target.value))
              }
              className="rounded-r-none"
            />
            <span className="bg-muted text-muted-foreground rounded-r-md border border-l-0 px-3 py-2 text-xs whitespace-nowrap">
              แต้มขึ้นไป
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end border-t pt-3">
        <Button
          size="sm"
          className="gap-1.5 text-xs"
          disabled={!settings?.isEnabled}
        >
          <IconDeviceFloppy size={14} /> บันทึกการตั้งค่า
        </Button>
      </CardFooter>
    </Card>
  )
}
