import { Suspense } from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { MainLayout } from "@/components/layout/Layout"
import { PrivacyContent } from "./_components/PrivacyContent"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("privacy.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/privacy",
      languages: {
        th: "/privacy?lang=th",
        en: "/privacy?lang=en",
      },
    },
  }
}

export default function PrivacyPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-4 pb-16">
      <Suspense>
        <PrivacyContent />
      </Suspense>
    </MainLayout>
  )
}
