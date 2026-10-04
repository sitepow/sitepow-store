'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import {
  usePOSProducts,
  useResellerPOSProducts,
} from '@/actions/sales/pos-product/hooks'
import { POSProductItem } from '@/actions/sales/pos-product/actions'
import { useCartStore } from '@/app/sites/[domain]/cart/store'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { useDebouncedValue } from '@/hooks/use-debounced-value'
import { ALL_BRANCHES, useBranchFilter } from '@/stores/use-branch-filter'
import { useResellerFilter } from '@/stores/use-reseller-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { calculateCartUnitPrice, getRemainingStock } from '@/utils/cart/cart-calculation'
import { IconCashRegister, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { BranchSelectField } from '@/components/form/BranchSelectField'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { ResellerAgreementSelectField } from '@/components/form/ResellerAgreementSelectField'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { DigitalPriceDisplay } from './_components/DigitalPriceDisplay'
import { PosCart } from './_components/PosCart'
import { PosProductList } from './_components/PosProductList'
import {
  SelectedAddonPayload,
  SelectedOptionPayload,
} from './_components/PosProductOptionDialog'

export default function MerchantPOSPage() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { selectedAgreementId } = useResellerFilter()

  const { canCreateOrder, isLoading: isPermissionLoading } =
    useEmployeePermission()

  const cartItems = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const removeItem = useCartStore((state) => state.removeItem)

  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 400)

  useEffect(() => {
    clearCart()
  }, [selectedStoreId, selectedBranchId, selectedAgreementId, clearCart])

  const { data: ownProducts = [], isLoading: isOwnProductsLoading } =
    usePOSProducts({
      storeId: selectedStoreId,
      branchId: selectedBranchId,
      search: debouncedSearch,
    })

  const isAllAgreement =
    !selectedAgreementId || selectedAgreementId === ALL_STORES

  const {
    data: rawResellerProducts = [],
    isLoading: isResellerProductsLoading,
  } = useResellerPOSProducts({
    agreementId: isAllAgreement ? '' : selectedAgreementId,
    branchId: selectedBranchId,
    search: debouncedSearch,
  })

  const resellerProducts = isAllAgreement ? [] : rawResellerProducts

  const resellerMap = new Map(
    (resellerProducts as unknown as POSProductItem[]).map((p) => [p.id, p]),
  )

  const filteredOwnProducts = (ownProducts as POSProductItem[]).filter(
    (p) => !resellerMap.has(p.id),
  )

  const products = [
    ...filteredOwnProducts,
    ...(resellerProducts as unknown as POSProductItem[]),
  ]

  const isProductsLoading =
    isOwnProductsLoading || (!isAllAgreement && isResellerProductsLoading)

  const resellerAgreementId = isAllAgreement
    ? undefined
    : selectedAgreementId ||
      products.find((p) => p.isReseller)?.resellerAgreementId

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

    const branchStock =
      variant.stocks.find((s) => s.branchId === selectedBranchId)?.quantity ?? 0

    const remainingStock = getRemainingStock(cartItems, {
      variantId: variant.id,
      stock: branchStock,
    })

    if (quantity > remainingStock) {
      toast.error(
        product.isReseller
          ? `สต็อกฝากขายคงเหลือไม่พอ (เหลือเพียง ${remainingStock} ชิ้น)`
          : `สินค้าในสาขานี้มีไม่พอ (เหลือเพียง ${remainingStock} ชิ้น)`,
      )
      return
    }

    const currentBranchStock = variant.stocks.find(
      (s) => s.branchId === selectedBranchId,
    )

    const selectedOptionsMap: Record<string, string[]> = {}
    const formattedOptions = (options ?? []).map((opt) => {
      selectedOptionsMap[opt.groupTitle] = [opt.choiceName]
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

    const selectedAddonIds = addons?.map((a) => a.id) ?? []
    const formattedAddons = (addons ?? []).map((addon) => ({
      id: addon.id,
      title: addon.title,
      price: addon.price,
      isAvailable: true,
    }))

    const unitPrice = calculateCartUnitPrice({
      variant,
      options: product.options,
      selectedOptionsMap,
      addons: product.addons,
      selectedAddonIds,
    })

    const selectedImage =
      variant.image ||
      product.images.find((img) => img.isPrimary)?.url ||
      product.images[0]?.url ||
      ''

    addItem({
      productId: product.id,
      productTitle: product.title,
      image: selectedImage,
      weight: variant.weight ?? 0,
      variant: {
        ...variant,
        price: Number(variant.price),
      },
      selectedOptions: formattedOptions,
      selectedAddons: formattedAddons,
      quantity,
      unitPrice,
      originalPrice: Number(variant.price),
      rewardPoints: variant.pointsActive ? (variant.pointsAmount ?? 0) : 0,
      branchId: selectedBranchId,
      branchName: currentBranchStock?.branch.name ?? '',
      productType: product.productType,
      isReseller: product.isReseller,
      agreementId: product.resellerAgreementId,
      storeId: product.storeId,
      supplierStoreId: product.isReseller ? product.storeId : undefined,
    })
  }

  const grandTotal = cartItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCashRegister}
        title="แคชเชียร์"
        description="เลือกสินค้า สแกนบาร์โค้ด และทำรายการชำระเงิน"
        endContent={
          <div className="flex flex-wrap items-center gap-2">
            <StoreSelectField />
            <BranchSelectField />
            <ResellerAgreementSelectField />
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : selectedBranchId === ALL_BRANCHES ? (
        <ActionRequiredAlert
          title="โปรดเลือกสาขา"
          description="กรุณาเลือกสาขาที่ต้องการก่อนเพื่อดำเนินการต่อ"
        />
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
                cartItems={cartItems}
                search={search}
                onSearchChange={setSearch}
                onAddToCart={handleAddToCart}
              />
            )}
          </div>
          <div className="flex flex-col gap-5 lg:col-span-5 xl:col-span-4">
            <DigitalPriceDisplay value={grandTotal} size="md" />
            <PosCart
              cart={cartItems}
              storeId={selectedStoreId}
              branchId={selectedBranchId}
              agreementId={resellerAgreementId}
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
