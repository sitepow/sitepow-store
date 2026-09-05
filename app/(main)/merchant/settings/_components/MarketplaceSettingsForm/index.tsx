'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

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
  IconCheck,
  IconLink,
  IconPlayerPlay,
  IconRefresh,
  IconShare,
  IconTrash,
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

const getPlatformsMetadata = (t: any) => [
  {
    platform: MarketplacePlatform.SHOPEE,
    name: 'Shopee',
    logoUrl: '/images/marketplaces/shopee.png',
    description: t('platforms.shopeeDesc'),
    appKeyLabel: 'Partner ID',
    appSecretLabel: 'Partner Key',
    shopIdLabel: 'Shop ID',
    hasAccessToken: true,
  },
  {
    platform: MarketplacePlatform.LAZADA,
    name: 'Lazada',
    logoUrl: '/images/marketplaces/lazada.png',
    description: t('platforms.lazadaDesc'),
    appKeyLabel: 'App Key',
    appSecretLabel: 'App Secret',
    shopIdLabel: 'Seller ID',
    hasAccessToken: true,
  },
  {
    platform: MarketplacePlatform.FACEBOOK,
    name: 'Facebook Marketplace',
    logoUrl: '/images/marketplaces/facebook.png',
    description: t('platforms.facebookDesc'),
    appKeyLabel: 'App ID (Optional)',
    appSecretLabel: 'App Secret (Optional)',
    shopIdLabel: 'Catalog ID',
    hasAccessToken: true,
  },
]

export function MarketplaceSettingsForm() {
  const t = useTranslations('merchant.settings.marketplace')
  const platformsMetadata = getPlatformsMetadata(t)
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
    setEditingPlatform(platformMeta)
    const existing = connections.find(
      (c) => c.platform === platformMeta.platform,
    )
    if (existing) {
      setFormData({
        shopId: existing.shopId || '',
        shopName: existing.shopName || '',
        appKey: existing.appKey || '',
        appSecret: existing.appSecret || '',
        accessToken: existing.accessToken || '',
        isSimulator: existing.isSimulator || false,
        defaultBranchId: existing.defaultBranchId || '',
      })
    } else {
      setFormData({
        shopId: '',
        shopName: '',
        appKey: '',
        appSecret: '',
        accessToken: '',
        isSimulator: false,
        defaultBranchId: '',
      })
    }
  }

  const handleSaveConnection = () => {
    if (!editingPlatform) return
    saveConnectionMutation.mutate(
      {
        storeId: selectedStoreId,
        data: {
          ...formData,
          platform: editingPlatform.platform,
        },
      },
      {
        onSuccess: () => setEditingPlatform(null),
      },
    )
  }

  const handleSimulateOrder = () => {
    if (!simulatingConnection || !simulateSku) return
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
        title={t('title')}
        description={t('description')}
      />
      <Tabs defaultValue="connections" className="space-y-6">
        <div className="w-full pb-1 sm:overflow-x-auto">
          <TabsList className="bg-background/80 flex h-auto w-full flex-col items-stretch gap-1 rounded-xl border p-1 shadow-sm sm:w-fit sm:flex-row sm:items-center sm:justify-start">
            <TabsTrigger
              value="connections"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex w-full items-center justify-center rounded-lg px-4 py-2 text-xs font-medium whitespace-nowrap transition-all sm:w-auto sm:py-1.5"
            >
              {t('tabs.connections')}
            </TabsTrigger>
            <TabsTrigger
              value="mappings"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex w-full items-center justify-center rounded-lg px-4 py-2 text-xs font-medium whitespace-nowrap transition-all sm:w-auto sm:py-1.5"
            >
              {t('tabs.mappings')}{' '}
              {mappings.length > 0 && `(${mappings.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="logs"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex w-full items-center justify-center rounded-lg px-4 py-2 text-xs font-medium whitespace-nowrap transition-all sm:w-auto sm:py-1.5"
            >
              {t('tabs.logs')}
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {platformsMetadata.map((meta) => {
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
                          <IconCheck className="mr-1 size-3" /> {t('connected')}
                        </Badge>
                      ) : (
                        <Badge variant="outline">{t('notConnected')}</Badge>
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
                            {t('shopName')}
                          </span>
                          <span className="font-medium">
                            {conn.shopName || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('shopId')}
                          </span>
                          <span className="font-medium">
                            {conn.shopId || '-'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            {t('linkedProducts')}
                          </span>
                          <span className="font-medium">
                            {conn._count?.mappings ?? 0} {t('itemsUnit')}
                          </span>
                        </div>
                        {conn.isSimulator && (
                          <div className="font-medium text-amber-600">
                            {t('simulatorMode')}
                          </div>
                        )}
                        <div className="flex items-center justify-between border-t pt-2">
                          <span>{t('autoSync')}</span>
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
                          ? t('configConnection')
                          : t('connectStore')}
                      </Button>
                      {isConnected && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            title={t('syncAllNow')}
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
                            title={t('simulatorOrder')}
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
              <h3 className="text-base font-semibold">{t('mappingTitle')}</h3>
              <p className="text-muted-foreground text-xs">
                {t('mappingDesc')}
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
                  {t('autoMapSku')}
                </Button>
              )}
            </div>
          </div>
          <div className="bg-card rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('mappingTable.product')}</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>{t('mappingTable.platform')}</TableHead>
                  <TableHead>Marketplace SKU</TableHead>
                  <TableHead className="text-center">
                    {t('mappingTable.currentStock')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('mappingTable.lastSyncedStock')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('mappingTable.actions')}
                  </TableHead>
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
                      {t('mappingTable.empty')}
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
                              title={t('mappingTable.syncItemNow')}
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
            <h3 className="text-base font-semibold">{t('logsTitle')}</h3>
            <p className="text-muted-foreground text-xs">{t('logsDesc')}</p>
          </div>

          <div className="bg-card rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('logsTable.dateTime')}</TableHead>
                  <TableHead>{t('logsTable.channel')}</TableHead>
                  <TableHead>{t('logsTable.action')}</TableHead>
                  <TableHead>{t('logsTable.quantity')}</TableHead>
                  <TableHead>{t('logsTable.status')}</TableHead>
                  <TableHead>{t('logsTable.details')}</TableHead>
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
                      {t('logsTable.empty')}
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
                      <TableCell>
                        {t('logsTable.pieces', { count: log.itemsCount })}
                      </TableCell>
                      <TableCell>
                        {log.status === 'SUCCESS' ? (
                          <Badge className="bg-emerald-600">
                            {t('logsTable.success')}
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            {t('logsTable.failed')}
                          </Badge>
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
              {t('dialog.title', { platform: editingPlatform?.name })}
            </DialogTitle>
            <DialogDescription>{t('dialog.description')}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>{t('dialog.shopNameLabel')}</Label>
              <Input
                value={formData.shopName}
                onChange={(e) =>
                  setFormData({ ...formData, shopName: e.target.value })
                }
                placeholder={t('dialog.shopNamePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <Label>{editingPlatform?.shopIdLabel}</Label>
              <Input
                value={formData.shopId}
                onChange={(e) =>
                  setFormData({ ...formData, shopId: e.target.value })
                }
                placeholder={t('dialog.shopIdPlaceholder')}
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
                <Label>{t('dialog.accessTokenLabel')}</Label>
                <Input
                  type="password"
                  value={formData.accessToken}
                  onChange={(e) =>
                    setFormData({ ...formData, accessToken: e.target.value })
                  }
                  placeholder={t('dialog.accessTokenPlaceholder')}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label>{t('dialog.defaultBranchLabel')}</Label>
              <Select
                value={formData.defaultBranchId}
                onValueChange={(val) =>
                  setFormData({ ...formData, defaultBranchId: val })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t('dialog.defaultBranchPlaceholder')}
                  />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name} {b.isMain ? t('dialog.mainBranchSuffix') : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="bg-muted/30 flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  {t('dialog.simulatorMode')}
                </Label>
                <p className="text-muted-foreground text-xs">
                  {t('dialog.simulatorModeDesc')}
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
              {t('dialog.cancel')}
            </Button>
            <Button
              onClick={handleSaveConnection}
              disabled={saveConnectionMutation.isPending}
            >
              {saveConnectionMutation.isPending && <Spinner className="mr-2" />}
              {t('dialog.save')}
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
              {t('simulateDialog.title', {
                platform: simulatingConnection?.platform,
              })}
            </DialogTitle>
            <DialogDescription>
              {t('simulateDialog.description', {
                platform: simulatingConnection?.platform,
              })}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>{t('simulateDialog.skuLabel')}</Label>
              <Input
                value={simulateSku}
                onChange={(e) => setSimulateSku(e.target.value)}
                placeholder={t('simulateDialog.skuPlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <Label>{t('simulateDialog.quantityLabel')}</Label>
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
              {t('simulateDialog.close')}
            </Button>
            <Button
              onClick={handleSimulateOrder}
              disabled={simulateOrderMutation.isPending || !simulateSku}
            >
              {simulateOrderMutation.isPending && <Spinner className="mr-2" />}
              {t('simulateDialog.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
