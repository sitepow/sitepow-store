'use client'

import toast from 'react-hot-toast'

import { useDeleteBankAccount } from '@/actions/hooks/payment'
import { PaymentSettingPayload } from '@/actions/payment'
import { useStoreFilter } from '@/stores/use-store-filter'

import { DeleteButton } from '@/components/DeleteButton'
import { Badge } from '@/components/ui/badge'
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
}

export function BankAccountTable({ accounts }: BankAccountTableProps) {
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
      <div className="text-muted-foreground rounded-lg border border-dashed py-8 text-center text-sm">
        ยังไม่มีบัญชีธนาคาร กดปุ่มเพิ่มบัญชีธนาคารด้านบน
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ธนาคาร</TableHead>
            <TableHead>เลขบัญชี</TableHead>
            <TableHead>ชื่อบัญชี</TableHead>
            <TableHead>สถานะ</TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell className="font-medium">{account.bankName}</TableCell>
              <TableCell>{account.accountNumber}</TableCell>
              <TableCell>{account.accountName}</TableCell>
              <TableCell>
                {account.isDefault ? (
                  <Badge>บัญชีหลัก</Badge>
                ) : (
                  <Badge variant="outline">บัญชีรอง</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center justify-end gap-1">
                  <DeleteButton
                    isPending={isPending}
                    onDelete={() => handleDelete(account.id)}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
