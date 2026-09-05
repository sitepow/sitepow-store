'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

import {
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
} from '@/actions/hooks/storefront/address'
import { formatPromptPay } from '@/utils/slip'
import { IconArrowForward, IconBriefcase, IconHome } from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
import { TableEmptyRow } from '@/components/TableEmptyRow'
import { TableLoadingRow } from '@/components/TableLoadingRow'
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

export function AddressTable() {
  const t = useTranslations('customer.addresses')
  const params = useParams()
  const domain = params?.domain as string

  const { data: addresses = [], isLoading } = useAddresses(domain)
  const { mutate: deleteAddress, isPending: isDeletePending } =
    useDeleteAddress()
  const { mutate: setDefault } = useSetDefaultAddress()

  const isOfficeAddress = (name?: string | null) => {
    if (!name) return false
    const lower = name.toLowerCase()
    return (
      lower.includes('office') ||
      lower.includes('work') ||
      (t.has('office' as any) && name.includes(t('office' as any)))
    )
  }

  return (
    <div className="rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('columns.address')}</TableHead>
            <TableHead>{t('columns.recipient')}</TableHead>
            <TableHead>{t('columns.phone')}</TableHead>
            <TableHead>{t('columns.details')}</TableHead>
            <TableHead className="text-right">{t('columns.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && addresses.length === 0 ? (
            <TableLoadingRow colSpan={5} />
          ) : addresses.length === 0 ? (
            <TableEmptyRow colSpan={5} title={t('empty')} />
          ) : (
            addresses.map((addr) => (
              <TableRow key={addr.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {isOfficeAddress(addr.name) ? (
                      <IconBriefcase size={16} />
                    ) : (
                      <IconHome size={16} />
                    )}
                    <span>{addr.name}</span>
                    {addr.isDefault && <Badge>{t('defaultBadge')}</Badge>}
                  </div>
                </TableCell>
                <TableCell>{addr.receiverName}</TableCell>
                <TableCell>{formatPromptPay(addr.phone)}</TableCell>
                <TableCell className="max-w-72 min-w-72 wrap-break-word whitespace-pre-line">
                  {`${addr.addressLine} ${addr.subDistrict} ${addr.district} ${addr.province} ${addr.postalCode}`}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {!addr.isDefault && (
                      <Button
                        variant="outline"
                        onClick={() => setDefault(addr.id)}
                      >
                        <IconArrowForward />
                        {t('setDefault')}
                      </Button>
                    )}
                    <DeleteButton
                      isPending={isDeletePending}
                      title={t('confirmDeleteTitle')}
                      description={t('confirmDeleteDesc')}
                      onDelete={() => deleteAddress(addr.id)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
