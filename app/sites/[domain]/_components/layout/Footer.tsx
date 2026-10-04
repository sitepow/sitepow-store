import Image from 'next/image'
import Link from 'next/link'

import { useBranches } from '@/actions/store/branch/hooks'
import { Plan } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { OpeningHours } from '@/types/branch'

import { LogoBrandText } from '@/components/brand/LogoBrandText'
import { ProtectedByBrand } from '@/components/brand/ProtectedByBrand'
import { StoreLogo } from '@/components/brand/StoreLogo'

export function StoreFooter() {
  const { store } = useStoreData()
  const currentYear = new Date().getFullYear()

  const { data: branchesData } = useBranches({ storeId: store?.id as string })
  const mainBranch =
    branchesData?.data.find((b) => b.isMain) || branchesData?.data[0]

  const renderOpeningHours = (openingHours: OpeningHours[]) => {
    if (!Array.isArray(openingHours)) {
      return null
    }

    return openingHours.map((row) => (
      <div key={row.day} className="flex flex-wrap justify-between gap-1">
        <span>{row.day}</span>
        <span>
          {!row.isOpen ? (
            <span className="text-primary">ปิดทำการ (ออนไลน์ปกติ)</span>
          ) : (
            `${row.open} - ${row.close}`
          )}
        </span>
      </div>
    ))
  }

  const socialLinks = [
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/meta/default.svg"
          alt="Meta"
          width={34}
          height={34}
        />
      ),
      href: '/',
      label: 'Facebook',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/instagram/default.svg"
          alt="Instagram"
          width={34}
          height={34}
        />
      ),
      href: '/',
      label: 'Instagram',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/tiktok/default.svg"
          alt="Tiktok"
          width={34}
          height={34}
        />
      ),
      href: '/',
      label: 'Tiktok',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/messenger/default.svg"
          alt="Messenger"
          width={34}
          height={34}
        />
      ),
      href: '/',
      label: 'Messenger',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/line/default.svg"
          alt="Line"
          width={34}
          height={34}
        />
      ),
      href: '/',
      label: 'Line',
    },
    {
      icon: (
        <Image
          src="https://thesvg.org/icons/discord/default.svg"
          alt="Discord"
          width={34}
          height={34}
        />
      ),
      href: '/',
      label: 'Discord',
    },
  ]

  return (
    <footer
      role="contentinfo"
      className="bg-background border-border text-foreground border-t"
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      <div className="container mx-auto px-5 py-12 sm:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="max-w-sm">
            {store?.logo ? (
              <StoreLogo image={store?.logo} />
            ) : (
              <LogoBrandText />
            )}
            <p className="mt-4 text-sm leading-relaxed opacity-60">
              {store?.description
                ? store?.description
                : 'เราคัดสรรสินค้าคุณภาพดีในราคาที่จับต้องได้ ช้อปง่าย ได้ของไว และตั้งใจดูแลทุกออเดอร์ให้ส่งถึงมือคุณอย่างปลอดภัย'}
            </p>
            <p className="mt-4 text-sm leading-relaxed opacity-60">
              อีเมล: {store?.email || '-'} เลขประจำตัวผู้เสียภาษี:{' '}
              {store?.taxId || '-'}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-5">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`ติดตามเราผ่านทาง ${social.label}`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          {(mainBranch?.address || mainBranch?.subDistrict) && (
            <div>
              <h3 className="mb-4 font-bold">ที่ตั้งร้าน (สาขาหลัก)</h3>
              {mainBranch?.mapUrl && (
                <div className="border-border mb-4 overflow-hidden rounded-lg border">
                  <iframe
                    src={mainBranch.mapUrl}
                    width="100%"
                    height="200"
                    title={`แผนที่สาขาหลัก ${store?.name || ''}`}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}
              <address className="not-italic text-sm leading-relaxed opacity-60">
                {mainBranch?.address} {mainBranch?.subDistrict}{' '}
                {mainBranch?.district} <br />
                {mainBranch?.province} {mainBranch?.postcode}
              </address>
            </div>
          )}
          {mainBranch?.openingHours &&
            Array.isArray(mainBranch.openingHours) && (
              <div>
                <h3 className="mb-4 font-bold">เวลาทำการ (หน้าร้าน)</h3>
                <div className="space-y-1 text-sm opacity-60">
                  {renderOpeningHours(
                    mainBranch.openingHours as OpeningHours[],
                  )}
                </div>
              </div>
            )}
        </div>
        <div className="border-border mt-12 flex flex-col items-center justify-between gap-2.5 border-t pt-8 opacity-60 md:flex-row">
          <p className="text-sm">
            © {currentYear} Sitepow. All rights reserved.
          </p>
          <nav aria-label="นโยบายและข้อกำหนด" className="flex gap-6 text-sm">
            <Link href="/privacy-policy" className="hover:underline">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/refund-return-policy" className="hover:underline">
              ข้อตกลง และเงื่อนไข
            </Link>
          </nav>
        </div>
      </div>
      {store?.plan === Plan.FREE && <ProtectedByBrand />}
    </footer>
  )
}
