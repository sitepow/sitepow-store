'use client'

import { WebhookBestPractices } from './WebhookBestPractices'
import { WebhookEventsOverview } from './WebhookEventsOverview'
import { WebhookHeadersTable } from './WebhookHeadersTable'
import { WebhookHeroBanner } from './WebhookHeroBanner'
import { WebhookPayloadExampleCard } from './WebhookPayloadExampleCard'
import { WebhookStepsGuide } from './WebhookStepsGuide'
import { WebhookVerificationGuideCard } from './WebhookVerificationGuideCard'

export function WebhookDocsContent() {
  return (
    <div className="text-foreground mx-auto w-full max-w-5xl space-y-12 px-4 py-8 sm:px-6 sm:py-12">
      <WebhookHeroBanner />
      <WebhookStepsGuide />
      <WebhookEventsOverview />
      <WebhookHeadersTable />
      <WebhookVerificationGuideCard />
      <WebhookPayloadExampleCard />
      <WebhookBestPractices />
    </div>
  )
}
