'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import {
  useAcceptResellerStock,
  useAllResellerAgreements,
  useUpsertResellerCustomPrice,
} from '@/actions/hooks/reseller'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useResellerSSE } from '@/hooks/use-reseller-sse'
import { useAlertStore } from '@/stores/use-alert-store'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconBuildingStore,
  IconCoin,
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
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AcceptStockDialog } from './_components/AcceptStockDialog'
import { AffiliateManagementView } from './_components/AffiliateManagementView'
import { AllocateStockDialog } from './_components/AllocateStockDialog'
import { CreateAgreementDialog } from './_components/CreateAgreementDialog'
import { EditCustomPriceDialog } from './_components/EditCustomPriceDialog'
import { PayoutDialog } from './_components/PayoutDialog'
import { ResellerStockTable } from './_components/ResellerStockTable'
import { ReturnStockDialog } from './_components/ReturnStockDialog'

export default function ResellerManagementPage() {
  const t = useTranslations('merchant.reseller')
  const alertId = 'reseller-info-alert'
  const isDismissed = useAlertStore((state) => state.isDismissed(alertId))
  const dismissAlert = useAlertStore((state) => state.dismissAlert)

  const [mainTab, setMainTab] = useState<'consignment' | 'affiliate'>(
    'consignment',
  )

  const { selectedStoreId } = useStoreFilter()
  const { selectedAgreementId, setSelectedAgreementId } = useResellerFilter()

  const storeId = selectedStoreId !== ALL_STORES ? selectedStoreId : undefined
  useResellerSSE(storeId)

  const { data: response } = useAllResellerAgreements(storeId!)

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

  const handleOpenAllocate = (stock?: any) => {
    if (stock) {
      setSelectedStock(stock)
    }
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
        icon={mainTab === 'consignment' ? IconBuildingStore : IconCoin}
        title={mainTab === 'consignment' ? t('title') : t('affiliate.title')}
        description={
          mainTab === 'consignment'
            ? t('description')
            : t('affiliate.description')
        }
        endContent={
          <div className="flex flex-wrap items-end gap-2.5">
            <StoreSelectField />
            {mainTab === 'consignment' && (
              <>
                <ResellerAgreementSelectField
                  mode="all"
                  disabled={selectedStoreId === ALL_STORES}
                />
                {canCreateReseller && (
                  <Button
                    variant="outline"
                    onClick={() => setCreateAgreementOpen(true)}
                    disabled={selectedStoreId === ALL_STORES}
                  >
                    <IconFilePlus />
                    {t('newAgreement')}
                  </Button>
                )}
                {canCreateReseller && isSupplier && (
                  <Button
                    onClick={() => handleOpenAllocate()}
                    disabled={!selectedAgreementId}
                  >
                    <IconPlus />
                    {t('allocateStock')}
                  </Button>
                )}
                {canUpdateFinance && isSupplier && (
                  <Button
                    variant="outline"
                    onClick={handleOpenPayout}
                    disabled={!selectedAgreementId}
                  >
                    <IconReceiptRefund />
                    {t('recordPayout')}
                  </Button>
                )}
              </>
            )}
          </div>
        }
      />

      {/* TAB SELECTOR: CONSIGNMENT VS AFFILIATE */}
      <div className="mb-4">
        <Tabs
          value={mainTab}
          onValueChange={(val) =>
            setMainTab(val as 'consignment' | 'affiliate')
          }
          className="w-full"
        >
          <TabsList className="bg-muted/70 grid w-full max-w-md grid-cols-2">
            <TabsTrigger
              value="consignment"
              className="gap-2 text-xs font-bold sm:text-sm"
            >
              <IconBuildingStore className="size-4" />
              {t('tabs.consignment')}
            </TabsTrigger>
            <TabsTrigger
              value="affiliate"
              className="gap-2 text-xs font-bold sm:text-sm"
            >
              <IconCoin className="size-4" />
              {t('tabs.affiliate')}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('selectStoreTitle')}
          description={t('selectStoreDesc')}
        />
      ) : !isPermissionLoading && !canViewReseller ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : mainTab === 'affiliate' ? (
        <AffiliateManagementView storeId={selectedStoreId} />
      ) : (
        <div className="space-y-4">
          {!isDismissed && canUpdateReseller && (
            <ActionRequiredAlert
              variant="info"
              title={t('infoAlertTitle')}
              description={t('infoAlertDesc')}
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => dismissAlert(alertId)}
                >
                  <XIcon />
                  {t('closeAlert')}
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
        </div>
      )}
    </Sidebar>
  )
}
