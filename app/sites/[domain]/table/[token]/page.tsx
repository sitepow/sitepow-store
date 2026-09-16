'use client'

import { useEffect, useState, useTransition } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

import {
  TableOrderItemInput,
  getActiveTableOrders,
  getTableMenu,
  requestTableBill,
  submitTableOrder,
} from '@/actions/restaurant/order'
import { KitchenItemStatus } from '@/generated/prisma/enums'
import { formatCurrency } from '@/utils/pricing'
import {
  IconArmchair,
  IconBell,
  IconCheck,
  IconClock,
  IconMinus,
  IconPlus,
  IconSearch,
  IconShoppingCart,
  IconToolsKitchen2,
  IconTrash,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { cn } from '@/lib/utils'

interface CartItem extends TableOrderItemInput {
  tempId: string
  title: string
  unitPrice: number
}

export default function CustomerTableOrderingPage() {
  const t = useTranslations('storefront.tableOrder')
  const params = useParams()
  const token = (params?.token as string) || ''

  const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu')
  const [data, setData] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeOrders, setActiveOrders] = useState<any[]>([])
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false)

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Cart
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [kitchenNote, setKitchenNote] = useState('')
  const [isSubmitting, startTransition] = useTransition()

  // Item customization modal
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [itemQuantity, setItemQuantity] = useState(1)
  const [itemNote, setItemNote] = useState('')

  const loadMenu = async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const res = await getTableMenu({ tableToken: token })
      if (res.success && res.data) {
        setData(res.data)
      } else {
        toast.error(res.messageTH || t('emptyMenu'))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadOrders = async () => {
    if (!token) return
    setIsRefreshingOrders(true)
    try {
      const res = await getActiveTableOrders({ tableToken: token })
      if (res.success && res.data) {
        setActiveOrders(res.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsRefreshingOrders(false)
    }
  }

  useEffect(() => {
    loadMenu()
    loadOrders()
  }, [token])

  useEffect(() => {
    const interval = setInterval(() => {
      loadOrders()
    }, 8000)
    return () => clearInterval(interval)
  }, [token])

  // Handlers for cart
  const openItemModal = (product: any) => {
    setSelectedProduct(product)
    setItemQuantity(1)
    setItemNote('')
    if (product.variants && product.variants.length > 0) {
      setSelectedVariantId(product.variants[0].id)
    } else {
      setSelectedVariantId('')
    }
  }

  const handleAddToCart = () => {
    if (!selectedProduct) return

    let variantId = ''
    let variantTitle = ''
    let price = Number(selectedProduct.price)

    if (selectedVariantId && selectedProduct.variants) {
      const variant = selectedProduct.variants.find(
        (v: any) => v.id === selectedVariantId,
      )
      if (variant) {
        variantId = variant.id
        variantTitle = variant.title
        price = Number(variant.price)
      }
    } else if (selectedProduct.variants?.[0]) {
      variantId = selectedProduct.variants[0].id
      variantTitle = selectedProduct.variants[0].title
      price = Number(selectedProduct.variants[0].price)
    }

    const newItem: CartItem = {
      tempId: `${Date.now()}-${Math.random()}`,
      productId: selectedProduct.id,
      variantId,
      title: selectedProduct.title,
      variantTitle,
      unitPrice: price,
      price,
      quantity: itemQuantity,
      customerNote: itemNote.trim() || undefined,
    }

    setCart((prev) => [...prev, newItem])
    toast.success(t('toasts.addedToCart', { name: selectedProduct.title }))
    setSelectedProduct(null)
  }

  const handleRemoveFromCart = (tempId: string) => {
    setCart((prev) => prev.filter((item) => item.tempId !== tempId))
  }

  const handleUpdateCartQuantity = (tempId: string, delta: number) => {
    setCart(
      (prev) =>
        prev
          .map((item) => {
            if (item.tempId === tempId) {
              const nextQty = item.quantity + delta
              return nextQty > 0 ? { ...item, quantity: nextQty } : null
            }
            return item
          })
          .filter(Boolean) as CartItem[],
    )
  }

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Submit Order
  const handleSubmitOrder = () => {
    if (cart.length === 0) {
      toast.error(t('toasts.noItems'))
      return
    }

    startTransition(async () => {
      const res = await submitTableOrder({
        tableToken: token,
        kitchenNote: kitchenNote.trim() || undefined,
        items: cart.map((c) => ({
          productId: c.productId,
          variantId: c.variantId,
          title: c.title,
          variantTitle: c.variantTitle,
          quantity: c.quantity,
          price: c.unitPrice,
          customerNote: c.customerNote,
        })),
      })

      if (res.success) {
        toast.success(t('toasts.orderSuccess'))
        setCart([])
        setKitchenNote('')
        setIsCartOpen(false)
        setActiveTab('orders')
        loadOrders()
      } else {
        toast.error(res.messageTH || t('toasts.orderError'))
      }
    })
  }

  // Request Bill
  const handleRequestBill = () => {
    startTransition(async () => {
      const res = await requestTableBill({ tableToken: token })
      if (res.success) {
        toast.success(t('toasts.billSuccess'))
        loadMenu()
      } else {
        toast.error(res.messageTH || t('toasts.billError'))
      }
    })
  }

  if (isLoading) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <div className="space-y-3 text-center">
          <IconToolsKitchen2 className="text-primary mx-auto size-10 animate-spin" />
          <p className="text-muted-foreground text-sm">{t('tabs.menu')}...</p>
        </div>
      </div>
    )
  }

  if (!data?.table) {
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

  const { table, store: currentStore, categories = [], products = [] } = data
  const hasRequestedBill = table.status === 'BILL_REQUESTED'

  const filteredProducts = products.filter((p: any) => {
    const matchCat =
      selectedCategory === 'ALL' || p.categoryId === selectedCategory
    const matchSearch =
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  })

  const getStatusBadge = (status: KitchenItemStatus) => {
    switch (status) {
      case KitchenItemStatus.COOKING:
        return <Badge variant="default">{t('tracker.cooking')}</Badge>
      case KitchenItemStatus.READY:
        return <Badge variant="secondary">{t('tracker.ready')}</Badge>
      case KitchenItemStatus.SERVED:
        return <Badge variant="outline">{t('tracker.served')}</Badge>
      case KitchenItemStatus.CANCELLED:
        return <Badge variant="destructive">{t('tracker.cancelled')}</Badge>
      case KitchenItemStatus.PENDING:
      default:
        return <Badge variant="outline">{t('tracker.pending')}</Badge>
    }
  }

  return (
    <div className="bg-background min-h-screen pb-28">
      {/* Top Header */}
      <header className="bg-background/95 sticky top-0 z-30 border-b backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            {currentStore?.logo ? (
              <img
                src={currentStore.logo}
                alt={currentStore.name}
                className="size-10 flex-shrink-0 rounded-full border object-contain p-0.5"
              />
            ) : (
              <div className="bg-primary/10 text-primary flex size-10 flex-shrink-0 items-center justify-center rounded-full">
                <IconToolsKitchen2 className="size-5" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-sm leading-tight font-bold">
                {currentStore?.name}
              </h1>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs">
                  {t('tableBadge', { number: table.tableNumber })}
                </Badge>
                {table.zone?.name && (
                  <span className="text-muted-foreground text-xs">
                    {t('zoneBadge', { name: table.zone.name })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            size="sm"
            variant={hasRequestedBill ? 'secondary' : 'outline'}
            onClick={handleRequestBill}
            disabled={hasRequestedBill}
            className="flex-shrink-0"
          >
            <IconBell className="mr-1.5 size-4" />
            {hasRequestedBill ? t('billRequested') : t('callStaff')}
          </Button>
        </div>
      </header>

      {/* Bill Requested Notification Banner */}
      {hasRequestedBill && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive border-b px-4 py-2 text-center text-xs font-medium">
          {t('billRequestedDesc')}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="menu">{t('tabs.menu')}</TabsTrigger>
            <TabsTrigger value="orders" className="relative">
              {t('tabs.orders', { count: activeOrders.length })}
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Menu */}
          <TabsContent value="menu" className="space-y-4 pt-4">
            {/* Search Bar */}
            <div className="relative">
              <IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Category Pills */}
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
              <Button
                size="sm"
                variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('ALL')}
                className="rounded-full text-xs"
              >
                {t('allCategories')}
              </Button>
              {categories.map((cat: any) => (
                <Button
                  key={cat.id}
                  size="sm"
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex-shrink-0 rounded-full text-xs"
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent className="space-y-2">
                  <IconToolsKitchen2 className="text-muted-foreground mx-auto size-10 opacity-40" />
                  <p className="text-muted-foreground text-sm">
                    {t('emptyMenu')}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {filteredProducts.map((product: any) => (
                  <Card
                    key={product.id}
                    className="flex flex-col justify-between overflow-hidden"
                  >
                    <div className="flex gap-3 p-3">
                      {product.featuredImage ? (
                        <img
                          src={product.featuredImage}
                          alt={product.title}
                          className="size-20 flex-shrink-0 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="bg-muted text-muted-foreground flex size-20 flex-shrink-0 items-center justify-center rounded-md">
                          <IconToolsKitchen2 className="size-6 opacity-40" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="line-clamp-1 text-sm font-semibold">
                          {product.title}
                        </h3>
                        {product.details?.description && (
                          <p className="text-muted-foreground line-clamp-2 text-xs">
                            {product.details.description}
                          </p>
                        )}
                        <p className="text-primary pt-0.5 text-sm font-bold">
                          {formatCurrency(product.price)} {t('baht')}
                        </p>
                      </div>
                    </div>

                    <CardFooter className="flex justify-end p-3 pt-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openItemModal(product)}
                      >
                        <IconPlus className="mr-1 size-3.5" />
                        {t('selectOptions')}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 2: Orders Tracker */}
          <TabsContent value="orders" className="space-y-4 pt-4">
            {activeOrders.length === 0 ? (
              <Card className="py-12 text-center">
                <CardContent className="space-y-2">
                  <IconClock className="text-muted-foreground mx-auto size-10 opacity-40" />
                  <CardTitle className="text-base">
                    {t('emptyOrders')}
                  </CardTitle>
                  <CardDescription>{t('emptyOrdersDesc')}</CardDescription>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('menu')}
                    className="mt-2"
                  >
                    {t('tabs.menu')}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order: any) => (
                  <Card key={order.id}>
                    <CardHeader className="border-b pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="font-mono text-sm">
                          {t('tracker.orderNumber', {
                            number: order.orderNumber,
                          })}
                        </CardTitle>
                        <Badge variant="outline" className="font-mono text-xs">
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="divide-y p-4">
                      {order.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                        >
                          <div className="flex-1 space-y-0.5">
                            <div className="text-sm font-medium">
                              <span className="mr-1.5 font-bold">
                                {item.quantity}×
                              </span>
                              {item.title}
                            </div>
                            {item.variantTitle &&
                              !['ปกติ', 'Default', 'default'].includes(
                                item.variantTitle,
                              ) && (
                                <p className="text-muted-foreground text-xs">
                                  {item.variantTitle}
                                </p>
                              )}
                            {item.customerNote && (
                              <p className="text-primary text-xs">
                                ★ {item.customerNote}
                              </p>
                            )}
                          </div>
                          <div>{getStatusBadge(item.kitchenStatus)}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed right-0 bottom-4 left-0 z-40 flex justify-center px-4">
          <Button
            size="lg"
            className="w-full max-w-md gap-2 shadow-lg"
            onClick={() => setIsCartOpen(true)}
          >
            <IconShoppingCart className="size-5" />
            <span className="flex-1 text-left">
              {t('viewCart', { count: totalCartCount })}
            </span>
            <span className="font-bold">
              {formatCurrency(cartTotal)} {t('baht')}
            </span>
          </Button>
        </div>
      )}

      {/* Modal: Item Customization */}
      <Dialog
        open={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedProduct?.title}</DialogTitle>
            {selectedProduct?.details?.description && (
              <DialogDescription>
                {selectedProduct.details.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Variants */}
            {selectedProduct?.variants &&
              selectedProduct.variants.length > 0 && (
                <div className="space-y-2">
                  <Label>{t('dialog.variant')}</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedProduct.variants.map((v: any) => (
                      <Button
                        key={v.id}
                        type="button"
                        size="sm"
                        variant={
                          selectedVariantId === v.id ? 'default' : 'outline'
                        }
                        className="h-auto justify-between px-3 py-2 text-xs"
                        onClick={() => setSelectedVariantId(v.id)}
                      >
                        <span>{v.title}</span>
                        <span className="font-bold">
                          {formatCurrency(v.price)} {t('baht')}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

            {/* Quantity Stepper */}
            <div className="space-y-2">
              <Label>{t('dialog.quantity')}</Label>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setItemQuantity((q) => Math.max(1, q - 1))}
                  disabled={itemQuantity <= 1}
                >
                  <IconMinus className="size-4" />
                </Button>
                <span className="min-w-[32px] text-center text-base font-bold">
                  {itemQuantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setItemQuantity((q) => q + 1)}
                >
                  <IconPlus className="size-4" />
                </Button>
              </div>
            </div>

            {/* Special Note */}
            <div className="space-y-2">
              <Label htmlFor="itemNote">{t('dialog.note')}</Label>
              <Input
                id="itemNote"
                placeholder={t('dialog.notePlaceholder')}
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setSelectedProduct(null)}>
              {t('dialog.cancel')}
            </Button>
            <Button onClick={handleAddToCart}>{t('dialog.confirm')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Cart Drawer / Review Order */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
          <DialogHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <DialogTitle>{t('cartDrawer.title')}</DialogTitle>
              {cart.length > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10 text-xs"
                  onClick={() => setCart([])}
                >
                  {t('cartDrawer.clear')}
                </Button>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 divide-y overflow-y-auto py-2">
            {cart.map((item) => (
              <div
                key={item.tempId}
                className="flex items-start justify-between gap-3 py-3"
              >
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  {item.variantTitle && (
                    <p className="text-muted-foreground text-xs">
                      {item.variantTitle}
                    </p>
                  )}
                  {item.customerNote && (
                    <p className="text-primary text-xs">
                      ★ {item.customerNote}
                    </p>
                  )}
                  <p className="text-primary text-xs font-bold">
                    {formatCurrency(item.unitPrice * item.quantity)} {t('baht')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7"
                    onClick={() => handleUpdateCartQuantity(item.tempId, -1)}
                  >
                    <IconMinus className="size-3" />
                  </Button>
                  <span className="min-w-[20px] text-center text-sm font-bold">
                    {item.quantity}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="size-7"
                    onClick={() => handleUpdateCartQuantity(item.tempId, 1)}
                  >
                    <IconPlus className="size-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive size-7"
                    onClick={() => handleRemoveFromCart(item.tempId)}
                  >
                    <IconTrash className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 border-t pt-3">
            <div className="space-y-1.5">
              <Label htmlFor="kitchenNote">{t('cartDrawer.kitchenNote')}</Label>
              <Textarea
                id="kitchenNote"
                placeholder={t('cartDrawer.kitchenNotePlaceholder')}
                value={kitchenNote}
                onChange={(e) => setKitchenNote(e.target.value)}
                rows={2}
                className="resize-none text-xs"
              />
            </div>

            <div className="flex items-center justify-between text-base font-bold">
              <span>{t('cartDrawer.subtotal')}</span>
              <span className="text-primary">
                {formatCurrency(cartTotal)} {t('baht')}
              </span>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setIsCartOpen(false)}>
                {t('dialog.cancel')}
              </Button>
              <Button
                onClick={handleSubmitOrder}
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting
                  ? t('cartDrawer.submitting')
                  : t('cartDrawer.submit')}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
