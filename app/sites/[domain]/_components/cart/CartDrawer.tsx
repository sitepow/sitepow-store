'use client'

import { formatNumber } from '@/utils/pricing'
import { Minus, Plus, ShoppingCartIcon, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

import { useCartStore } from '../../cart/store'

export function CartDrawer() {
  const { items, updateQuantity, removeItem, getCartSummary } = useCartStore()
  const summary = getCartSummary()

  return (
    <Drawer direction="right">
      <DrawerTrigger asChild>
        <Button variant="outline" size="lg" className="relative">
          <ShoppingCartIcon className="h-5 w-5" />
          {items.length > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-[10px]">
              {summary.totalQuantity > 99 ? '+99' : summary.totalQuantity}
            </span>
          )}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="ml-auto h-full w-full max-w-md">
        <DrawerHeader className="border-b">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            ตะกร้าสินค้า ({summary.totalQuantity})
          </DrawerTitle>
        </DrawerHeader>

        <ScrollArea className="flex-1 overflow-y-scroll px-4">
          {items.length === 0 ? (
            <div className="text-muted-foreground flex h-[60vh] flex-col items-center justify-center gap-2">
              <ShoppingCartIcon className="h-12 w-12 opacity-20" />
              <p>ยังไม่มีสินค้าในตะกร้า</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex gap-4">
                  <div className="relative size-20 overflow-hidden rounded-lg border bg-gray-200">
                    {/* <Image
                      src={item.image}
                      alt={item.productTitle}
                      fill
                      className="object-cover"
                    /> */}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between">
                        <h4 className="line-clamp-1 leading-none font-medium">
                          {item.productTitle}
                        </h4>
                        <button
                          onClick={() => removeItem(item.cartItemId)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {item.variant.title}
                        {item.selectedOptions.length > 0 &&
                          ` | ${item.selectedOptions.map((o) => o.choiceName).join(', ')}`}
                      </p>
                      {item.selectedAddons.length > 0 && (
                        <p className="text-primary text-[10px]">
                          + {item.selectedAddons.map((a) => a.title).join(', ')}
                        </p>
                      )}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity - 1)
                          }
                        >
                          <Minus className="size-3" />
                        </Button>
                        <span className="w-4 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-7"
                          onClick={() =>
                            updateQuantity(item.cartItemId, item.quantity + 1)
                          }
                        >
                          <Plus className="size-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-bold">
                        ฿{formatNumber(item.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {items.length > 0 && (
          <DrawerFooter className="border-t bg-slate-50/50">
            <div className="space-y-1.5 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">รวมราคาสินค้า</span>
                <span>฿{formatNumber(summary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600">
                <span>ส่วนลด</span>
                <span>-฿{formatNumber(summary.totalDiscount)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-lg font-bold">
                <span>ราคาสุทธิ</span>
                <span className="text-primary">
                  ฿{formatNumber(summary.finalPrice)}
                </span>
              </div>
              {summary.totalPoints > 0 && (
                <p className="text-right text-xs font-medium text-orange-500">
                  คุณจะได้รับ {formatNumber(summary.totalPoints)} แต้ม
                </p>
              )}
            </div>
            <Button size="lg" className="h-12 w-full text-lg shadow-md">
              สั่งซื้อสินค้า (฿{formatNumber(summary.finalPrice)})
            </Button>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
