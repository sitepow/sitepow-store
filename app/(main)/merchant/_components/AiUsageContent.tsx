'use client'

import { useState } from 'react'

import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCoins,
  IconHistory,
  IconScan,
  IconSearch,
  IconSparkles,
} from '@tabler/icons-react'
import { AlertCircle } from 'lucide-react'

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
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const MOCK_STORE_AI_CREDITS = [
  {
    id: 'store-1',
    name: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    plan: 'Pro Plan',
    visionCredits: { used: 320, total: 500 },
    searchCredits: { used: 150, total: 200 },
    resetDate: '15 พ.ค. 2026',
  },
  {
    id: 'store-2',
    name: 'ร้านกาแฟหอมกรุ่น Cafe & Bakery',
    plan: 'Starter Plan',
    visionCredits: { used: 0, total: 0 },
    searchCredits: { used: 0, total: 0 },
    resetDate: '-',
  },
  {
    id: 'store-3',
    name: 'Gadget & IT Accessories',
    plan: 'Ultimate Plan',
    visionCredits: { used: 1420, total: 5000 },
    searchCredits: { used: 2100, total: 3000 },
    resetDate: '02 มิ.ย. 2026',
  },
]

const MOCK_AI_LOGS = [
  {
    id: 'log-1',
    storeId: 'store-1',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    feature: 'AI Slip Verification',
    description: 'ตรวจสอบสลิปออเดอร์ #ORD-9942',
    status: 'SUCCESS',
    creditsUsed: 1,
    timestamp: '2026-05-17 10:14',
  },
  {
    id: 'log-2',
    storeId: 'store-3',
    storeName: 'Gadget & IT Accessories',
    feature: 'AI Visual Search',
    description: 'พนักงานสาขา 1 สแกนหาเคสไอโฟนด้วยรูปภาพ',
    status: 'SUCCESS',
    creditsUsed: 1,
    timestamp: '2026-05-17 09:45',
  },
  {
    id: 'log-3',
    storeId: 'store-1',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    feature: 'AI Slip Verification',
    description: 'ตรวจสอบสลิปผิดพลาด (ภาพไม่ชัดเจน)',
    status: 'FAILED',
    creditsUsed: 0,
    timestamp: '2026-05-16 18:22',
  },
  {
    id: 'log-4',
    storeId: 'store-3',
    storeName: 'Gadget & IT Accessories',
    feature: 'AI Visual Search',
    description: 'พนักงานสาขา 2 สแกนหาพาวเวอร์แบงค์',
    status: 'SUCCESS',
    creditsUsed: 1,
    timestamp: '2026-05-16 15:30',
  },
]

export function AiUsageContent() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all')

  const filteredStores =
    selectedStoreId === 'all'
      ? MOCK_STORE_AI_CREDITS
      : MOCK_STORE_AI_CREDITS.filter((s) => s.id === selectedStoreId)

  const filteredLogs =
    selectedStoreId === 'all'
      ? MOCK_AI_LOGS
      : MOCK_AI_LOGS.filter((log) => log.storeId === selectedStoreId)

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconSparkles}
        title="เครดิตและการใช้งาน AI"
        description="ตรวจสอบปริมาณการทำงานของระบบ AI Vision คัดกรองสลิป และ AI Search ค้นหาสินค้าจากคลังรูปภาพ"
        endContent={
          <div className="flex w-full sm:w-auto sm:items-center sm:justify-end">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="เลือกดูทุกร้านค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  ร้านค้าทั้งหมด ({MOCK_STORE_AI_CREDITS.length})
                </SelectItem>
                {MOCK_STORE_AI_CREDITS.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {filteredStores.map((store) => {
          const visionPercent =
            store.visionCredits.total > 0
              ? (store.visionCredits.used / store.visionCredits.total) * 100
              : 0
          const searchPercent =
            store.searchCredits.total > 0
              ? (store.searchCredits.used / store.searchCredits.total) * 100
              : 0

          const isStarter = store.plan === 'Starter Plan'

          const isVisionCritical = visionPercent > 85
          const isSearchCritical = searchPercent > 85

          return (
            <Card
              key={store.id}
              className={`group hover:border-input overflow-hidden border-solid transition-all duration-200 ${
                isVisionCritical || isSearchCritical
                  ? 'border-amber-500/40'
                  : ''
              }`}
            >
              <CardHeader className="bg-muted/20 flex flex-col items-start justify-between gap-3 border-b border-solid p-4 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2.5">
                  <div className="bg-background text-muted-foreground rounded-lg border border-solid p-2">
                    <IconBuildingStore size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <CardTitle className="text-foreground group-hover:text-primary text-sm font-semibold tracking-tight transition-colors">
                      {store.name}
                    </CardTitle>
                    <CardDescription className="text-[11px] font-medium">
                      แพ็กเกจปัจจุบัน:{' '}
                      <span className="text-primary font-semibold">
                        {store.plan}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                {!isStarter && (
                  <Badge
                    variant="secondary"
                    className="bg-muted text-muted-foreground border-none px-2 py-0.5 text-[10px] font-normal shadow-none select-none"
                  >
                    รอบการรีเซ็ตโควตาถัดไป:{' '}
                    <span className="text-foreground ml-1 font-mono font-semibold">
                      {store.resetDate}
                    </span>
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="p-4">
                {isStarter ? (
                  <div className="bg-muted/10 flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed py-8 text-center">
                    <AlertCircle size={24} className="text-amber-500/80" />
                    <h4 className="text-foreground text-sm font-semibold">
                      แพ็กเกจ Starter ไม่รองรับฟีเจอร์ AI อัจฉริยะ
                    </h4>
                    <p className="text-muted-foreground max-w-sm px-4 text-xs leading-normal">
                      อัปเกรดระบบร้านค้าของคุณเป็นระดับ Pro ขึ้นไป
                      เพื่อเปิดใช้งานระบบตรวจสลิป Easy Slip อัตโนมัติ
                      และระบบค้นหาสินค้าด้วยภาพถ่ายหน้าร้านได้ทันที
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                            <IconScan size={16} />
                          </div>
                          <div>
                            <h4 className="text-foreground text-xs font-semibold">
                              AI Vision (Easy Slip Verification)
                            </h4>
                            <p className="text-muted-foreground text-[10px] leading-tight">
                              ตรวจสอบความถูกต้อง คัดกรอง
                              และบันทึกสลิปโอนเงินอัตโนมัติ
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right font-mono text-xs">
                          <span
                            className={`font-semibold ${
                              isVisionCritical
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-foreground'
                            }`}
                          >
                            {store.visionCredits.used.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            /{store.visionCredits.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Progress
                        value={visionPercent}
                        className={`h-1.5 ${isVisionCritical ? '[&>div]:bg-amber-500' : ''}`}
                      />

                      <div className="text-muted-foreground flex justify-between text-[10px]">
                        <span className="flex items-center gap-1">
                          ใช้งานแล้ว {visionPercent.toFixed(1)}%
                          {isVisionCritical && (
                            <IconAlertTriangle
                              size={12}
                              className="inline animate-pulse text-amber-500"
                            />
                          )}
                        </span>
                        <span>
                          คงเหลือ{' '}
                          <span className="text-foreground font-mono font-semibold">
                            {(
                              store.visionCredits.total -
                              store.visionCredits.used
                            ).toLocaleString()}
                          </span>{' '}
                          ครั้ง
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-purple-500/10 p-1.5 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
                            <IconSearch size={16} />
                          </div>
                          <div>
                            <h4 className="text-foreground text-xs font-semibold">
                              AI Visual Search (ค้นหาสินค้าด้วยรูปภาพ)
                            </h4>
                            <p className="text-muted-foreground text-[10px] leading-tight">
                              อัปโหลดรูปภาพเพื่อจับคู่และค้นหาในระบบคลังพัสดุ
                              POS
                            </p>
                          </div>
                        </div>
                        <div className="shrink-0 text-right font-mono text-xs">
                          <span
                            className={`font-semibold ${
                              isSearchCritical
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-foreground'
                            }`}
                          >
                            {store.searchCredits.used.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            /{store.searchCredits.total.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <Progress
                        value={searchPercent}
                        className={`h-1.5 ${isSearchCritical ? '[&>div]:bg-amber-500' : ''}`}
                      />

                      <div className="text-muted-foreground flex justify-between text-[10px]">
                        <span className="flex items-center gap-1">
                          ใช้งานแล้ว {searchPercent.toFixed(1)}%
                          {isSearchCritical && (
                            <IconAlertTriangle
                              size={12}
                              className="inline animate-pulse text-amber-500"
                            />
                          )}
                        </span>
                        <span>
                          คงเหลือ{' '}
                          <span className="text-foreground font-mono font-semibold">
                            {(
                              store.searchCredits.total -
                              store.searchCredits.used
                            ).toLocaleString()}
                          </span>{' '}
                          ครั้ง
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {!isStarter && (
                <CardFooter className="bg-muted/10 flex flex-wrap items-center justify-between gap-3 border-t border-solid p-3 py-2 text-xs">
                  <span className="text-muted-foreground text-[11px] leading-normal">
                    💡 หากโควตารายเดือนหมด ระบบจะคิดอัตราแพ็กเกจเสริมแบบ
                    On-Demand ต่อการใช้งานจริง
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 w-full gap-1 border-solid bg-amber-500/10 text-[11px] font-medium text-amber-600 shadow-none hover:bg-amber-500/20 sm:w-auto dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
                  >
                    <IconCoins size={12} /> ซื้อเครดิต AI เสริม
                  </Button>
                </CardFooter>
              )}
            </Card>
          )
        })}
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-0.5">
          <IconHistory size={16} className="text-muted-foreground" />
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            ประวัติล็อกการใช้งานระบบ AI ล่าสุด
          </h2>
        </div>

        <div className="bg-background overflow-hidden rounded-xl border border-solid shadow-none">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40 whitespace-nowrap">
                <TableRow>
                  <TableHead className="h-9 w-32 text-xs font-medium">
                    เวลาทำรายการ
                  </TableHead>
                  <TableHead className="h-9 min-w-40 text-xs font-medium">
                    สำหรับร้านค้า
                  </TableHead>
                  <TableHead className="h-9 w-40 text-xs font-medium">
                    ฟีเจอร์ AI
                  </TableHead>
                  <TableHead className="h-9 min-w-55 text-xs font-medium">
                    รายละเอียดคำสั่งงาน
                  </TableHead>
                  <TableHead className="h-9 w-24 text-xs font-medium">
                    ผลลัพธ์
                  </TableHead>
                  <TableHead className="h-9 w-28 text-right text-xs font-medium">
                    เครดิตที่ใช้
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-20 text-center text-[11px]"
                    >
                      ไม่พบบันทึกข้อมูลประวัติกิจกรรม AI ของร้านค้าที่คุณเลือก
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => {
                    const isSuccess = log.status === 'SUCCESS'
                    return (
                      <TableRow
                        key={log.id}
                        className="hover:bg-muted/20 border-solid"
                      >
                        <TableCell className="text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                          {log.timestamp}
                        </TableCell>
                        <TableCell className="text-foreground/90 max-w-50 truncate text-xs font-semibold">
                          {log.storeName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className={`border-none px-1.5 py-0.5 text-[10px] font-semibold shadow-none select-none ${
                              log.feature.includes('Slip')
                                ? 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400'
                                : 'bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400'
                            }`}
                          >
                            {log.feature}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground max-w-75 truncate text-xs font-medium">
                          {log.description}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            className={`border-none px-2 py-0.5 text-[10px] font-bold shadow-none select-none ${
                              isSuccess
                                ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'
                                : 'bg-destructive/10 text-destructive dark:bg-destructive/20'
                            }`}
                          >
                            {isSuccess ? 'สำเร็จ' : 'ล้มเหลว'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-foreground text-right font-mono text-xs font-semibold whitespace-nowrap">
                          {log.creditsUsed > 0 ? `-${log.creditsUsed}` : '0'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
