'use client'

import { useTranslations } from 'next-intl'

import { useDeleteBankAccount } from '@/actions/hooks/payment'
import { PaymentSettingPayload } from '@/actions/payment'
import { BankAccountType } from '@/generated/prisma/enums'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
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
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.settings.payment.table')
  const { selectedStoreId } = useStoreFilter()
  const { mutate: deleteAccount, isPending } = useDeleteBankAccount()

  const handleDelete = (id: string) => {
    deleteAccount({ id, storeId: selectedStoreId })
  }

  if (accounts.length === 0) {
    return (
      <ActionRequiredAlert
        title={t('emptyTitle')}
        description={t('emptyDesc')}
      />
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('type')}</TableHead>
            <TableHead>{t('bank')}</TableHead>
            <TableHead>{t('accountInfo')}</TableHead>
            <TableHead>{t('accountName')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="w-28 text-right">{t('actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {accounts.map((account) => (
            <TableRow key={account.id}>
              <TableCell>
                <Badge variant="outline">
                  {account.type === BankAccountType.PROMPTPAY
                    ? t('promptPay')
                    : t('bankTransfer')}
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
                  {account.isDefault
                    ? t('defaultAccount')
                    : t('secondaryAccount')}
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
