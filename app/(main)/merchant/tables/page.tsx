'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useCreateRestaurantTable,
  useCreateTableZone,
  useDeleteRestaurantTable,
  useRegenerateTableQRToken,
  useRestaurantTables,
  useTableZones,
  useUpdateRestaurantTable,
} from '@/actions/hooks/restaurant/table'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useCurrentStore } from '@/hooks/use-current-store'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { RestaurantTableItem } from '@/types/restaurant'
import { IconArmchair } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { TableCard } from './_components/TableCard'
import { TableEmptyState } from './_components/TableEmptyState'
import { TableHeaderActions } from './_components/TableHeaderActions'
import { TableModals } from './_components/TableModals'
import { TableZoneFilter } from './_components/TableZoneFilter'

export default function MerchantTablesPage() {
  const t = useTranslations('merchant.tables')
  const { currentStore, store } = useCurrentStore()
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const [selectedZoneId, setSelectedZoneId] = useState<string>('ALL')
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false)
  const [editingTable, setEditingTable] = useState<RestaurantTableItem | null>(
    null,
  )
  const [printingTable, setPrintingTable] =
    useState<RestaurantTableItem | null>(null)

  const { data: tables = [], isLoading: isTablesLoading } = useRestaurantTables(
    {
      storeId: selectedStoreId,
      branchId: selectedBranchId,
    },
  )
  const { data: zones = [], isLoading: isZonesLoading } = useTableZones({
    storeId: selectedStoreId,
    branchId: selectedBranchId,
  })

  const createTableMutation = useCreateRestaurantTable()
  const updateTableMutation = useUpdateRestaurantTable()
  const deleteTableMutation = useDeleteRestaurantTable()
  const regenerateQRMutation = useRegenerateTableQRToken()
  const createZoneMutation = useCreateTableZone()

  const isLoading = isTablesLoading || isZonesLoading

  const filteredTables = useMemo(() => {
    if (selectedZoneId === 'ALL') return tables
    if (selectedZoneId === 'NO_ZONE') return tables.filter((t) => !t.zoneId)
    return tables.filter((t) => t.zoneId === selectedZoneId)
  }, [tables, selectedZoneId])

  const handleOpenCreateTable = () => {
    if (selectedBranchId === ALL_BRANCHES) {
      toast.error(t('validation.selectBranchBeforeTable'))
      return
    }
    setEditingTable(null)
    setIsTableModalOpen(true)
  }

  const handleOpenEditTable = (table: RestaurantTableItem) => {
    setEditingTable(table)
    setIsTableModalOpen(true)
  }

  const handleSaveTable = async (data: {
    tableNumber: string
    seats: number
    zoneId?: string | null
  }) => {
    if (editingTable) {
      const res = await updateTableMutation.mutateAsync({
        id: editingTable.id,
        tableNumber: data.tableNumber,
        seats: data.seats,
        zoneId: data.zoneId ?? null,
      })
      if (res.success) {
        toast.success(t('dialogs.save'))
        setIsTableModalOpen(false)
      } else {
        toast.error(t('dialogs.cancel'))
      }
      return
    }

    const res = await createTableMutation.mutateAsync({
      storeId: selectedStoreId,
      branchId: selectedBranchId,
      tableNumber: data.tableNumber,
      seats: data.seats,
      zoneId: data.zoneId ?? undefined,
    })
    if (res.success) {
      toast.success(t('dialogs.save'))
      setIsTableModalOpen(false)
    } else {
      toast.error(t('dialogs.cancel'))
    }
  }

  const handleDeleteTable = async (id: string, tableNumber: string) => {
    if (!confirm(t('confirm.deleteTable', { num: tableNumber }))) return
    const res = await deleteTableMutation.mutateAsync({ id })
    if (res.success) toast.success(t('actions.delete'))
    else toast.error(t('dialogs.cancel'))
  }

  const handleRegenerateQR = async (id: string, tableNumber: string) => {
    if (!confirm(t('confirm.regenerateQR', { num: tableNumber }))) return
    const res = await regenerateQRMutation.mutateAsync({ id })
    if (res.success) toast.success(t('actions.regenerate'))
    else toast.error(t('dialogs.cancel'))
  }

  const handleSaveZone = async (name: string) => {
    if (selectedBranchId === ALL_BRANCHES) {
      toast.error(t('validation.selectBranchBeforeZone'))
      return
    }
    const res = await createZoneMutation.mutateAsync({
      storeId: selectedStoreId,
      branchId: selectedBranchId,
      name,
    })
    if (res.success) {
      toast.success(t('dialogs.save'))
      setIsZoneModalOpen(false)
    } else {
      toast.error(t('dialogs.cancel'))
    }
  }

  const isSavingTable =
    createTableMutation.isPending || updateTableMutation.isPending

  const customDomain =
    (currentStore as { customDomain?: string | null } | null)?.customDomain ??
    (store as { customDomain?: string | null } | null)?.customDomain ??
    null

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconArmchair}
        title={t('title')}
        description={t('description')}
        endContent={
          <TableHeaderActions
            onAddZone={() => setIsZoneModalOpen(true)}
            onAddTable={handleOpenCreateTable}
          />
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
          <TableZoneFilter
            zones={zones}
            selectedZoneId={selectedZoneId}
            onSelectZone={setSelectedZoneId}
            totalTablesCount={tables.length}
            noZoneCount={tables.filter((t) => !t.zoneId).length}
          />

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
            <TableEmptyState onAddTable={handleOpenCreateTable} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredTables.map((table) => (
                <TableCard
                  key={table.id}
                  table={table}
                  onPrint={setPrintingTable}
                  onEdit={handleOpenEditTable}
                  onDelete={handleDeleteTable}
                  onRegenerateQR={handleRegenerateQR}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <TableModals
        isTableModalOpen={isTableModalOpen}
        onCloseTableModal={() => setIsTableModalOpen(false)}
        onSaveTable={handleSaveTable}
        isSavingTable={isSavingTable}
        editingTable={editingTable}
        zones={zones}
        defaultZoneId={selectedZoneId}
        isZoneModalOpen={isZoneModalOpen}
        onCloseZoneModal={() => setIsZoneModalOpen(false)}
        onSaveZone={handleSaveZone}
        isSavingZone={createZoneMutation.isPending}
        printingTable={printingTable}
        onClosePrintModal={() => setPrintingTable(null)}
        storeName={currentStore?.name ?? store?.name ?? 'SitePow Store'}
        storeLogo={currentStore?.logo ?? store?.logo}
        storeSlug={currentStore?.slug ?? store?.slug}
        customDomain={customDomain}
      />
    </Sidebar>
  )
}
