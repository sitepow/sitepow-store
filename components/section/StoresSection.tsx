'use client'

import Link from 'next/link'

import { useLandingStores } from '@/actions/hooks/store'
import { IconArrowUpRight } from '@tabler/icons-react'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StoresSection() {
  const { data: stores = [], isLoading } = useLandingStores(6)

  if (stores?.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <SectionHeader
        title="ร้านค้าที่ไว้วางใจเรา"
        description="สัมผัสประสบการณ์ร้านค้าที่รันบนโครงสร้างพื้นฐานระดับสูง"
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="flex flex-col overflow-hidden p-0">
                <Skeleton className="h-52 w-full rounded-none" />
              </Card>
            ))
          : stores.map((store) => (
              <Card
                key={store.id}
                className="group bg-background relative flex flex-col overflow-hidden p-0 transition-all"
              >
                <div className="bg-muted relative h-48 w-full overflow-hidden">
                  <div className="from-background/80 absolute inset-0 bg-linear-to-t to-transparent" />
                  <div className="text-muted-foreground/30 flex h-full items-center justify-center">
                    <span className="text-sm font-medium tracking-widest uppercase">
                      Preview
                    </span>
                  </div>
                </div>

                <CardContent className="flex flex-1 flex-col pb-5">
                  <h3 className="line-clamp-2 text-xl font-bold sm:text-2xl">
                    {store.name}
                  </h3>
                  <p className="mt-1 text-lg leading-relaxed text-gray-500 opacity-80">
                    ระบบจัดการออเดอร์และสต็อกที่ครบวงจร
                    ได้รับความไว้วางใจจากร้านค้าชั้นนำบน Sitepow Store
                  </p>

                  <div className="mt-6">
                    <Button
                      variant="ghost"
                      className="group/btn w-full flex-wrap justify-end gap-2 px-0 hover:bg-transparent"
                      asChild
                    >
                      <Link
                        href={`https://${store.slug}.sitepow.store`}
                        target="_blank"
                      >
                        <span className="text-primary text-sm font-semibold">
                          เยี่ยมชมเว็บไซต์
                        </span>
                        <div className="rounded-full p-1.5 transition-transform group-hover/btn:translate-x-1">
                          <IconArrowUpRight className="text-primary size-4" />
                        </div>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
    </SectionContainer>
  )
}
