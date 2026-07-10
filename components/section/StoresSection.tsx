'use client'

import Image from 'next/image'
import Link from 'next/link'

import { useLandingStores } from '@/actions/hooks/store'
import { FALLBACK_IMAGE } from '@/constants/system'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useLandingImages } from '@/hooks/use-landing-images'
import { useSession } from '@/hooks/use-session'
import { getClientAuthUrl } from '@/utils/auth'
import { IconArrowUpRight, IconPlus } from '@tabler/icons-react'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { ActionRequiredAlert } from '../ActionRequiredAlert'

export function StoresSection() {
  const isMounted = useIsMounted()
  const { currentImage } = useLandingImages({ imageFolder: 'shelf' })

  const { data: stores = [], isLoading } = useLandingStores()
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
              <Image
                key={currentImage}
                className="animate-ken-burns fade-in relative size-full bg-cover bg-center object-cover object-center duration-1000"
                src={currentImage ?? ''}
                width={800}
                height={800}
                alt="store-preview-image"
              />
            </div>
            <CardContent className="flex flex-1 flex-col pb-5">
              <h3 className="mb-5 line-clamp-2 text-xl font-bold sm:text-2xl">
                {store.name}
              </h3>
              <ActionRequiredAlert
                title="ปิดการค้นหา"
                description="เนื่องจากเป็นร้านค้าตัวอย่าง เราจึงปิดการทำงานของ Search Engine
                  เพื่อป้องกันไม่ให้ข้อมูลสินค้าในร้านตัวอย่างไปปรากฏในการค้นหาจริงของลูกค้า"
              />
              <div className="mt-6 flex items-end justify-end">
                <Button variant="outline" asChild>
                  <Link
                    href={`https://${store.slug}.sitepow.store`}
                    target="_blank"
                  >
                    เยี่ยมชมเว็บไซต์
                    <IconArrowUpRight className="size-4" />
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
          <Card
            style={{
              backgroundImage: `url('${FALLBACK_IMAGE}')`,
            }}
            className="group hover:border-primary/50 flex h-full cursor-pointer items-center justify-center border-dashed bg-center transition-colors"
          >
            <CardContent className="flex h-full w-full flex-col items-center justify-center p-10 text-center text-white">
              <div className="rounded-full border border-dashed p-4">
                <IconPlus className="size-10 stroke-1" />
              </div>
              <h3 className="mt-6 text-xl font-bold sm:text-2xl">
                สร้างร้านค้าของคุณ
              </h3>
              <p className="mt-2 text-lg opacity-60">
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
