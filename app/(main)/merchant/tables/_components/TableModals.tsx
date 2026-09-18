'use client'

import { RestaurantTableItem, TableZoneWithCount } from '@/types/restaurant'

import { PrintTableCardModal } from './PrintTableCardModal'
import { TableDialog } from './TableDialog'
import { TableZoneDialog } from './TableZoneDialog'

interface TableModalsProps {
  isTableModalOpen: boolean
  onCloseTableModal: () => void
  onSaveTable: (data: {
    tableNumber: string
    seats: number
    zoneId?: string | null
  }) => Promise<void>
  isSavingTable: boolean
  editingTable: RestaurantTableItem | null
  zones: TableZoneWithCount[]
  defaultZoneId: string
  isZoneModalOpen: boolean
  onCloseZoneModal: () => void
  onSaveZone: (name: string) => Promise<void>
  isSavingZone: boolean
  printingTable: RestaurantTableItem | null
  onClosePrintModal: () => void
  storeName: string
  storeLogo?: string | null
  storeSlug?: string | null
  customDomain?: string | null
}

export function TableModals({
  isTableModalOpen,
  onCloseTableModal,
  onSaveTable,
  isSavingTable,
  editingTable,
  zones,
  defaultZoneId,
  isZoneModalOpen,
  onCloseZoneModal,
  onSaveZone,
  isSavingZone,
  printingTable,
  onClosePrintModal,
  storeName,
  storeLogo,
  storeSlug,
  customDomain,
}: TableModalsProps) {
  return (
    <>
      <TableDialog
        isOpen={isTableModalOpen}
        onClose={onCloseTableModal}
        onSave={onSaveTable}
        isSaving={isSavingTable}
        editingTable={editingTable}
        zones={zones}
        defaultZoneId={defaultZoneId}
      />

      <TableZoneDialog
        isOpen={isZoneModalOpen}
        onClose={onCloseZoneModal}
        onSave={onSaveZone}
        isSaving={isSavingZone}
      />

      <PrintTableCardModal
        isOpen={Boolean(printingTable)}
        onClose={onClosePrintModal}
        table={printingTable}
        storeName={storeName}
        storeLogo={storeLogo}
        storeSlug={storeSlug ?? undefined}
        customDomain={customDomain}
      />
    </>
  )
}
