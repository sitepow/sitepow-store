'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useAddStoreDomain,
  useRemoveStoreDomain,
  useStoreDomain,
  useVerifyStoreDomain,
} from '@/actions/hooks/domain'
import { DomainStatus } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconInfoCircle,
  IconRefresh,
  IconTrash,
  IconWorld,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { DeleteButton } from '@/components/DeleteButton'
import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'

export function DomainSettingsForm() {
  const t = useTranslations('merchant.settings.domain')
  const { selectedStoreId, selectedStoreSlug } = useStoreFilter()

  const { data: customDomain, isLoading: isDomainLoading } = useStoreDomain(
    selectedStoreId as string,
  )

  const addDomainMutation = useAddStoreDomain()
  const removeDomainMutation = useRemoveStoreDomain()
  const verifyDomainMutation = useVerifyStoreDomain()

  const [customDomainInput, setCustomDomainInput] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleAddDomain = () => {
    if (
      !customDomainInput ||
      !selectedStoreId ||
      selectedStoreId === ALL_STORES
    ) {
      console.warn('Missing data or store invalid:', {
        customDomainInput,
        selectedStoreId,
      })
      return
    }

    addDomainMutation.mutate(
      { storeId: selectedStoreId, domain: customDomainInput },
      {
        onSuccess: (res) => {
          if (res.success) {
            setCustomDomainInput('')
          }
        },
      },
    )
  }

  const handleVerifyDomain = () => {
    if (!selectedStoreId) {
      return
    }

    verifyDomainMutation.mutate(selectedStoreId, {})
  }

  const defaultSubdomain = selectedStoreSlug
    ? `${selectedStoreSlug}.sitepow.store`
    : ''

  const getCnameHostName = (domainName: string) => {
    const clean = domainName.trim().toLowerCase()
    const parts = clean.split('.')

    if (parts.length > 2) {
      return parts[0]
    }

    return '@'
  }

  return (
    <Card>
      <CardHeader>
        <PageTabHeader
          variant="secondary"
          icon={IconWorld}
          title={t('title')}
          description={t('description')}
        />
      </CardHeader>
      {selectedStoreId === ALL_STORES ? (
        <CardContent>
          <ActionRequiredAlert />
        </CardContent>
      ) : (
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <FieldLabel className="text-base font-semibold">
              {t('defaultSubdomain')}
            </FieldLabel>
            <div className="flex max-w-xl items-center gap-2">
              <Input
                value={defaultSubdomain ? `https://${defaultSubdomain}` : ''}
                readOnly
                className="bg-muted text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="icon-lg"
                onClick={() =>
                  handleCopy(`https://${defaultSubdomain}`, 'defaultSubdomain')
                }
              >
                {copiedField === 'defaultSubdomain' ? (
                  <IconCheck className="size-4 text-green-500" />
                ) : (
                  <IconCopy className="size-4" />
                )}
              </Button>
              {defaultSubdomain && (
                <Button variant="outline" size="icon-lg" asChild>
                  <a
                    href={`https://${defaultSubdomain}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <IconExternalLink className="size-4" />
                  </a>
                </Button>
              )}
            </div>
            <FieldDescription>{t('defaultSubdomainDesc')}</FieldDescription>
          </div>
          <Separator />
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold">
                {t('customDomainTitle')}
              </h3>
              <p className="text-muted-foreground text-sm">
                {t('customDomainDesc')}
              </p>
            </div>
            {isDomainLoading ? (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Spinner /> {t('loading')}
              </div>
            ) : !customDomain ? (
              <div className="max-w-xl space-y-3">
                <Field>
                  <FieldLabel>{t('inputLabel')}</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder={t('inputPlaceholder')}
                      value={customDomainInput}
                      onChange={(e) => setCustomDomainInput(e.target.value)}
                      disabled={addDomainMutation.isPending}
                    />
                    <Button
                      type="button"
                      onClick={handleAddDomain}
                      disabled={addDomainMutation.isPending}
                    >
                      {addDomainMutation.isPending ? <Spinner /> : t('connect')}
                    </Button>
                  </div>
                  <FieldDescription>{t('inputHint')}</FieldDescription>
                </Field>
              </div>
            ) : (
              <div className="space-y-4 rounded-xl border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-medium">
                      {customDomain.domain}
                    </span>
                    {customDomain.status === DomainStatus.ACTIVE && (
                      <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25">
                        {t('statusActive')}
                      </Badge>
                    )}
                    {customDomain.status === DomainStatus.PENDING && (
                      <Badge
                        variant="outline"
                        className="border-amber-500/40 bg-amber-500/10 text-amber-600"
                      >
                        {t('statusPending')}
                      </Badge>
                    )}
                    {customDomain.status === DomainStatus.FAILED && (
                      <Badge variant="destructive">{t('statusFailed')}</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyDomain}
                      disabled={verifyDomainMutation.isPending}
                    >
                      {verifyDomainMutation.isPending ? (
                        <Spinner />
                      ) : (
                        <IconRefresh size={14} />
                      )}
                      {t('verify')}
                    </Button>
                    <DeleteButton
                      title={t('deleteConfirmTitle')}
                      description={t('deleteConfirmDesc')}
                      isPending={removeDomainMutation.isPending}
                      onDelete={() => {
                        if (selectedStoreId) {
                          removeDomainMutation.mutate(selectedStoreId, {})
                        }
                      }}
                    >
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={removeDomainMutation.isPending}
                      >
                        {removeDomainMutation.isPending ? (
                          <Spinner />
                        ) : (
                          <IconTrash size={14} />
                        )}
                        {t('delete')}
                      </Button>
                    </DeleteButton>
                  </div>
                </div>
                {customDomain.status !== DomainStatus.ACTIVE && (
                  <div className="bg-muted/50 space-y-3 rounded-lg border p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <IconInfoCircle className="mt-0.5 size-4 shrink-0 text-blue-500" />
                      <div>
                        <p className="font-medium">{t('dnsGuideTitle')}</p>
                        <p className="text-muted-foreground text-xs">
                          {t('dnsGuideDesc')}
                        </p>
                      </div>
                    </div>
                    <div className="grid gap-2 text-xs sm:grid-cols-3">
                      <div className="bg-background rounded border p-2">
                        <span className="text-muted-foreground block text-[10px]">
                          {t('dnsType')}
                        </span>
                        CNAME
                      </div>
                      <div className="bg-background rounded border p-2">
                        <span className="text-muted-foreground block text-[10px]">
                          {t('dnsHost')}
                        </span>
                        {getCnameHostName(customDomain.domain)}
                      </div>
                      <div className="bg-background flex items-center justify-between rounded border p-2">
                        <div>
                          <span className="text-muted-foreground block text-[10px]">
                            {t('dnsTarget')}
                          </span>
                          {customDomain.cnameTarget}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          onClick={() =>
                            handleCopy(customDomain.cnameTarget, 'cname')
                          }
                        >
                          {copiedField === 'cname' ? (
                            <IconCheck className="size-3 text-green-500" />
                          ) : (
                            <IconCopy className="size-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  )
}
