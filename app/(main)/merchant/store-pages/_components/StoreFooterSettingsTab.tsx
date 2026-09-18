'use client'

import { useTranslations } from 'next-intl'
import {
  IconDeviceFloppy,
  IconExternalLink,
  IconLayoutBottombar,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Field, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

import { FooterFormData } from '../_hooks/use-store-pages-form'

interface StoreFooterSettingsTabProps {
  footerData: FooterFormData
  storeBaseUrl: string
  storeName?: string
  isPending: boolean
  onFooterDataChange: React.Dispatch<React.SetStateAction<FooterFormData>>
  onSaveFooter: () => void
}

export function StoreFooterSettingsTab({
  footerData,
  storeBaseUrl,
  storeName,
  isPending,
  onFooterDataChange,
  onSaveFooter,
}: StoreFooterSettingsTabProps) {
  const t = useTranslations('merchant.storePages')
  const currentYear = new Date().getFullYear()

  return (
    <TabsContent
      value="footer"
      className="min-w-0 flex-1 focus-visible:outline-none"
    >
      <Card>
        <CardHeader>
          <PageTabHeader
            variant="secondary"
            icon={IconLayoutBottombar}
            title={
              <div className="flex flex-wrap items-center gap-2">
                <span>{t('footer.title')}</span>
                <a
                  href={storeBaseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary inline-flex items-center gap-1 text-xs font-normal hover:underline"
                  title={t('openInNewTab')}
                >
                  <span>{t('footer.viewStorefront')}</span>
                  <IconExternalLink className="size-3.5 shrink-0" />
                </a>
              </div>
            }
            description={t('footer.description')}
            endContent={
              <Button
                type="button"
                size="sm"
                onClick={onSaveFooter}
                disabled={isPending}
                className="cursor-pointer text-xs font-medium"
              >
                {isPending ? (
                  <Spinner className="mr-1.5 size-3.5 shrink-0" />
                ) : (
                  <IconDeviceFloppy className="mr-1.5 size-3.5 shrink-0" />
                )}
                {isPending ? t('saving') : t('footer.saveButton')}
              </Button>
            }
          />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-foreground text-sm font-semibold sm:text-base">
              {t('footer.descriptionContactHeading')}
            </h3>

            <Field>
              <FieldLabel>{t('footer.footerTextLabel')}</FieldLabel>
              <Textarea
                placeholder={t('footer.footerTextPlaceholder')}
                value={footerData.footerText}
                onChange={(e) =>
                  onFooterDataChange((prev) => ({
                    ...prev,
                    footerText: e.target.value,
                  }))
                }
                rows={3}
              />
              <FieldDescription>
                {t('footer.footerTextHelp')}
              </FieldDescription>
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t('footer.phoneLabel')}</FieldLabel>
                <Input
                  placeholder={t('footer.phonePlaceholder')}
                  value={footerData.phone}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel>{t('footer.copyrightLabel')}</FieldLabel>
                <Input
                  placeholder={`© ${currentYear} ${storeName || t('footer.storeNameFallback')}. All rights reserved.`}
                  value={footerData.footerCopyright}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      footerCopyright: e.target.value,
                    }))
                  }
                />
                <FieldDescription>
                  {t('footer.copyrightHelp', {
                    year: currentYear,
                    storeName: storeName || t('footer.storeNameFallback'),
                  })}
                </FieldDescription>
              </Field>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-foreground text-sm font-semibold sm:text-base">
                {t('footer.socialHeading')}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                {t('footer.socialDescription')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field>
                <FieldLabel>{t('footer.facebookLabel')}</FieldLabel>
                <Input
                  placeholder="https://facebook.com/your-store"
                  value={footerData.facebookPage}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      facebookPage: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel>{t('footer.lineLabel')}</FieldLabel>
                <Input
                  placeholder={t('footer.linePlaceholder')}
                  value={footerData.lineId}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      lineId: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel>{t('footer.instagramLabel')}</FieldLabel>
                <Input
                  placeholder="https://instagram.com/your-store"
                  value={footerData.instagramPage}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      instagramPage: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel>{t('footer.tiktokLabel')}</FieldLabel>
                <Input
                  placeholder="https://tiktok.com/@your-store"
                  value={footerData.tiktokPage}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      tiktokPage: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel>{t('footer.messengerLabel')}</FieldLabel>
                <Input
                  placeholder="https://m.me/your-store"
                  value={footerData.messengerUrl}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      messengerUrl: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field>
                <FieldLabel>{t('footer.discordLabel')}</FieldLabel>
                <Input
                  placeholder="https://discord.gg/your-invite"
                  value={footerData.discordUrl}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      discordUrl: e.target.value,
                    }))
                  }
                />
              </Field>

              <Field className="sm:col-span-2">
                <FieldLabel>{t('footer.youtubeLabel')}</FieldLabel>
                <Input
                  placeholder="https://youtube.com/@your-channel"
                  value={footerData.youtubePage}
                  onChange={(e) =>
                    onFooterDataChange((prev) => ({
                      ...prev,
                      youtubePage: e.target.value,
                    }))
                  }
                />
              </Field>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2.5 border-t">
          <Button
            type="button"
            onClick={onSaveFooter}
            disabled={isPending}
            className="cursor-pointer font-medium"
          >
            {isPending ? (
              <Spinner className="mr-1.5 size-4" />
            ) : (
              <IconDeviceFloppy className="mr-1.5 size-4" />
            )}
            {isPending ? t('saving') : t('footer.saveAllButton')}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  )
}
