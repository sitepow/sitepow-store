'use client'

import toast from 'react-hot-toast'

import { useDeleteBankAccount } from '@/actions/store/payment/hooks'
import { PaymentSettingPayload } from '@/actions/store/payment/actions'
import { BankAccountType } from '@/generated/prisma/enums'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatBankAccount, formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { IconEdit } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { DeleteButton } from '@/components/DeleteButton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface BankAccountTableProps {
  accounts: PaymentSettingPayload['bankAccounts']
  onEdit: (id: string) => void
}

export function BankAccountTable({ accounts, onEdit }: BankAccountTableProps) {
  const { selectedStoreId } = useStoreFilter()
  const { mutate: deleteAccount, isPending } = useDeleteBankAccount()

  const handleDelete = (id: string) => {
    deleteAccount(
      { id, storeId: selectedStoreId },
      {
        onSuccess: () => toast.success('ลบบัญชีธนาคารเรียบร้อยแล้ว'),
        onError: (err) => toast.error(err.message),
      },
    )
  }

  if (accounts.length === 0) {
    return (
      <ActionRequiredAlert
        title="แจ้งเตือน"
        description="ยังไม่มีบัญชีธนาคาร กดปุ่มเพิ่มบัญชีธนาคารด้านบน"
      />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ประเภท</TableHead>
            <TableHead>ธนาคาร/ผู้ให้บริการ</TableHead>
            <TableHead>ข้อมูลบัญชี</TableHead>
            <TableHead>ชื่อบัญชี</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="w-28 text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>
                <Badge variant="outline">
                  {account.type === BankAccountType.PROMPTPAY
                    ? 'PromptPay'
                    : 'โอนผ่านธนาคาร'}
                </Badge>
              </TableCell>
              <TableCell>{account.bankName}</TableCell>
              <TableCell>
                {account.type === BankAccountType.PROMPTPAY
                  ? formatPromptPay(account.promptPayId)
                  : formatBankAccount(account.accountNumber)}
              </TableCell>
              <TableCell>{account.accountName}</TableCell>
              <TableCell>
                <Badge variant={account.isDefault ? 'default' : 'outline'}>
                  {account.isDefault ? 'บัญชีหลัก' : 'บัญชีรอง'}
                </Badge>
              </TableCell>
              <TableCell className="space-x-1 text-right">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-lg"
                  onClick={() => onEdit(account.id)}
                >
                  <IconEdit />
                </Button>
                <DeleteButton
                  isPending={isPending}
                  onDelete={() => handleDelete(account.id)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
