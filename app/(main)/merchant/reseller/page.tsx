'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useAllResellerAgreements } from '@/actions/hooks/reseller'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useResellerSSE } from '@/hooks/use-reseller-sse'
import { useSession } from '@/hooks/use-session'
import { useAlertStore } from '@/stores/use-alert-store'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconBuildingStore, IconCoin, IconLock } from '@tabler/icons-react'
import { XIcon } from 'lucide-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { AffiliateManagementView } from './_components/AffiliateManagementView'
import { ResellerHeaderActions } from './_components/ResellerHeaderActions'
import { ResellerModals } from './_components/ResellerModals'
import { ResellerStockTable } from './_components/ResellerStockTable'
import { ResellerTabNavigation } from './_components/ResellerTabNavigation'
import { useResellerDialogs } from './_hooks/use-reseller-dialogs'

const ALERT_ID = 'reseller-info-alert'

export default function ResellerManagementPage() {
  const t = useTranslations('merchant.reseller')
  const isDismissed = useAlertStore((state) => state.isDismissed(ALERT_ID))
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

  const { user } = useSession()

  const isExternalReseller = Boolean(
    selectedAgreement?.resellerCustomerId &&
    selectedAgreement.resellerCustomerId === user?.id,
  )
  const isInternalReseller = Boolean(
    selectedAgreement?.resellerStoreId &&
    selectedAgreement.resellerStoreId === selectedStoreId,
  )
  const isReseller = isExternalReseller || isInternalReseller
  const isSupplier = Boolean(
    selectedAgreement &&
    selectedAgreement.supplierStoreId === selectedStoreId &&
    !isReseller,
  )

  const {
    canViewReseller,
    canCreateReseller,
    canUpdateReseller,
    canUpdateFinance,
    isPosReseller,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const {
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
  } = useResellerDialogs(selectedAgreementId)

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
          <ResellerHeaderActions
            mainTab={mainTab}
            selectedStoreId={selectedStoreId}
            selectedAgreementId={selectedAgreementId}
            canCreateReseller={canCreateReseller}
            isPosReseller={isPosReseller}
            isSupplier={isSupplier}
            canUpdateFinance={canUpdateFinance}
            onCreateAgreement={() => setCreateAgreementOpen(true)}
            onAllocateStock={() => handleOpenAllocate()}
            onRecordPayout={() => setPayoutDialogOpen(true)}
          />
        }
      />

      <ResellerTabNavigation tab={mainTab} onTabChange={setMainTab} />

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
                  onClick={() => dismissAlert(ALERT_ID)}
                >
                  <XIcon />
                  {t('closeAlert')}
                </Button>
              }
            />
          )}

          <ResellerStockTable
            isSupplier={isSupplier}
            isReseller={isReseller}
            onAcceptStock={handleOpenAccept}
            onReturnStock={handleOpenReturn}
            onEditPrice={handleOpenEditPrice}
          />

          <ResellerModals
            createAgreementOpen={createAgreementOpen}
            setCreateAgreementOpen={setCreateAgreementOpen}
            onAgreementCreated={(newId) => setSelectedAgreementId(newId)}
            allocateDialogOpen={allocateDialogOpen}
            setAllocateDialogOpen={setAllocateDialogOpen}
            acceptStockOpen={acceptStockOpen}
            setAcceptStockOpen={setAcceptStockOpen}
            selectedStock={selectedStock}
            isAccepting={isAccepting}
            onConfirmAccept={onConfirmAccept}
            returnStockOpen={returnStockOpen}
            setReturnStockOpen={setReturnStockOpen}
            selectedReturnStock={selectedReturnStock}
            editPriceOpen={editPriceOpen}
            setEditPriceOpen={setEditPriceOpen}
            selectedPriceStock={selectedPriceStock}
            isSavingPrice={isSavingPrice}
            onSaveCustomPrice={onSaveCustomPrice}
            payoutDialogOpen={payoutDialogOpen}
            setPayoutDialogOpen={setPayoutDialogOpen}
          />
        </div>
      )}
    </Sidebar>
  )
}
