'use client'

import { useState } from 'react'

import {
  useAcceptResellerStock,
  useUpsertResellerCustomPrice,
} from '@/actions/hooks/reseller'
import { ResellerStockItem } from '@/types/reseller'

import { AcceptStockPayload } from '../_components/AcceptStockDialog'

export function useResellerDialogs(selectedAgreementId?: string) {
  const [acceptStockOpen, setAcceptStockOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<ResellerStockItem | null>(
    null,
  )

  const [returnStockOpen, setReturnStockOpen] = useState(false)
  const [selectedReturnStock, setSelectedReturnStock] =
    useState<ResellerStockItem | null>(null)

  const [editPriceOpen, setEditPriceOpen] = useState(false)
  const [selectedPriceStock, setSelectedPriceStock] =
    useState<ResellerStockItem | null>(null)

  const [createAgreementOpen, setCreateAgreementOpen] = useState(false)
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false)
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false)

  const { mutate: handleAcceptStock, isPending: isAccepting } =
    useAcceptResellerStock()
  const { mutate: handleUpsertCustomPrice, isPending: isSavingPrice } =
    useUpsertResellerCustomPrice()

  const handleOpenAccept = (stock: ResellerStockItem) => {
    setSelectedStock(stock)
    setAcceptStockOpen(true)
  }

  const handleOpenReturn = (stock: ResellerStockItem) => {
    setSelectedReturnStock(stock)
    setReturnStockOpen(true)
  }

  const handleOpenEditPrice = (stock: ResellerStockItem) => {
    setSelectedPriceStock(stock)
    setEditPriceOpen(true)
  }

  const handleOpenAllocate = (stock?: ResellerStockItem) => {
    if (stock) {
      setSelectedStock(stock)
    }
    setAllocateDialogOpen(true)
  }

  const onConfirmAccept = (payload: AcceptStockPayload) => {
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
    if (!selectedAgreementId) return

    handleUpsertCustomPrice(
      { agreementId: selectedAgreementId, variantId, customPrice },
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

  return {
    acceptStockOpen,
    setAcceptStockOpen,
    selectedStock,
    isAccepting,
    handleOpenAccept,
    onConfirmAccept,
    returnStockOpen,
    setReturnStockOpen,
    selectedReturnStock,
    handleOpenReturn,
    editPriceOpen,
    setEditPriceOpen,
    selectedPriceStock,
    isSavingPrice,
    handleOpenEditPrice,
    onSaveCustomPrice,
    createAgreementOpen,
    setCreateAgreementOpen,
    allocateDialogOpen,
    setAllocateDialogOpen,
    handleOpenAllocate,
    payoutDialogOpen,
    setPayoutDialogOpen,
  }
}
