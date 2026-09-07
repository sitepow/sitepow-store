'use client'
import { useTranslations } from "next-intl"
import Link from "next/link"
import { MainSectionHeader } from "@/app/(main)/_components/MainSectionHeader"
import {
  IconBoxSeam,
  IconBuildingStore,
  IconCoins,
  IconKey,
  IconRobot,
  IconUsers,
} from "@tabler/icons-react"
import { BentoCard, BentoGrid } from "@/components/magicui/bento-grid"
import { Button } from "@/components/ui/button"

export function FeaturesBentoSection() {
  const t = useTranslations("home.featuresBento")
  return (
    <section id="features" className="bg-muted/40 border-border/40 relative w-full border-y py-16 md:py-24">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <MainSectionHeader
          badge={t("badge")}
          title={t("title")}
          description={t("description")}
        />
        <div>
          <BentoGrid className="auto-rows-auto sm:auto-rows-80 lg:auto-rows-88">
            <BentoCard
              name={t("cards.pos.name")}
              className="col-span-1 md:col-span-2 lg:col-span-2"
              Icon={IconBuildingStore}
              description={t("cards.pos.description")}
              href="/features/pos"
              cta={t("cards.pos.cta")}
              background={
                <div className="bg-primary/10 absolute -top-10 -right-10 size-48 rounded-full blur-2xl" />
              }
            />
            <BentoCard
              name={t("cards.ai.name")}
              className="col-span-1"
              Icon={IconRobot}
              description={t("cards.ai.description")}
              href="/features/ai"
              cta={t("cards.ai.cta")}
              background={
                <div className="absolute -top-8 -right-8 size-48 rounded-full bg-amber-500/10 blur-2xl" />
              }
            />
            <BentoCard
              name={t("cards.zeroGp.name")}
              className="col-span-1"
              Icon={IconCoins}
              description={t("cards.zeroGp.description")}
              href="/features/zero-gp"
              cta={t("cards.zeroGp.cta")}
              background={
                <div className="text-foreground/4 absolute right-4 bottom-2 text-7xl font-black">
                  0%
                </div>
              }
            />
            <BentoCard
              name={t("cards.inventory.name")}
              className="col-span-1"
              Icon={IconBoxSeam}
              description={t("cards.inventory.description")}
              href="/features/inventory"
              cta={t("cards.inventory.cta")}
              background={
                <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-blue-500/10 blur-2xl" />
              }
            />
            <BentoCard
              name={t("cards.digital.name")}
              className="col-span-1"
              Icon={IconKey}
              description={t("cards.digital.description")}
              href="/features/online-store"
              cta={t("cards.digital.cta")}
              background={
                <div className="absolute -top-10 -right-10 size-40 rounded-full bg-purple-500/10 blur-2xl" />
              }
            />
            <BentoCard
              name={t("cards.crm.name")}
              className="col-span-1 md:col-span-2 lg:col-span-3"
              Icon={IconUsers}
              description={t("cards.crm.description")}
              href="/features/crm"
              cta={t("cards.crm.cta")}
              background={
                <div className="bg-primary/10 absolute -right-10 -bottom-10 size-64 rounded-full blur-3xl" />
              }
            />
          </BentoGrid>
        </div>
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-11 w-full gap-2 rounded-full px-6 text-sm font-semibold shadow-xs transition-all hover:shadow-md sm:w-auto"
          >
            <Link href="/features">
              <span>{t("allFeaturesBtn")}</span>
              <IconBuildingStore className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
