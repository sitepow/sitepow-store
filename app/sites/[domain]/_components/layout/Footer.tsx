import Image from 'next/image'
import Link from 'next/link'

import { Plan } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'

import { ProtectedByBrand } from '@/components/ProtectedByBrand'
import { StoreLogo } from '@/components/StoreLogo'

export function StoreFooter() {
  const { store } = useStoreData()
  const currentYear = new Date().getFullYear()

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
      className="bg-background border-border text-foreground border-t"
      style={{ '--brand-color': store?.primaryColor } as React.CSSProperties}
    >
      <div className="container mx-auto px-5 py-12 sm:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="max-w-sm">
            {store?.logo && <StoreLogo image={store?.logo} />}
            {!store?.logo && <StoreLogo />}
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
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="mb-4 font-bold">ที่ตั้งร้าน</h3>
            <div className="border-border mb-4 overflow-hidden rounded-lg border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3877.545199616017!2d100.64771637583688!3d13.56543990263677!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x311d60c41094056b%3A0x678b667e452a2305!2sBang%20Pu%20Recreation%20Center!5e0!3m2!1sen!2sth!4v1720573881476!5m2!1sen!2sth"
                width="100%"
                height="200"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-sm leading-relaxed opacity-60">
              123/45 ถนนสุขุมวิท ตำบลบางปู <br />
              อำเภอเมือง จังหวัดสมุทรปราการ 10280
            </p>
            <a
              href="#"
              className="mt-3 inline-block text-sm font-medium text-(--brand-color) hover:underline"
            >
              📍 ดูแผนที่บน Google Maps
            </a>
          </div>
          <div>
            <h3 className="mb-4 font-bold">เวลาทำการ</h3>
            <div className="space-y-1 text-sm opacity-60">
              <p>จันทร์ - ศุกร์: 09:00 - 18:00 น.</p>
              <p>เสาร์ - อาทิตย์: 10:00 - 17:00 น.</p>
              <p className="pt-2 text-(--brand-color)">
                หยุดทุกวันหยุดนักขัตฤกษ์
              </p>
            </div>
          </div>
        </div>
        <div className="border-border mt-12 flex flex-col items-center justify-between gap-2.5 border-t pt-8 opacity-60 md:flex-row">
          <p className="text-sm">
            © {currentYear} Sitepow. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy-policy" className="hover:underline">
              นโยบายความเป็นส่วนตัว
            </Link>
            <Link href="/refund-return-policy" className="hover:underline">
              ข้อตกลง และเงื่อนไข
            </Link>
          </div>
        </div>
      </div>
      {store?.plan === Plan.FREE && <ProtectedByBrand />}
    </footer>
  )
}
