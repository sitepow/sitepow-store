'use client'

import { useTranslations } from 'next-intl'

import { IconShieldCheck } from '@tabler/icons-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { CodeBlock } from './CodeBlock'
import {
  SNIPPET_GO,
  SNIPPET_NODEJS,
  SNIPPET_PHP,
  SNIPPET_PYTHON,
} from './snippets'

export function WebhookVerificationGuideCard() {
  const t = useTranslations('docs')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <IconShieldCheck className="text-primary h-6 w-6" />
        <h2 className="text-2xl font-bold tracking-tight">
          {t('verification.title')}
        </h2>
      </div>
      <p className="text-muted-foreground text-sm">
        {t.rich('verification.description', {
          header: () => (
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
              X-Sitepow-Signature
            </code>
          ),
          format: () => (
            <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
              t=timestamp,v1=signature_hash
            </code>
          ),
        })}
      </p>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {t('verification.cardTitle')}
          </CardTitle>
          <CardDescription className="text-xs">
            {t.rich('verification.cardDesc', {
              formula: () => (
                <code className="bg-muted text-foreground rounded px-1.5 py-0.5">
                  timestamp . rawBody
                </code>
              ),
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="nodejs" className="w-full">
            <div className="overflow-x-auto pb-1">
              <TabsList className="bg-muted/60 flex h-auto w-fit shrink-0 gap-1 rounded-xl p-1">
                <TabsTrigger
                  value="nodejs"
                  className="rounded-lg px-4 py-1.5 text-xs font-medium"
                >
                  Node.js / Next.js
                </TabsTrigger>
                <TabsTrigger
                  value="python"
                  className="rounded-lg px-4 py-1.5 text-xs font-medium"
                >
                  Python
                </TabsTrigger>
                <TabsTrigger
                  value="php"
                  className="rounded-lg px-4 py-1.5 text-xs font-medium"
                >
                  PHP
                </TabsTrigger>
                <TabsTrigger
                  value="go"
                  className="rounded-lg px-4 py-1.5 text-xs font-medium"
                >
                  Go
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="nodejs" className="mt-3">
              <CodeBlock code={SNIPPET_NODEJS} language="typescript" />
            </TabsContent>
            <TabsContent value="python" className="mt-3">
              <CodeBlock code={SNIPPET_PYTHON} language="python" />
            </TabsContent>
            <TabsContent value="php" className="mt-3">
              <CodeBlock code={SNIPPET_PHP} language="php" />
            </TabsContent>
            <TabsContent value="go" className="mt-3">
              <CodeBlock code={SNIPPET_GO} language="go" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
