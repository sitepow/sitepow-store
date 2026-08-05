'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { usePOSProducts } from '@/actions/hooks/pos/product'
import { POSProductItem } from '@/actions/pos/product'
import { useCartStore } from '@/app/sites/[domain]/cart/store'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCashRegister, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { PosCart } from './_components/PosCart'
import { PosProductList } from './_components/PosProductList'
import {
  SelectedAddonPayload,
  SelectedOptionPayload,
} from './_components/PosProductOptionDialog'

export default function MerchantPOSPage() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const { canCreateOrder, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const cartItems = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const removeItem = useCartStore((state) => state.removeItem)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)

  const { data: products = [], isLoading: isProductsLoading } = usePOSProducts({
    storeId: selectedStoreId,
    branchId: selectedBranchId,
    search: debouncedSearch,
  })

  const handleAddToCart = (
    product: POSProductItem,
    variantId: string,
    options?: SelectedOptionPayload[],
    addons?: SelectedAddonPayload[],
    quantity: number = 1,
  ) => {
    if (!selectedBranchId) {
      return
    }

    const variant = product.variants.find((v) => v.id === variantId)
    if (!variant) {
      return
    }

    const unitPrice = Number(variant.price)
    const currentBranchStock = variant.stocks.find(
      (s) => s.branchId === selectedBranchId,
    )

    const formattedOptions = (options ?? []).map((opt) => {
      const optionGroup = product.options?.find(
        (o) => o.title === opt.groupTitle,
      )
      const choice = optionGroup?.choices.find((c) => c.name === opt.choiceName)

      return {
        optionTitle: opt.groupTitle,
        choiceName: opt.choiceName,
        extraPrice: choice?.extraPrice ?? 0,
      }
    })

    const formattedAddons = (addons ?? []).map((addon) => ({
      id: addon.id,
      title: addon.title,
      price: addon.price,
      isAvailable: true,
    }))

    addItem({
      productId: product.id,
      productTitle: product.title,
      image: product.images[0]?.url ?? '',
      weight: variant.weight ?? 0,
      variant: {
        ...variant,
        price: unitPrice,
      },
      selectedOptions: formattedOptions,
      selectedAddons: formattedAddons,
      quantity: quantity,
      unitPrice,
      rewardPoints: variant.pointsActive ? variant.pointsAmount : 0,
      branchId: selectedBranchId,
      branchName: currentBranchStock?.branch.name ?? '',
      productType: product.productType,
    })
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCashRegister}
        title="แคชเชียร์"
        description="เลือกสินค้า สแกนบาร์โค้ด และทำรายการชำระเงิน"
        endContent={
          <div className="flex flex-wrap gap-2">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canCreateOrder ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการใช้งานระบบ POS ของสาขาหรือร้านค้านี้"
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7 xl:col-span-8">
            {isProductsLoading ? (
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-44 w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <PosProductList
                products={products}
                search={search}
                onSearchChange={setSearch}
                onAddToCart={handleAddToCart}
              />
            )}
          </div>
          <div className="lg:col-span-5 xl:col-span-4">
            <PosCart
              cart={cartItems}
              storeId={selectedStoreId}
              branchId={selectedBranchId}
              onUpdateQuantity={updateQuantity}
              onClearCart={clearCart}
              onRemoveItem={removeItem}
            />
          </div>
        </div>
      )}
    </Sidebar>
  )
}
