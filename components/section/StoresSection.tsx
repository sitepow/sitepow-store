'use client'

import Link from 'next/link'

import { useLandingStores } from '@/actions/hooks/store'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { getClientAuthUrl } from '@/utils/auth'
import { IconArrowUpRight, IconPlus } from '@tabler/icons-react'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StoresSection() {
  const isMounted = useIsMounted()
  const { data: stores = [], isLoading } = useLandingStores(6)
  const { isAuthenticated } = useSession()

  const registerHref = isMounted
    ? getClientAuthUrl({ path: 'register', role: UserRole.MERCHANT })
    : '#'

  if (isLoading && stores?.length === 0) {
    return (
      <SectionContainer>
        <SectionHeader
          title="ร้านค้าที่ไว้วางใจเรา"
          description="สัมผัสประสบการณ์ร้านค้าที่รันบนโครงสร้างพื้นฐานระดับสูง"
        />
        <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col overflow-hidden p-0">
              <Skeleton className="h-52 w-full rounded-none" />
            </Card>
          ))}
        </div>
      </SectionContainer>
    )
  }

  const targetBoxes = 6
  const storeDisplayCount = Math.min(stores.length, targetBoxes - 1)
  const displayedStores = stores.slice(0, storeDisplayCount)

  return (
    <SectionContainer>
      <SectionHeader
        title="ร้านค้าที่ไว้วางใจเรา"
        description="สัมผัสประสบการณ์ร้านค้าที่รันบนโครงสร้างพื้นฐานระดับสูง"
      />

      <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {displayedStores.map((store) => (
          <Card
            key={store.id}
            className="group from-background relative flex h-full flex-col overflow-hidden bg-linear-to-t p-0 transition-all"
          >
            <div className="bg-muted relative h-48 w-full overflow-hidden">
              <img
                className="size-full object-cover object-center"
                src="https://plus.unsplash.com/premium_photo-1679003074247-9c70a2822cb6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              />
              {/* <div className="from-background/80 absolute inset-0 bg-linear-to-t to-transparent" /> */}
              {/* <div className="text-muted-foreground/30 flex h-full items-center justify-center">
                <span className="text-sm font-medium tracking-widest uppercase">
                  Preview
                </span>
              </div> */}
            </div>

            <CardContent className="flex flex-1 flex-col pb-5">
              <h3 className="line-clamp-2 text-xl font-bold sm:text-2xl">
                {store.name}
              </h3>
              <p className="mt-1 text-lg leading-relaxed opacity-60">
                ระบบจัดการออเดอร์และสต็อกที่ครบวงจร
                ได้รับความไว้วางใจจากร้านค้าชั้นนำบน Sitepow Store
              </p>

              <div className="mt-6 flex flex-1 items-end">
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

        {isLoading &&
          Array.from({
            length: Math.max(0, targetBoxes - 1 - displayedStores.length),
          }).map((_, i) => (
            <Card
              key={`skeleton-${i}`}
              className="flex h-full flex-col overflow-hidden p-0"
            >
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="flex flex-1 flex-col space-y-4 pt-4 pb-5">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <div className="mt-6 flex flex-1 items-end">
                  <Skeleton className="h-10 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}

        {!isLoading && (
          <Card className="group hover:border-primary/50 hover:bg-muted/50 flex h-full cursor-pointer items-center justify-center border-dashed transition-colors">
            <CardContent className="flex h-full w-full flex-col items-center justify-center p-10 text-center">
              <div className="text-muted-foreground group-hover:text-primary rounded-full border border-dashed p-4 transition-colors">
                <IconPlus className="size-10 stroke-1" />
              </div>
              <h3 className="text-muted-foreground group-hover:text-foreground mt-6 text-xl font-bold transition-colors sm:text-2xl">
                สร้างร้านค้าของคุณ
              </h3>
              <p className="text-muted-foreground group-hover:text-foreground mt-2 text-lg opacity-60 transition-colors">
                เริ่มต้นสร้างประสบการณ์การช้อปปิ้งที่ยอดเยี่ยมด้วย Sitepow Store
              </p>
              <div className="mt-8">
                <Button size="lg" className="px-10" asChild>
                  <Link
                    href={
                      isAuthenticated
                        ? '/merchant/store-settings'
                        : registerHref
                    }
                  >
                    เริ่มใช้งานฟรี
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </SectionContainer>
  )
}
