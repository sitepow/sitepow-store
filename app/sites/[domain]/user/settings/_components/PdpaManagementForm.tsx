'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'

import {
  useDeleteUserAccount,
  useExportUserData,
} from '@/actions/hooks/storefront/pdpa'
import { IconShieldLock } from '@tabler/icons-react'

import { DeleteButton } from '@/components/DeleteButton'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

import { authClient } from '@/lib/auth-client'

export function PdpaManagementForm() {
  const t = useTranslations('customer.settings')
  const router = useRouter()

  const { mutate: exportData, isPending: isExporting } = useExportUserData()
  const { mutate: deleteAccount, isPending: isDeleting } =
    useDeleteUserAccount()

  const handleDelete = () => {
    deleteAccount(undefined, {
      onSuccess: async (data) => {
        if (data?.success) {
          await authClient.signOut({
            fetchOptions: {
              onSuccess: () => {
                router.replace('/')
              },
            },
          })
        }
      },
    })
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconShieldLock}
          title={t('pdpaTitle')}
          description={t('pdpaDesc')}
        />
      </CardHeader>
      <CardContent className="divide-border divide-y">
        <div className="flex flex-wrap items-center justify-between gap-5 pb-4">
          <div className="pr-4">
            <span className="flex items-center gap-1.5 text-sm font-medium">
              {t('exportData')}
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              {t('exportDataDesc')}
            </span>
          </div>
          <DeleteButton
            isPending={isExporting}
            onDelete={() => exportData()}
            title={t('confirmExportTitle')}
            description={t('confirmExportDesc')}
          >
            <Button variant="outline" disabled={isExporting}>
              {isExporting ? t('exporting') : t('requestExport')}
            </Button>
          </DeleteButton>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 pt-4">
          <div className="pr-4">
            <span className="text-destructive block text-sm font-medium">
              {t('deleteAccountTitle')}
            </span>
            <span className="text-muted-foreground mt-1 block max-w-xl text-xs leading-relaxed">
              {t('deleteAccountDesc')}
            </span>
          </div>
          <DeleteButton
            isPending={isDeleting}
            onDelete={handleDelete}
            title={t('confirmDeleteAccountTitle')}
            description={t('confirmDeleteAccountDesc')}
          >
            <Button variant="destructive" disabled={isDeleting}>
              {isDeleting ? t('deleting') : t('deleteAccountBtn')}
            </Button>
          </DeleteButton>
        </div>
      </CardContent>
    </Card>
  )
}
