'use client'

import { useTranslations } from 'next-intl'

import { CodeBlock } from './CodeBlock'
import { SAMPLE_PAYLOAD } from './snippets'

export function WebhookPayloadExampleCard() {
  const t = useTranslations('docs')

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">
        {t('payload.title')}
      </h2>
      <p className="text-muted-foreground text-sm">
        {t.rich('payload.description', {
          event: () => (
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
              order.paid
            </code>
          ),
        })}
      </p>
      <CodeBlock code={SAMPLE_PAYLOAD} language="json" />
    </div>
  )
}
