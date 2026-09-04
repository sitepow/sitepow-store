'use client'

import React, { useState } from 'react'

import { useBranchOptions } from '@/actions/hooks/branch'
import {
  useAutoMapProductsBySku,
  useDeleteProductMapping,
  useDisconnectMarketplace,
  useMarketplaceConnections,
  useMarketplaceMappings,
  useMarketplaceSyncLogs,
  useSaveMarketplaceConnection,
  useSaveProductMapping,
  useSimulateInboundOrder,
  useToggleMarketplaceAutoSync,
  useTriggerManualSync,
} from '@/actions/hooks/marketplace'
import { MarketplacePlatform } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import {
  IconAlertCircle,
  IconCheck,
  IconClock,
  IconLink,
  IconPlayerPlay,
  IconPlus,
  IconRefresh,
  IconShare,
  IconTrash,
  IconX,
} from '@tabler/icons-react'
import { format } from 'date-fns'
import { th } from 'date-fns/locale'

import { PageTabHeader } from '@/components/PageTabHeader'
import { ProductImage } from '@/components/ProductImage'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
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
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const PLATFORMS_METADATA = [
  {
    platform: MarketplacePlatform.SHOPEE,
    name: 'Shopee',
    logoUrl: '/images/marketplaces/shopee.png',
    description: 'ซิงค์สต็อกสินค้าอัตโนมัติกับร้านค้าบน Shopee (Open API v2)',
    appKeyLabel: 'Partner ID',
    appSecretLabel: 'Partner Key',
    shopIdLabel: 'Shop ID',
    hasAccessToken: true,
  },
  {
    platform: MarketplacePlatform.LAZADA,
    name: 'Lazada',
    logoUrl: '/images/marketplaces/lazada.png',
    description: 'เชื่อมต่อและอัปเดตสต็อกสินค้าไปยัง Lazada Seller Center',
    appKeyLabel: 'App Key',
    appSecretLabel: 'App Secret',
    shopIdLabel: 'Seller ID',
    hasAccessToken: true,
  },
  {
    platform: MarketplacePlatform.FACEBOOK,
    name: 'Facebook Marketplace',
    logoUrl: '/images/marketplaces/facebook.png',
    description: 'ซิงค์สต็อกกับ Meta Commerce Manager และ Catalog Batch API',
    appKeyLabel: 'App ID (ไม่บังคับ)',
    appSecretLabel: 'App Secret (ไม่บังคับ)',
    shopIdLabel: 'Catalog ID',
    hasAccessToken: true,
  },
]

export function MarketplaceSettingsForm() {
  const { selectedStoreId } = useStoreFilter()
  const { data: connections = [], isLoading: isConnectionsLoading } =
    useMarketplaceConnections(selectedStoreId)
  const { data: mappings = [], isLoading: isMappingsLoading } =
    useMarketplaceMappings(selectedStoreId)
  const { data: logsData, isLoading: isLogsLoading } = useMarketplaceSyncLogs(
    selectedStoreId,
    1,
    20,
  )
  const { data: branches = [] } = useBranchOptions(selectedStoreId)

  const saveConnectionMutation = useSaveMarketplaceConnection()
  const toggleAutoSyncMutation = useToggleMarketplaceAutoSync()
  const disconnectMutation = useDisconnectMarketplace()
  const autoMapMutation = useAutoMapProductsBySku()
  const triggerSyncMutation = useTriggerManualSync()
  const saveMappingMutation = useSaveProductMapping()
  const deleteMappingMutation = useDeleteProductMapping()
  const simulateOrderMutation = useSimulateInboundOrder()

  const [editingPlatform, setEditingPlatform] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    shopId: '',
    shopName: '',
    appKey: '',
    appSecret: '',
    accessToken: '',
    isSimulator: false,
    defaultBranchId: '',
  })

  const [simulatingConnection, setSimulatingConnection] = useState<any | null>(
    null,
  )
  const [simulateSku, setSimulateSku] = useState('')
  const [simulateQuantity, setSimulateQuantity] = useState(1)

  const [isAddMappingOpen, setIsAddMappingOpen] = useState(false)
  const [newMappingData, setNewMappingData] = useState({
    connectionId: '',
    variantId: '',
    marketplaceItemId: '',
    marketplaceSku: '',
  })

  const openEditDialog = (platformMeta: any) => {
    const existing = connections.find(
      (c) => c.platform === platformMeta.platform,
    )
    setEditingPlatform(platformMeta)
    setFormData({
      shopId: existing?.shopId || '',
      shopName: existing?.shopName || `${platformMeta.name} Store`,
      appKey: existing?.appKey || '',
      appSecret: existing?.appSecret || '',
      accessToken: existing?.accessToken || '',
      isSimulator: existing?.isSimulator ?? false,
      defaultBranchId: existing?.defaultBranchId || '',
    })
  }

  const handleSaveConnection = () => {
    if (!editingPlatform) {
      return
    }

    saveConnectionMutation.mutate(
      {
        storeId: selectedStoreId,
        data: {
          platform: editingPlatform.platform,
          ...formData,
        },
      },
      {
        onSuccess: () => setEditingPlatform(null),
      },
    )
  }

  const handleSimulateOrder = () => {
    if (!simulatingConnection || !simulateSku) {
      return
    }
    simulateOrderMutation.mutate(
      {
        storeId: selectedStoreId,
        connectionId: simulatingConnection.id,
        sku: simulateSku,
        quantity: simulateQuantity,
      },
      {
        onSuccess: () => setSimulatingConnection(null),
      },
    )
  }

  return (
    <div className="space-y-6">
      <PageTabHeader
        variant="secondary"
        icon={IconShare}
        title="เชื่อมต่อมาร์เก็ตเพลส (Shopee, Lazada, Facebook)"
        description="ระบบซิงค์และตัดสต็อกหลายช่องทางอัตโนมัติ ตัดสต็อกทันทีเมื่อมีรายการขายเกิดขึ้น"
      />
      <Tabs defaultValue="connections" className="space-y-6">
        <div className="overflow-x-auto pb-1">
          <TabsList className="bg-background/80 flex h-auto w-fit shrink-0 flex-row! items-center justify-start gap-1 rounded-xl border p-1 shadow-sm">
            <TabsTrigger
              value="connections"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
            >
              1. การเชื่อมต่อช่องทาง
            </TabsTrigger>
            <TabsTrigger
              value="mappings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
            >
              2. จับคู่สินค้า (SKU Mapping){' '}
              {mappings.length > 0 && `(${mappings.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground shrink-0 rounded-lg px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all"
            >
              3. ประวัติการซิงค์ (Logs)
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {PLATFORMS_METADATA.map((meta) => {
              const conn = connections.find((c) => c.platform === meta.platform)
              const isConnected = conn?.status === 'CONNECTED'

              return (
                <Card
                  key={meta.platform}
                  className="flex flex-col justify-between"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <ProductImage
                          src={meta.logoUrl}
                          alt={`${meta.name} Logo`}
                          className="bg-background size-8 rounded-lg border p-1 md:size-8"
                        />
                        <CardTitle className="text-lg">{meta.name}</CardTitle>
                      </div>
                      {isConnected ? (
                        <Badge variant="default" className="bg-emerald-600">
                          <IconCheck className="mr-1 size-3" /> เชื่อมต่อแล้ว
                        </Badge>
                      ) : (
                        <Badge variant="outline">ยังไม่ได้เชื่อม</Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs">
                      {meta.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {conn && (
                      <div className="bg-muted/50 space-y-2 rounded-lg p-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            ชื่อร้าน:
                          </span>
                          <span className="font-medium">
                            {conn.shopName || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Shop / ID:
                          </span>
                          <span className="font-medium">
                            {conn.shopId || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            สินค้าที่ผูก:
                          </span>
                          <span className="font-medium">
                            {conn._count?.mappings ?? 0} รายการ
                          </span>
                        </div>
                        {conn.isSimulator && (
                          <div className="font-medium text-amber-600">
                            * โหมดจำลอง (Simulator Mode)
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t pt-2">
                          <span>Auto-Sync สต็อก:</span>
                          <Switch
                            checked={conn.isAutoSync}
                            onCheckedChange={(checked) =>
                              toggleAutoSyncMutation.mutate({
                                connectionId: conn.id,
                                isAutoSync: checked,
                                storeId: selectedStoreId,
                              })
                            }
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button
                        variant={isConnected ? 'outline' : 'default'}
                        size="sm"
                        className="flex-1"
                        onClick={() => openEditDialog(meta)}
                      >
                        <IconLink className="mr-1 size-3" />
                        {isConnected
                          ? 'ตั้งค่าการเชื่อมต่อ'
                          : 'เชื่อมต่อร้านค้า'}
                      </Button>
                      {isConnected && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            title="ซิงค์สต็อกทุกรายการเดี๋ยวนี้"
                            disabled={triggerSyncMutation.isPending}
                            onClick={() =>
                              triggerSyncMutation.mutate({
                                connectionId: conn.id,
                                storeId: selectedStoreId,
                              })
                            }
                          >
                            <IconRefresh className="size-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            title="ทดสอบจำลองคำสั่งซื้อ (Simulator Order)"
                            onClick={() => {
                              setSimulatingConnection(conn)
                              setSimulateSku('')
                              setSimulateQuantity(1)
                            }}
                          >
                            <IconPlayerPlay className="size-3.5 text-blue-600" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
        <TabsContent value="mappings" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold">
                การจับคู่รหัสสินค้า (SKU Mapping)
              </h3>
              <p className="text-muted-foreground text-xs">
                จับคู่รหัส Variant ในระบบ กับ SKU บน Marketplace
                เพื่อให้สต็อกตัดพร้อมกัน
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {connections.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={autoMapMutation.isPending}
                  onClick={() => {
                    const activeConn = connections[0]
                    if (activeConn) {
                      autoMapMutation.mutate({
                        storeId: selectedStoreId,
                        connectionId: activeConn.id,
                      })
                    }
                  }}
                >
                  <IconRefresh className="mr-1 size-3.5" />
                  จับคู่อัตโนมัติด้วย SKU
                </Button>
              )}
            </div>
          </div>
          <div className="bg-card rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้าในร้าน</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>แพลตฟอร์ม</TableHead>
                  <TableHead>Marketplace SKU</TableHead>
                  <TableHead className="text-center">สต็อกปัจจุบัน</TableHead>
                  <TableHead className="text-center">
                    สต็อกที่ซิงค์ล่าสุด
                  </TableHead>
                  <TableHead className="text-right">จัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isMappingsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <Spinner className="mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : mappings.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground h-24 text-center"
                    >
                      ยังไม่มีการจับคู่สินค้า กรุณากด "จับคู่อัตโนมัติด้วย SKU"
                      ด้านบน
                    </TableCell>
                  </TableRow>
                ) : (
                  mappings.map((m) => {
                    const currentStock =
                      m.variant?.stocks?.reduce(
                        (sum: number, s: any) => sum + s.quantity,
                        0,
                      ) ?? 0

                    return (
                      <TableRow key={m.id}>
                        <TableCell className="font-medium">
                          {m.variant?.product?.title} - {m.variant?.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {m.variant?.sku || '-'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {m.connection?.platform}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">
                          {m.marketplaceSku}
                        </TableCell>
                        <TableCell className="text-center font-bold">
                          {currentStock}
                        </TableCell>
                        <TableCell className="text-center">
                          {m.lastSyncedStock !== null ? (
                            <span className="font-semibold text-emerald-600">
                              {m.lastSyncedStock}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="ซิงค์สต็อกชิ้นนี้เดี๋ยวนี้"
                              onClick={() =>
                                triggerSyncMutation.mutate({
                                  connectionId: m.connectionId,
                                  variantId: m.variantId,
                                  storeId: selectedStoreId,
                                })
                              }
                            >
                              <IconRefresh className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() =>
                                deleteMappingMutation.mutate({
                                  mappingId: m.id,
                                  storeId: selectedStoreId,
                                })
                              }
                            >
                              <IconTrash className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <div>
            <h3 className="text-base font-semibold">
              ประวัติกิจกรรมการซิงค์สต็อก (Sync Logs)
            </h3>
            <p className="text-muted-foreground text-xs">
              บันทึกการตัด/อัปเดตสต็อกระหว่างระบบกับ Shopee, Lazada และ Facebook
            </p>
          </div>

          <div className="bg-card rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>วันเวลา</TableHead>
                  <TableHead>ช่องทาง</TableHead>
                  <TableHead>การกระทำ</TableHead>
                  <TableHead>จำนวนชิ้น</TableHead>
                  <TableHead>สถานะ</TableHead>
                  <TableHead>รายละเอียด / ข้อความ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLogsLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Spinner className="mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : !logsData?.data || logsData.data.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-24 text-center"
                    >
                      ยังไม่มีประวัติการซิงค์
                    </TableCell>
                  </TableRow>
                ) : (
                  logsData.data.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(
                          new Date(log.createdAt),
                          'dd MMM yyyy HH:mm:ss',
                          {
                            locale: th,
                          },
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.platform}</Badge>
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {log.action}
                      </TableCell>
                      <TableCell>{log.itemsCount} ชิ้น</TableCell>
                      <TableCell>
                        {log.status === 'SUCCESS' ? (
                          <Badge className="bg-emerald-600">สำเร็จ</Badge>
                        ) : (
                          <Badge variant="destructive">ล้มเหลว</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate text-xs">
                        {log.errorMessage ||
                          JSON.stringify(log.response || log.payload)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
      <Dialog
        open={Boolean(editingPlatform)}
        onOpenChange={(open) => !open && setEditingPlatform(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              ตั้งค่าการเชื่อมต่อ {editingPlatform?.name}
            </DialogTitle>
            <DialogDescription>
              กรอก API Credentials จากผู้ให้บริการ หรือเปิดโหมดจำลองเพื่อทดสอบ
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>ชื่อร้านค้าที่แสดง</Label>
              <Input
                value={formData.shopName}
                onChange={(e) =>
                  setFormData({ ...formData, shopName: e.target.value })
                }
                placeholder="เช่น My Official Store"
              />
            </div>
            <div className="space-y-1">
              <Label>{editingPlatform?.shopIdLabel}</Label>
              <Input
                value={formData.shopId}
                onChange={(e) =>
                  setFormData({ ...formData, shopId: e.target.value })
                }
                placeholder="ระบุรหัสร้านค้า"
              />
            </div>
            <div className="space-y-1">
              <Label>{editingPlatform?.appKeyLabel}</Label>
              <Input
                value={formData.appKey}
                onChange={(e) =>
                  setFormData({ ...formData, appKey: e.target.value })
                }
                placeholder="Partner / App Key"
              />
            </div>
            <div className="space-y-1">
              <Label>{editingPlatform?.appSecretLabel}</Label>
              <Input
                type="password"
                value={formData.appSecret}
                onChange={(e) =>
                  setFormData({ ...formData, appSecret: e.target.value })
                }
                placeholder="Partner / App Secret"
              />
            </div>
            {editingPlatform?.hasAccessToken && (
              <div className="space-y-1">
                <Label>Access Token (สำหรับเรียก API)</Label>
                <Input
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                  placeholder="Bearer / Access Token"
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>สาขาหลักที่ใช้ตัดสต็อก</Label>
              <Select
                value={formData.defaultBranchId}
                onValueChange={(val) =>
                  setFormData({ ...formData, defaultBranchId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="เลือกสาขาคลังสินค้าหลัก" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} {b.isMain ? '(สาขาหลัก)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  โหมดจำลอง (Simulator Mode)
                </Label>
                <p className="text-muted-foreground text-xs">
                  ทดสอบการตัดและซิงค์สต็อกโดยไม่ต้องรออนุมัติ API Key
                  จากแพลตฟอร์ม
                </p>
              </div>
              <Switch
                checked={formData.isSimulator}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isSimulator: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlatform(null)}>
              ยกเลิก
            </Button>
            <Button
              onClick={handleSaveConnection}
              disabled={saveConnectionMutation.isPending}
            >
              {saveConnectionMutation.isPending && <Spinner className="mr-2" />}
              บันทึกข้อมูล
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={Boolean(simulatingConnection)}
        onOpenChange={(open) => !open && setSimulatingConnection(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              ทดสอบจำลองคำสั่งซื้อจาก {simulatingConnection?.platform}
            </DialogTitle>
            <DialogDescription>
              จำลองว่ามีลูกค้าซื้อสินค้าบน {simulatingConnection?.platform}{' '}
              เพื่อดูว่าสต็อกในระบบถูกตัดอัตโนมัติจริง
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>รหัสสินค้า / SKU ที่ถูกสั่งซื้อ</Label>
              <Input
                value={simulateSku}
                onChange={(e) => setSimulateSku(e.target.value)}
                placeholder="เช่น SKU-001 หรือเลือกจากตารางด้านบน"
              />
            </div>
            <div className="space-y-1">
              <Label>จำนวนที่สั่งซื้อ (ชิ้น)</Label>
              <Input
                type="number"
                min={1}
                value={simulateQuantity}
                onChange={(e) =>
                  setSimulateQuantity(Number(e.target.value) || 1)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSimulatingConnection(null)}
            >
              ปิด
            </Button>
            <Button
              onClick={handleSimulateOrder}
              disabled={simulateOrderMutation.isPending || !simulateSku}
            >
              {simulateOrderMutation.isPending && <Spinner className="mr-2" />}
              ยิงคำสั่งซื้อจำลอง
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
