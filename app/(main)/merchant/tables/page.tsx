'use client'

import { useEffect, useState, useTransition } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  createRestaurantTable,
  createTableZone,
  deleteRestaurantTable,
  deleteTableZone,
  getRestaurantTables,
  getTableZones,
  regenerateTableQRToken,
  updateRestaurantTable,
} from '@/actions/restaurant/table'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { TableStatus } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconArmchair,
  IconClock,
  IconDotsVertical,
  IconEdit,
  IconPlus,
  IconPrinter,
  IconRefresh,
  IconTrash,
  IconUsers,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { PrintTableCardModal } from './_components/PrintTableCardModal'

export default function MerchantTablesPage() {
  const t = useTranslations('merchant.tables')
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { currentStore, store } = useCurrentStore()

  const [zones, setZones] = useState<any[]>([])
  const [tables, setTables] = useState<any[]>([])
  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL')
  const [isLoading, setIsLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Print modal state
  const [printingTable, setPrintingTable] = useState<any | null>(null)

  // Dialogs
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<any | null>(null)
  const [tableNumber, setTableNumber] = useState('')
  const [seats, setSeats] = useState(4)
  const [targetZoneId, setTargetZoneId] = useState<string>('NONE')

  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
  const [zoneName, setZoneName] = useState('')

  const loadData = async () => {
    if (!selectedStoreId || selectedStoreId === ALL_STORES) return
    setIsLoading(true)
    try {
      const [zonesRes, tablesRes] = await Promise.all([
        getTableZones({
          storeId: selectedStoreId,
          branchId:
            selectedBranchId !== ALL_BRANCHES ? selectedBranchId : undefined,
        }),
        getRestaurantTables({
          storeId: selectedStoreId,
          branchId:
            selectedBranchId !== ALL_BRANCHES ? selectedBranchId : undefined,
        }),
      ])

      if (zonesRes.success) setZones(zonesRes.data || [])
      if (tablesRes.success) setTables(tablesRes.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [selectedStoreId, selectedBranchId])

  const filteredTables =
    selectedZoneId === 'ALL'
      ? tables
      : selectedZoneId === 'NO_ZONE'
        ? tables.filter((t) => !t.zoneId)
        : tables.filter((t) => t.zoneId === selectedZoneId)

  // Handlers for Zone
  const handleSaveZone = () => {
    if (!zoneName.trim()) {
      toast.error(t('validation.requireZoneName'))
      return
    }
    if (selectedBranchId === ALL_BRANCHES) {
      toast.error(t('validation.selectBranchBeforeZone'))
      return
    }

    startTransition(async () => {
      const res = await createTableZone({
        storeId: selectedStoreId,
        branchId: selectedBranchId,
        name: zoneName.trim(),
      })
      if (res.success) {
        toast.success(t('dialogs.save'))
        setZoneName('')
        setIsZoneModalOpen(false)
        loadData()
      } else {
        toast.error(t('dialogs.cancel'))
      }
    })
  }

  const handleDeleteZone = (id: string, name: string) => {
    if (!confirm(t('confirm.deleteZone', { name }))) return
    startTransition(async () => {
      const res = await deleteTableZone({ id })
      if (res.success) {
        toast.success(t('actions.delete'))
        if (selectedZoneId === id) setSelectedZoneId('ALL')
        loadData()
      } else {
        toast.error(t('dialogs.cancel'))
      }
    })
  }

  // Handlers for Table
  const openCreateTable = () => {
    setEditingTable(null)
    setTableNumber('')
    setSeats(4)
    setTargetZoneId(
      selectedZoneId !== 'ALL' && selectedZoneId !== 'NO_ZONE'
        ? selectedZoneId
        : 'NONE',
    )
    setIsTableModalOpen(true)
  }

  const openEditTable = (table: any) => {
    setEditingTable(table)
    setTableNumber(table.tableNumber)
    setSeats(table.seats)
    setTargetZoneId(table.zoneId || 'NONE')
    setIsTableModalOpen(true)
  }

  const handleSaveTable = () => {
    if (!tableNumber.trim()) {
      toast.error(t('validation.requireTableNumber'))
      return
    }
    if (selectedBranchId === ALL_BRANCHES) {
      toast.error(t('validation.selectBranchBeforeTable'))
      return
    }

    startTransition(async () => {
      if (editingTable) {
        const res = await updateRestaurantTable({
          id: editingTable.id,
          tableNumber: tableNumber.trim(),
          seats: Number(seats),
          zoneId: targetZoneId === 'NONE' ? null : targetZoneId,
        })
        if (res.success) {
          toast.success(t('dialogs.save'))
          setIsTableModalOpen(false)
          loadData()
        } else {
          toast.error(t('dialogs.cancel'))
        }
      } else {
        const res = await createRestaurantTable({
          storeId: selectedStoreId,
          branchId: selectedBranchId,
          zoneId: targetZoneId === 'NONE' ? undefined : targetZoneId,
          tableNumber: tableNumber.trim(),
          seats: Number(seats),
        })
        if (res.success) {
          toast.success(t('dialogs.save'))
          setIsTableModalOpen(false)
          loadData()
        } else {
          toast.error(t('dialogs.cancel'))
        }
      }
    })
  }

  const handleDeleteTable = (id: string, num: string) => {
    if (!confirm(t('confirm.deleteTable', { num }))) return
    startTransition(async () => {
      const res = await deleteRestaurantTable({ id })
      if (res.success) {
        toast.success(t('actions.delete'))
        loadData()
      } else {
        toast.error(t('dialogs.cancel'))
      }
    })
  }

  const handleRegenerateQR = (id: string, num: string) => {
    if (!confirm(t('confirm.regenerateQR', { num }))) return
    startTransition(async () => {
      const res = await regenerateTableQRToken({ id })
      if (res.success) {
        toast.success(t('actions.regenerate'))
        loadData()
      } else {
        toast.error(t('dialogs.cancel'))
      }
    })
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconArmchair}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-2">
            <StoreSelectField />
            <BranchSelectField />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsZoneModalOpen(true)}
            >
              <IconPlus className="mr-2 size-4" />
              {t('addZone')}
            </Button>
            <Button size="sm" onClick={openCreateTable}>
              <IconPlus className="mr-2 size-4" />
              {t('addTable')}
            </Button>
          </div>
        }
      />

      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : selectedBranchId === ALL_BRANCHES ? (
        <ActionRequiredAlert
          title={t('selectBranchTitle')}
          description={t('selectBranchDescription')}
        />
      ) : (
        <div className="space-y-4">
          {/* Zone Filter Tabs - Default shadcn/ui Tabs */}
          <Tabs
            value={selectedZoneId}
            onValueChange={setSelectedZoneId}
            className="w-full"
          >
            <TabsList className="h-auto flex-wrap p-1">
              <TabsTrigger value="ALL">
                {t('filterAll', { count: tables.length })}
              </TabsTrigger>
              {zones.map((zone) => (
                <TabsTrigger key={zone.id} value={zone.id}>
                  {zone.name} ({zone._count?.tables ?? 0})
                </TabsTrigger>
              ))}
              {tables.some((t) => !t.zoneId) && (
                <TabsTrigger value="NO_ZONE">
                  {t('filterNoZone', {
                    count: tables.filter((t) => !t.zoneId).length,
                  })}
                </TabsTrigger>
              )}
            </TabsList>
          </Tabs>

          {/* Tables Grid - Default shadcn/ui Cards */}
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-muted h-44 animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : filteredTables.length === 0 ? (
            <Card className="py-12 text-center">
              <CardContent className="space-y-3">
                <IconArmchair className="text-muted-foreground mx-auto size-12 opacity-50" />
                <CardTitle>{t('emptyTitle')}</CardTitle>
                <CardDescription>{t('emptyDescription')}</CardDescription>
                <Button size="sm" onClick={openCreateTable} className="mt-2">
                  <IconPlus className="mr-2 size-4" />
                  {t('addTable')}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredTables.map((table) => {
                const isOccupied = table.status === TableStatus.OCCUPIED
                const isBillReq = table.status === TableStatus.BILL_REQUESTED

                return (
                  <Card
                    key={table.id}
                    className="flex flex-col justify-between"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-base font-semibold">
                            {t('tablePrefix')} {table.tableNumber}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {table.zone?.name
                              ? t('zonePrefix', { zone: table.zone.name })
                              : t('noZone')}
                          </CardDescription>
                        </div>
                        <Badge
                          variant={
                            isBillReq
                              ? 'destructive'
                              : isOccupied
                                ? 'default'
                                : 'outline'
                          }
                        >
                          {isBillReq
                            ? t('status.billRequested')
                            : isOccupied
                              ? t('status.occupied')
                              : t('status.available')}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="text-muted-foreground space-y-2 pb-4 text-sm">
                      <div className="flex items-center gap-4 text-xs">
                        <span className="flex items-center gap-1.5">
                          <IconUsers className="size-4" />
                          {t('seats', { count: table.seats })}
                        </span>
                        {isOccupied && table.sessions?.[0] && (
                          <span className="text-foreground flex items-center gap-1.5 font-medium">
                            <IconClock className="size-4" />
                            {t('orders', {
                              count: table.sessions[0].orders?.length ?? 0,
                            })}
                          </span>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex items-center justify-between gap-2 border-t pt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPrintingTable(table)}
                      >
                        <IconPrinter className="mr-2 size-4" />
                        {t('actions.print')}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                          >
                            <IconDotsVertical className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              handleRegenerateQR(table.id, table.tableNumber)
                            }
                          >
                            <IconRefresh className="mr-2 size-4" />
                            {t('actions.regenerate')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditTable(table)}
                          >
                            <IconEdit className="mr-2 size-4" />
                            {t('actions.edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() =>
                              handleDeleteTable(table.id, table.tableNumber)
                            }
                          >
                            <IconTrash className="mr-2 size-4" />
                            {t('actions.delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add/Edit Table - Default shadcn/ui Dialog */}
      <Dialog open={isTableModalOpen} onOpenChange={setIsTableModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingTable
                ? t('dialogs.editTableTitle')
                : t('dialogs.addTableTitle')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="tableNumber">
                {t('dialogs.tableNumberLabel')}
              </Label>
              <Input
                id="tableNumber"
                placeholder={t('dialogs.tableNumberPlaceholder')}
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="seats">{t('dialogs.seatsLabel')}</Label>
              <Input
                id="seats"
                type="number"
                min={1}
                max={50}
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('dialogs.zoneLabel')}</Label>
              <Select value={targetZoneId} onValueChange={setTargetZoneId}>
                <SelectTrigger>
                  <SelectValue placeholder={t('dialogs.zonePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">
                    {t('dialogs.noZoneOption')}
                  </SelectItem>
                  {zones.map((z) => (
                    <SelectItem key={z.id} value={z.id}>
                      {z.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsTableModalOpen(false)}
            >
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={handleSaveTable} disabled={isPending}>
              {isPending ? t('dialogs.saving') : t('dialogs.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Add Zone - Default shadcn/ui Dialog */}
      <Dialog open={isZoneModalOpen} onOpenChange={setIsZoneModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('dialogs.addZoneTitle')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="zoneName">{t('dialogs.zoneNameLabel')}</Label>
              <Input
                id="zoneName"
                placeholder={t('dialogs.zoneNamePlaceholder')}
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsZoneModalOpen(false)}>
              {t('dialogs.cancel')}
            </Button>
            <Button onClick={handleSaveZone} disabled={isPending}>
              {isPending ? t('dialogs.saving') : t('dialogs.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Printable QR Card */}
      <PrintTableCardModal
        isOpen={!!printingTable}
        onClose={() => setPrintingTable(null)}
        table={printingTable}
        storeName={currentStore?.name ?? store?.name ?? 'SitePow Store'}
        storeLogo={currentStore?.logo ?? store?.logo}
        storeSlug={currentStore?.slug ?? store?.slug}
        customDomain={
          (currentStore as any)?.customDomain ?? (store as any)?.customDomain
        }
      />
    </Sidebar>
  )
}
