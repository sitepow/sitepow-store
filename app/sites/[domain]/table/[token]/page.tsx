'use client'

import { useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

import {
  useActiveTableOrders,
  useTableMenu,
} from '@/actions/hooks/restaurant/order'
import type { TableMenuProductItem } from '@/types/restaurant'
import { IconArmchair, IconToolsKitchen2 } from '@tabler/icons-react'

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { TableActiveOrdersView } from './_components/TableActiveOrdersView'
import { TableCartDrawer } from './_components/TableCartDrawer'
import { TableFloatingCartBar } from './_components/TableFloatingCartBar'
import { TableMenuCategoryFilter } from './_components/TableMenuCategoryFilter'
import { TableMenuHeader } from './_components/TableMenuHeader'
import { TableProductCard } from './_components/TableProductCard'
import { TableProductCustomizeModal } from './_components/TableProductCustomizeModal'
import { useTableCart } from './_hooks/use-table-cart'

export default function CustomerTableOrderingPage() {
  const t = useTranslations('storefront.tableOrder')
  const params = useParams()
  const token = (params?.token as string) || ''

  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [customizingProduct, setCustomizingProduct] =
    useState<TableMenuProductItem | null>(null)

  const { data: menuData, isLoading: isMenuLoading } = useTableMenu(token)
  const { data: activeOrders = [] } = useActiveTableOrders(token, {
    refetchInterval: 8000,
  })

  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    kitchenNote,
    setKitchenNote,
    totalCartCount,
    cartTotal,
    handleAddToCart,
    handleUpdateCartQuantity,
    handleRemoveFromCart,
    handleClearCart,
    handleSubmitOrder,
    handleRequestBill,
    isSubmittingOrder,
    isRequestingBill,
  } = useTableCart({ token })

  const filteredProducts = useMemo(() => {
    if (!menuData?.products) return []
    return menuData.products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'ALL' || product.categoryId === selectedCategory
      const matchesSearch =
        !searchQuery.trim() ||
        product.title.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [menuData?.products, selectedCategory, searchQuery])

  if (isMenuLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="space-y-3 text-center">
          <IconToolsKitchen2 className="text-primary mx-auto size-10 animate-spin" />
          <p className="text-muted-foreground text-sm">{t('tabs.menu')}...</p>
        </div>
      </div>
    )
  }

  if (!menuData?.table) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <IconArmchair className="text-muted-foreground mx-auto size-12 opacity-50" />
            <CardTitle>{t('emptyMenu')}</CardTitle>
            <CardDescription>{t('emptyOrdersDesc')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const { table, store: currentStore, categories = [] } = menuData
  const hasRequestedBill = table.status === 'BILL_REQUESTED'

  return (
    <div className="bg-background min-h-screen pb-28">
      <TableMenuHeader
        storeName={currentStore?.name}
        storeLogo={currentStore?.logo}
        tableNumber={table.tableNumber}
        zoneName={table.zoneName}
        hasRequestedBill={hasRequestedBill}
        onRequestBill={handleRequestBill}
        isRequestingBill={isRequestingBill}
      />

      <div className="mx-auto max-w-3xl px-4 pt-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'menu' | 'orders')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">{t('tabs.menu')}</TabsTrigger>
            <TabsTrigger value="orders" className="relative">
              {t('tabs.orders', { count: activeOrders.length })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="menu" className="space-y-4 pt-4">
            <TableMenuCategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />

            {filteredProducts.length === 0 ? (
              <Card className="py-12 text-center">
                <CardHeader>
                  <IconToolsKitchen2 className="text-muted-foreground mx-auto size-10 opacity-40" />
                  <p className="text-muted-foreground text-sm">
                    {t('emptyMenu')}
                  </p>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredProducts.map((product) => (
                  <TableProductCard
                    key={product.id}
                    product={product}
                    onSelect={setCustomizingProduct}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-4 pt-4">
            <TableActiveOrdersView
              orders={activeOrders}
              onBackToMenu={() => setActiveTab('menu')}
            />
          </TabsContent>
        </Tabs>
      </div>

      <TableFloatingCartBar
        totalCartCount={totalCartCount}
        cartTotal={cartTotal}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <TableProductCustomizeModal
        product={customizingProduct}
        isOpen={Boolean(customizingProduct)}
        onClose={() => setCustomizingProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <TableCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        kitchenNote={kitchenNote}
        onKitchenNoteChange={setKitchenNote}
        onSubmitOrder={() => handleSubmitOrder(() => setActiveTab('orders'))}
        isSubmitting={isSubmittingOrder}
      />
    </div>
  )
}
