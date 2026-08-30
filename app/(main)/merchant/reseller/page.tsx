'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/hooks/employee'
import {
  useAcceptResellerStock,
  useResellerAgreements,
  useUpsertResellerCustomPrice,
} from '@/actions/hooks/reseller'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useResellerSSE } from '@/hooks/use-reseller-sse'
import { useAlertStore } from '@/stores/use-alert-store'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconBuildingStore,
  IconFilePlus,
  IconLock,
  IconPlus,
  IconReceiptRefund,
} from '@tabler/icons-react'
import { XIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { ResellerAgreementSelectField } from '@/components/ResellerAgreementSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { AcceptStockDialog } from './_components/AcceptStockDialog'
import { AllocateStockDialog } from './_components/AllocateStockDialog'
import { CreateAgreementDialog } from './_components/CreateAgreementDialog'
import { EditCustomPriceDialog } from './_components/EditCustomPriceDialog'
import { PayoutDialog } from './_components/PayoutDialog'
import { ResellerStockTable } from './_components/ResellerStockTable'
import { ReturnStockDialog } from './_components/ReturnStockDialog'

export default function ResellerManagementPage() {
  const alertId = 'reseller-info-alert'
  const isDismissed = useAlertStore((state) => state.isDismissed(alertId))
  const dismissAlert = useAlertStore((state) => state.dismissAlert)

  const { selectedStoreId } = useStoreFilter()
  const { selectedAgreementId, setSelectedAgreementId } = useResellerFilter()

  const storeId = selectedStoreId !== ALL_STORES ? selectedStoreId : undefined
  useResellerSSE(storeId)

  const { data: response } = useResellerAgreements(storeId!)

  const agreements = response?.data || []
  const selectedAgreement = agreements.find((a) => a.id === selectedAgreementId)

  const isSupplier = Boolean(
    selectedAgreement && selectedAgreement.supplierStoreId === selectedStoreId,
  )

  const {
    canViewReseller,
    canCreateReseller,
    canUpdateReseller,
    canUpdateFinance,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const [acceptStockOpen, setAcceptStockOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<any | null>(null)

  const [returnStockOpen, setReturnStockOpen] = useState(false)
  const [selectedReturnStock, setSelectedReturnStock] = useState<any | null>(
    null,
  )

  const [editPriceOpen, setEditPriceOpen] = useState(false)
  const [selectedPriceStock, setSelectedPriceStock] = useState<any | null>(null)

  const handleOpenAccept = (stock: any) => {
    setSelectedStock(stock)
    setAcceptStockOpen(true)
  }

  const handleOpenReturn = (stock: any) => {
    setSelectedReturnStock(stock)
    setReturnStockOpen(true)
  }

  const handleOpenEditPrice = (stock: any) => {
    setSelectedPriceStock(stock)
    setEditPriceOpen(true)
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

  const { mutate: handleUpsertCustomPrice, isPending: isSavingPrice } =
    useUpsertResellerCustomPrice()

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

  const onSaveCustomPrice = (variantId: string, customPrice: number) => {
    if (!selectedAgreementId) {
      return
    }

    handleUpsertCustomPrice(
      {
        agreementId: selectedAgreementId,
        variantId,
        customPrice,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            setEditPriceOpen(false)
            setSelectedPriceStock(null)
          }
        },
      },
    )
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBuildingStore}
        title="จัดการตัวแทนจำหน่าย"
        description="ติดตามสต็อกสินค้าฝากขาย คำนวณยอดขายสะสม และบันทึกการเคลียร์ยอด Payout"
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            <ResellerAgreementSelectField
              disabled={selectedStoreId === ALL_STORES}
            />
            {canCreateReseller && (
              <Button
                variant="outline"
                onClick={() => setCreateAgreementOpen(true)}
                disabled={selectedStoreId === ALL_STORES}
              >
                <IconFilePlus />
                สร้างสัญญาใหม่
              </Button>
            )}
            {canCreateReseller && isSupplier && (
              <Button
                onClick={handleOpenAllocate}
                disabled={!selectedAgreementId}
              >
                <IconPlus />
                เพิ่มสต็อกฝากขาย
              </Button>
            )}
            {canUpdateFinance && isSupplier && (
              <Button
                variant="outline"
                onClick={handleOpenPayout}
                disabled={!selectedAgreementId}
              >
                <IconReceiptRefund />
                บันทึกการเบิกจ่าย
              </Button>
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="กรุณาเลือกร้านค้า"
          description="โปรดเลือกร้านค้าที่ต้องการจัดการข้อมูลตัวแทนจำหน่าย"
        />
      ) : !isPermissionLoading && !canViewReseller ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลตัวแทนจำหน่ายของร้านค้านี้"
        />
      ) : (
        <div className="space-y-4">
          {!isDismissed && canUpdateReseller && (
            <ActionRequiredAlert
              variant="info"
              title="สิทธิ์และการจัดการพนักงานสำหรับตัวแทน"
              description="เมื่อทำสัญญาเรียบร้อยแล้ว ระบบจะเพิ่มตัวแทนรายนี้เข้าเป็นพนักงานในทีมโดยอัตโนมัติ (ไม่ว่าจะเป็นบัญชีส่วนตัวหรือร้านค้า) พร้อมมอบสิทธิ์การขายและตัดสต็อกสินค้าในหน้าแคชเชียร์ เพื่อส่งยอดขายคืนให้กับร้านค้า"
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dismissAlert(alertId)}
                >
                  <XIcon />
                  ปิดหน้าต่าง
                </Button>
              }
            />
          )}
          <ResellerStockTable
            onAcceptStock={handleOpenAccept}
            onReturnStock={handleOpenReturn}
            onEditPrice={handleOpenEditPrice}
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
      <EditCustomPriceDialog
        open={editPriceOpen}
        setOpen={(open) => {
          setEditPriceOpen(open)
          if (!open) setSelectedPriceStock(null)
        }}
        stock={selectedPriceStock}
        isLoading={isSavingPrice}
        onSave={onSaveCustomPrice}
        defaultCommissionRate={selectedPriceStock?.defaultCommissionRate || 0}
      />
    </Sidebar>
  )
}
