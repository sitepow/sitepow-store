'use client'

import { useState } from 'react'

import { useAcceptResellerStock } from '@/actions/hooks/reseller'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconBuildingStore,
  IconFilePlus,
  IconLock,
  IconPlus,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { ResellerAgreementSelectField } from '@/components/ResellerAgreementSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { AcceptStockDialog } from './_components/AcceptStockDialog'
import { AllocateStockDialog } from './_components/AllocateStockDialog'
import { CreateAgreementDialog } from './_components/CreateAgreementDialog'
import { PayoutDialog } from './_components/PayoutDialog'
import { ResellerStockTable } from './_components/ResellerStockTable'
import { ReturnStockDialog } from './_components/ReturnStockDialog'

export default function ResellerManagementPage() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedAgreementId, setSelectedAgreementId } = useResellerFilter()

  const [acceptStockOpen, setAcceptStockOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any | null>(null)

  const [returnStockOpen, setReturnStockOpen] = useState(false)
  const [selectedReturnStock, setSelectedReturnStock] = useState<any | null>(
    null,
  )

  const handleOpenAccept = (stock: any) => {
    setSelectedStock(stock)
    setAcceptStockOpen(true)
  }

  const handleOpenReturn = (stock: any) => {
    setSelectedReturnStock(stock)
    setReturnStockOpen(true)
  }

  const [createAgreementOpen, setCreateAgreementOpen] = useState(false)
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)

  const handleOpenAllocate = () => {
    setAllocateDialogOpen(true)
  }

  const handleOpenPayout = () => {
    setPayoutDialogOpen(true)
  }

  const { mutate: handleAcceptStock, isPending: isAccepting } =
    useAcceptResellerStock()

  const onConfirmAccept = (payload: any) => {
    handleAcceptStock(payload, {
      onSuccess: (res) => {
        if (res.success) {
          setAcceptStockOpen(false)
          setSelectedStock(null)
        }
      },
    })
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBuildingStore}
        title="จัดการตัวแทนฝากขาย"
        description="ติดตามสต็อกสินค้าฝากขาย คำนวณยอดขายสะสม และบันทึกการเคลียร์ยอด Payout"
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            <ResellerAgreementSelectField
              disabled={selectedStoreId === ALL_STORES}
            />
            <Button
              variant="outline"
              onClick={() => setCreateAgreementOpen(true)}
              disabled={selectedStoreId === ALL_STORES}
            >
              <IconFilePlus className="size-4" />
              สร้างสัญญาใหม่
            </Button>
            <Button
              variant="outline"
              onClick={handleOpenPayout}
              disabled={!selectedAgreementId}
            >
              บันทึกการเบิกจ่าย (Payout)
            </Button>
            <Button
              onClick={handleOpenAllocate}
              disabled={!selectedAgreementId}
            >
              <IconPlus className="size-4" />
              เพิ่มสต็อกฝากขาย
            </Button>
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="กรุณาเลือกร้านค้า"
          description="โปรดเลือกร้านค้าที่ต้องการจัดการข้อมูลตัวแทนฝากขาย"
        />
      ) : (
        <div className="space-y-4">
          <ResellerStockTable
            onAcceptStock={handleOpenAccept}
            onReturnStock={handleOpenReturn}
          />
          <CreateAgreementDialog
            open={createAgreementOpen}
            setOpen={setCreateAgreementOpen}
            onSuccess={(newAgreementId) =>
              setSelectedAgreementId(newAgreementId)
            }
          />
          <AllocateStockDialog
            open={allocateDialogOpen}
            setOpen={setAllocateDialogOpen}
          />
          <PayoutDialog open={payoutDialogOpen} setOpen={setPayoutDialogOpen} />
        </div>
      )}
      <AcceptStockDialog
        open={acceptStockOpen}
        onOpenChange={(open) => {
          setAcceptStockOpen(open)
          if (!open) setSelectedStock(null)
        }}
        stock={selectedStock}
        isLoading={isAccepting}
        onConfirm={onConfirmAccept}
      />
      <ReturnStockDialog
        stock={selectedReturnStock}
        open={returnStockOpen}
        setOpen={setReturnStockOpen}
      />
    </Sidebar>
  )
}
