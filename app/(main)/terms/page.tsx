import { Suspense } from "react"
import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"

import { MainLayout } from "@/components/layout/Layout"
import { TermsContent } from "./_components/TermsContent"

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("terms.meta")
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: "/terms",
      languages: {
        th: "/terms?lang=th",
        en: "/terms?lang=en",
      },
    },
  }
}

export default function TermsPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-4 pb-16">
      <Suspense>
        <TermsContent />
      </Suspense>
    </MainLayout>
  )
}
