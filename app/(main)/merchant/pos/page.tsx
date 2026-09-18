'use client'

import { useEffect, useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { useCartStore } from '@/app/sites/[domain]/cart/store'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCashRegister, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { PosHeaderFilters } from './_components/PosHeaderFilters'
import { PosMode, PosModeSwitcher } from './_components/PosModeSwitcher'
import { PosQuickCheckoutView } from './_components/PosQuickCheckoutView'
import { PosTableGrid } from './_components/PosTableGrid'
import { usePosCartAction } from './_hooks/use-pos-cart-action'
import { usePosMergedProducts } from './_hooks/use-pos-merged-products'

export default function MerchantPOSPage() {
  const t = useTranslations('merchant.pos')
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { selectedAgreementId } = useResellerFilter()

  const {
    canCreateOrder,
    isPosReseller,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const cartItems = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const removeItem = useCartStore((state) => state.removeItem)

  const [posMode, setPosMode] = useState<PosMode>('quick')

  useEffect(() => {
    clearCart()
  }, [selectedStoreId, selectedBranchId, selectedAgreementId, clearCart])

  const {
    search,
    setSearch,
    products,
    isProductsLoading,
    resellerAgreementId,
  } = usePosMergedProducts({
    selectedStoreId,
    selectedBranchId,
    selectedAgreementId,
    isPosReseller,
  })

  const { handleAddToCart } = usePosCartAction({
    cartItems,
    addItem,
    selectedBranchId,
  })

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCashRegister}
        title={t('title')}
        description={t('description')}
        endContent={<PosHeaderFilters />}
      />

      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : selectedBranchId === ALL_BRANCHES ? (
        <ActionRequiredAlert
          title={t('selectBranchTitle')}
          description={t('selectBranchDescription')}
        />
      ) : !isPermissionLoading && !canCreateOrder ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <div className="space-y-4">
          {/* <PosModeSwitcher mode={posMode} onModeChange={setPosMode} /> */}

          {posMode === 'tables' ? (
            <PosTableGrid
              storeId={selectedStoreId}
              branchId={selectedBranchId}
              onSelectTableForOrder={() => setPosMode('quick')}
            />
          ) : (
            <PosQuickCheckoutView
              products={products}
              cartItems={cartItems}
              isProductsLoading={isProductsLoading}
              search={search}
              onSearchChange={setSearch}
              onAddToCart={handleAddToCart}
              selectedStoreId={selectedStoreId}
              selectedBranchId={selectedBranchId}
              resellerAgreementId={resellerAgreementId}
              grandTotal={grandTotal}
              updateQuantity={updateQuantity}
              clearCart={clearCart}
              removeItem={removeItem}
            />
          )}
        </div>
      )}
    </Sidebar>
  )
}
