/* eslint-disable @next/next/no-img-element */
import { IconFileText } from '@tabler/icons-react'

interface BankAccountInfo {
  bankName: string
  accountNumber: string
  accountName: string
}

interface OrderPaymentInfoCardProps {
  bankAccount?: BankAccountInfo | null
  paymentProof?: string | null
}

export function OrderPaymentInfoCard({
  bankAccount,
  paymentProof,
}: OrderPaymentInfoCardProps) {
  if (!bankAccount && !paymentProof) return null

  return (
    <div className="space-y-2 rounded-lg border p-3 text-xs">
      <div className="text-muted-foreground flex items-center gap-1.5 font-semibold">
        <IconFileText size={15} /> ข้อมูลการชำระเงิน
      </div>
      {bankAccount && (
        <div>
          โอนเข้าบัญชี: {bankAccount.bankName} {bankAccount.accountNumber} (
          {bankAccount.accountName})
        </div>
      )}
      {paymentProof && (
        <div className="space-y-1 pt-1">
          <span className="text-muted-foreground">
            หลักฐานการโอนเงิน (Slip):
          </span>
          <a
            href={paymentProof}
            target="_blank"
            rel="noreferrer"
            className="block max-w-32 overflow-hidden rounded-md border"
          >
            <img
              src={paymentProof}
              alt="Payment Proof"
              className="h-auto w-full object-cover transition-transform hover:scale-105"
            />
          </a>
        </div>
      )}
    </div>
  )
}
