'use client'

import { useTranslations } from 'next-intl'

import { Card, CardContent } from '@/components/ui/card'

export function WebhookHeadersTable() {
  const t = useTranslations('docs')

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">
        {t('headers.title')}
      </h2>
      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-muted-foreground border-b text-xs font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">{t('headers.colName')}</th>
                  <th className="px-4 py-3">{t('headers.colExample')}</th>
                  <th className="px-4 py-3">{t('headers.colDesc')}</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y text-xs">
                <tr>
                  <td className="text-foreground px-4 py-3 font-medium">
                    Content-Type
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    application/json
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {t('headers.contentTypeDesc')}
                  </td>
                </tr>
                <tr>
                  <td className="text-foreground px-4 py-3 font-medium">
                    X-Sitepow-Signature
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    t=1725414162,v1=4f3a...
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {t('headers.signatureDesc')}
                  </td>
                </tr>
                <tr>
                  <td className="text-foreground px-4 py-3 font-medium">
                    X-Sitepow-Event
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    order.paid
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {t('headers.eventDesc')}
                  </td>
                </tr>
                <tr>
                  <td className="text-foreground px-4 py-3 font-medium">
                    X-Sitepow-Delivery
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    deliv_01J7K...
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {t('headers.deliveryDesc')}
                  </td>
                </tr>
                <tr>
                  <td className="text-foreground px-4 py-3 font-medium">
                    User-Agent
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    Sitepow-Webhook/1.0
                  </td>
                  <td className="text-muted-foreground px-4 py-3">
                    {t('headers.userAgentDesc')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
