'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { useApproveSlipManual } from '@/actions/hooks/verify-slip'
import { CurrencyCode } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { SlipVerificationAction } from '@/types/slip'
import { formatCurrency } from '@/utils/pricing'
import { formatBankAccount } from '@/utils/slip'
import { IconCheck, IconSearch, IconX } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

interface VerifySlipMerchantDialogProps {
  order: {
    id: string
    orderNumber: string
    paymentProof?: string | null
    totalAmount: number
    totalAmountBase?: number
    baseCurrency?: CurrencyCode
    customerCurrency?: CurrencyCode
    bankAccount?: {
      bankName: string
      accountNumber: string
      accountName: string
    } | null
  }
}

export function VerifySlipMerchantDialog({
  order,
}: VerifySlipMerchantDialogProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.orders.verifySlip')
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: handleVerifySlip, isPending } = useApproveSlipManual()

  const onAction = (action: SlipVerificationAction) => {
    handleVerifySlip(
      { orderId: order.id, action },
      {
        onSuccess: (res) => {
          if (res.success) {
            setIsOpen(false)
          }
        },
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <IconSearch size={16} /> {t('button')}
        </Button>
      </DialogTrigger>
      <DialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
        className="sm:max-w-lg"
      >
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconSearch}
            title={t('title', { orderNumber: order.orderNumber })}
            description={
              <span className="block space-y-1">
                <span className="text-foreground block font-medium">
                  {t('amountDue')}{' '}
                  <span className="text-primary font-semibold">
                    {formatCurrency(
                      order.totalAmount,
                      order.customerCurrency || CurrencyCode.THB,
                    )}
                  </span>
                  {order.customerCurrency &&
                    order.baseCurrency &&
                    order.customerCurrency !== order.baseCurrency &&
                    order.totalAmountBase !== undefined && (
                      <span className="text-muted-foreground ml-1.5 text-xs font-normal">
                        (~
                        {formatCurrency(
                          order.totalAmountBase,
                          order.baseCurrency,
                        )}
                        )
                      </span>
                    )}
                </span>
                {order.bankAccount && (
                  <span className="text-foreground block font-medium">
                    {t('bankInfo', {
                      bank: order.bankAccount.bankName,
                      account: formatBankAccount(
                        order.bankAccount.accountNumber,
                      ),
                      name: order.bankAccount.accountName,
                    })}
                  </span>
                )}
              </span>
            }
          />
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {order.paymentProof ? (
            <div className="border-primary relative h-96 w-full border border-dashed">
              <Image
                src={order.paymentProof}
                alt={`Slip for order ${order.orderNumber}`}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <ActionRequiredAlert
              description={t('noSlipDesc')}
              title={t('noSlipTitle')}
            />
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onAction(SlipVerificationAction.REJECT)}
          >
            {isPending ? <Spinner /> : <IconX />} {t('reject')}
          </Button>
          <Button
            type="button"
            onClick={() => onAction(SlipVerificationAction.APPROVE)}
          >
            {isPending ? <Spinner /> : <IconCheck />} {t('approve')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
