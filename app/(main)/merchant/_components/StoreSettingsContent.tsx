'use client'

import React, { useState } from 'react'

import {
  IconArrowRight,
  IconBuildingStore,
  IconCheck,
  IconExternalLink,
  IconInfoCircle,
  IconPlus,
  IconRocket,
  IconSparkles,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

type PlanType = 'STARTER' | 'PRO' | 'ULTIMATE'

interface PlanDetails {
  name: string
  price: number
  features: string[]
  isAiSupported: boolean
}

const PLAN_DETAILS: Record<PlanType, PlanDetails> = {
  STARTER: {
    name: 'Starter Plan',
    price: 0,
    features: ['ลงสินค้าได้จำกัด', 'ระบบจัดการออเดอร์พื้นฐาน', 'ไม่มีระบบ AI'],
    isAiSupported: false,
  },
  PRO: {
    name: 'Pro Plan',
    price: 490,
    features: [
      'เพิ่มจำนวนสินค้า',
      'ระบบ Easy Slip ตรวจสลิปอัตโนมัติ',
      'ระบบ AI Vision พื้นฐาน',
    ],
    isAiSupported: true,
  },
  ULTIMATE: {
    name: 'Ultimate Plan',
    price: 1290,
    features: [
      'ลงสินค้าได้ไม่จำกัด (Unlimited)',
      'ระบบ AI ครบวงจร (Vision & Search)',
      'ระบบ CRM เต็มรูปแบบ',
    ],
    isAiSupported: true,
  },
}

const MOCK_STORES = [
  {
    id: '1',
    name: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    slug: 'korean-minimal-shop',
    plan: 'PRO' as PlanType,
    status: 'ACTIVE',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'ร้านกาแฟหอมกรุ่น Cafe & Bakery',
    slug: 'homkrun-cafe',
    plan: 'STARTER' as PlanType,
    status: 'MAINTENANCE',
    createdAt: '2026-03-10',
  },
]

export function StoreSettingsContent() {
  const [stores, setStores] = useState(MOCK_STORES)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [storeName, setStoreName] = useState('')
  const [storeSlug, setStoreSlug] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('STARTER')
  const [isTrial, setIsTrial] = useState(true)

  const formatSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-zA-Z0-9-ก-๙]/g, '-')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
  }

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeName || !storeSlug) return

    const newStore = {
      id: Math.random().toString(),
      name: storeName,
      slug: formatSlug(storeSlug),
      plan: selectedPlan,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0],
    }

    setStores([...stores, newStore])

    setStoreName('')
    setStoreSlug('')
    setSelectedPlan('STARTER')
    setIsTrial(true)
    setIsDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconBuildingStore}
        title="ร้านค้าของคุณ"
        description="จัดการข้อมูลหน้าร้าน สลับเข้าสู่ระบบหลังบ้าน
            หรือเปิดร้านค้าใหม่เพื่อเริ่มธุรกิจเพิ่ม"
        endContent={
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 sm:w-auto">
                <IconPlus size={16} />
                <span>สร้างร้านค้าใหม่</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[95vh] max-w-3xl overflow-y-auto p-6">
              <DialogHeader className="space-y-2">
                <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                  <IconBuildingStore className="text-primary" size={24} />
                  เริ่มต้นสร้างร้านค้าใหม่
                </DialogTitle>
                <DialogDescription>
                  กรอกข้อมูลพื้นฐานเพื่อตั้งค่า URL หน้าร้านที่เป็นเอกลักษณ์
                  พร้อมเลือกแพลนเริ่มต้นใช้งานของคุณ
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCreateStore} className="space-y-6 pt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store-name" className="text-sm font-medium">
                      ชื่อร้านค้า
                    </Label>
                    <Input
                      id="store-name"
                      placeholder="เช่น เสื้อผ้าเด็กมินิมอล"
                      value={storeName}
                      onChange={(e) => {
                        setStoreName(e.target.value)
                        if (!storeSlug) setStoreSlug(e.target.value)
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-slug" className="text-sm font-medium">
                      URL ร้านค้า (Slug)
                    </Label>
                    <div className="flex rounded-lg shadow-sm">
                      <span className="border-input bg-muted text-muted-foreground inline-flex items-center rounded-l-md border border-r-0 px-3 font-mono text-sm">
                        myshop.com/
                      </span>
                      <Input
                        id="store-slug"
                        placeholder="minimal-kids"
                        className="rounded-l-none"
                        value={storeSlug}
                        onChange={(e) => setStoreSlug(e.target.value)}
                        required
                      />
                    </div>
                    {storeSlug && (
                      <p className="text-muted-foreground mt-1 font-mono text-[11px]">
                        ตัวอย่างลิงก์:{' '}
                        <span className="text-primary">
                          myshop.com/{formatSlug(storeSlug)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-foreground text-sm font-semibold">
                    เลือกแผนบริการของร้านค้านี้
                  </Label>
                  <RadioGroup
                    value={selectedPlan}
                    onValueChange={(value) =>
                      setSelectedPlan(value as PlanType)
                    }
                    className="grid grid-cols-1 gap-3 md:grid-cols-3"
                  >
                    {(Object.keys(PLAN_DETAILS) as PlanType[]).map(
                      (planKey) => {
                        const plan = PLAN_DETAILS[planKey]
                        const isSelected = selectedPlan === planKey
                        return (
                          <label
                            key={planKey}
                            className={`group hover:bg-muted/40 relative flex cursor-pointer flex-col justify-between rounded-xl border p-4 transition-all ${
                              isSelected
                                ? 'border-primary ring-primary bg-primary/5 ring-1'
                                : 'border-border bg-background'
                            }`}
                          >
                            <RadioGroupItem
                              value={planKey}
                              className="sr-only"
                            />
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="group-hover:text-primary text-sm font-bold transition-colors">
                                  {plan.name}
                                </span>
                                {plan.isAiSupported && (
                                  <Badge
                                    variant="secondary"
                                    className="gap-0.5 border-none bg-amber-50 px-1.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                                  >
                                    <IconSparkles size={10} /> AI
                                  </Badge>
                                )}
                              </div>

                              <div className="text-foreground text-lg font-extrabold">
                                {plan.price === 0
                                  ? 'ฟรี'
                                  : `฿${plan.price.toLocaleString()}`}
                                {plan.price > 0 && (
                                  <span className="text-muted-foreground text-xs font-normal">
                                    /ด.
                                  </span>
                                )}
                              </div>

                              <ul className="text-muted-foreground space-y-1.5 border-t pt-2.5 text-[11px]">
                                {plan.features.map((feature, idx) => (
                                  <li
                                    key={idx}
                                    className="flex items-start gap-1"
                                  >
                                    <IconCheck
                                      size={12}
                                      className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
                                    />
                                    <span className="line-clamp-1">
                                      {feature}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </label>
                        )
                      },
                    )}
                  </RadioGroup>
                </div>

                <div className="bg-muted/30 flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-0.5">
                    <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                      <IconRocket size={16} className="text-primary" />
                      เปิดสิทธิ์ทดลองใช้งานฟรี (Free Trial)
                    </h4>
                    <p className="text-muted-foreground text-xs">
                      เปิดให้ทดลองใช้งานฟีเจอร์ระดับสูงฟรีเป็นเวลา 14
                      วันก่อนเริ่มเก็บเงินจริง
                    </p>
                  </div>
                  <RadioGroup
                    value={isTrial ? 'trial' : 'pay'}
                    onValueChange={(val) => setIsTrial(val === 'trial')}
                    className="bg-background flex shrink-0 gap-4 rounded-lg border p-1.5"
                  >
                    <div className="flex items-center space-x-1 rounded-md px-2 py-1">
                      <RadioGroupItem value="trial" id="popup-r-trial" />
                      <Label
                        htmlFor="popup-r-trial"
                        className="cursor-pointer text-xs font-medium"
                      >
                        ทดลองฟรี
                      </Label>
                    </div>
                    <div className="flex items-center space-x-1 rounded-md px-2 py-1">
                      <RadioGroupItem
                        value="pay"
                        id="popup-r-pay"
                        disabled={selectedPlan === 'STARTER'}
                      />
                      <Label
                        htmlFor="popup-r-pay"
                        className={`cursor-pointer text-xs font-medium ${selectedPlan === 'STARTER' ? 'text-muted-foreground cursor-not-allowed' : ''}`}
                      >
                        ชำระทันที
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    <span className="text-muted-foreground">
                      ยอดชำระวันนี้:{' '}
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {isTrial || selectedPlan === 'STARTER'
                        ? '฿0 (เริ่มทดลองใช้วันนี้)'
                        : `฿${PLAN_DETAILS[selectedPlan].price.toLocaleString()}`}
                    </span>
                  </div>
                  <DialogFooter className="w-full gap-2 sm:w-auto sm:gap-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      ยกเลิก
                    </Button>
                    <Button type="submit" size="sm">
                      {isTrial || selectedPlan === 'STARTER'
                        ? 'เปิดใช้งานร้านค้าฟรี'
                        : 'ชำrateเงินและเปิดระบบ'}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => {
          const isActive = store.status === 'ACTIVE'
          return (
            <Card
              key={store.id}
              className="flex flex-col justify-between overflow-hidden border border-slate-200 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="bg-muted/40 text-muted-foreground rounded-lg border p-2 shadow-sm">
                    <IconBuildingStore size={20} />
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <Badge
                      variant="outline"
                      className={`gap-1 border-none px-2 py-0.5 text-[10px] font-medium ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      />
                      {isActive ? 'เปิดบริการ' : 'ปิดปรับปรุง'}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="text-[10px] font-medium"
                    >
                      {PLAN_DETAILS[store.plan].name}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1 pt-3">
                  <CardTitle className="line-clamp-1 text-base font-bold">
                    {store.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-1 text-xs">
                    <span className="text-muted-foreground truncate">
                      myshop.com/{store.slug}
                    </span>
                    <a
                      href={`https://myshop.com/${store.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary shrink-0 transition-colors"
                      title="เปิดลิงก์หน้าร้าน"
                    >
                      <IconExternalLink size={12} />
                    </a>
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-4">
                <div className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                  <IconInfoCircle size={13} />
                  <span>เปิดระบบเมื่อ: {store.createdAt}</span>
                </div>
              </CardContent>

              <CardFooter className="bg-muted/40 flex items-center gap-2 border-t p-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 flex-1 text-xs"
                >
                  ดูหน้าร้าน
                </Button>
                <Button
                  size="sm"
                  className="h-8 flex-[1.5] gap-1 text-xs font-medium"
                >
                  <span>จัดการระบบ</span>
                  <IconArrowRight size={12} />
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
