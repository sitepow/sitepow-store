'use client'

import { ResellerStockItem } from '@/types/reseller'

import { AcceptStockDialog, AcceptStockPayload } from './AcceptStockDialog'
import { AllocateStockDialog } from './AllocateStockDialog'
import { CreateAgreementDialog } from './CreateAgreementDialog'
import { EditCustomPriceDialog } from './EditCustomPriceDialog'
import { PayoutDialog } from './PayoutDialog'
import { ReturnStockDialog } from './ReturnStockDialog'

interface ResellerModalsProps {
  createAgreementOpen: boolean
  setCreateAgreementOpen: (open: boolean) => void
  onAgreementCreated: (agreementId: string) => void
  allocateDialogOpen: boolean
  setAllocateDialogOpen: (open: boolean) => void
  acceptStockOpen: boolean
  setAcceptStockOpen: (open: boolean) => void
  selectedStock: ResellerStockItem | null
  isAccepting: boolean
  onConfirmAccept: (payload: AcceptStockPayload) => void
  returnStockOpen: boolean
  setReturnStockOpen: (open: boolean) => void
  selectedReturnStock: ResellerStockItem | null
  editPriceOpen: boolean
  setEditPriceOpen: (open: boolean) => void
  selectedPriceStock: ResellerStockItem | null
  isSavingPrice: boolean
  onSaveCustomPrice: (variantId: string, customPrice: number) => void
  payoutDialogOpen: boolean
  setPayoutDialogOpen: (open: boolean) => void
}

export function ResellerModals({
  createAgreementOpen,
  setCreateAgreementOpen,
  onAgreementCreated,
  allocateDialogOpen,
  setAllocateDialogOpen,
  acceptStockOpen,
  setAcceptStockOpen,
  selectedStock,
  isAccepting,
  onConfirmAccept,
  returnStockOpen,
  setReturnStockOpen,
  selectedReturnStock,
  editPriceOpen,
  setEditPriceOpen,
  selectedPriceStock,
  isSavingPrice,
  onSaveCustomPrice,
  payoutDialogOpen,
  setPayoutDialogOpen,
}: ResellerModalsProps) {
  return (
    <>
      <CreateAgreementDialog
        open={createAgreementOpen}
        setOpen={setCreateAgreementOpen}
        onSuccess={onAgreementCreated}
      />
      <AllocateStockDialog
        open={allocateDialogOpen}
        setOpen={setAllocateDialogOpen}
      />
      <AcceptStockDialog
        open={acceptStockOpen}
        onOpenChange={setAcceptStockOpen}
        onConfirm={onConfirmAccept}
        isLoading={isAccepting}
        stock={selectedStock}
      />
      <ReturnStockDialog
        open={returnStockOpen}
        setOpen={setReturnStockOpen}
        stock={selectedReturnStock}
      />
      <EditCustomPriceDialog
        open={editPriceOpen}
        setOpen={setEditPriceOpen}
        onSave={onSaveCustomPrice}
        isLoading={isSavingPrice}
        stock={selectedPriceStock}
      />
      <PayoutDialog open={payoutDialogOpen} setOpen={setPayoutDialogOpen} />
    </>
  )
}

