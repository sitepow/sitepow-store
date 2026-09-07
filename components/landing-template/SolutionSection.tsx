'use client'

import { IconCpu, IconFlame, IconQrcode } from '@tabler/icons-react'

import { Safari } from '@/components/magicui/safari'

export function SolutionSection() {
  return (
    <section
      id="solution"
      className="bg-muted/40 border-border/40 relative w-full border-y py-16 md:py-24"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-4 pb-6 text-center">
          <h2 className="text-primary text-sm font-semibold">ทางออกของปัญหา</h2>
          <h3 className="text-foreground text-3xl font-bold tracking-tight text-balance sm:text-4xl md:text-5xl">
            ปลดล็อกศักยภาพธุรกิจ ด้วยระบบจัดการร้านค้าอัจฉริยะ
          </h3>
          <p className="text-muted-foreground text-base sm:text-lg">
            Sitepow Store ออกแบบมาเพื่อเป็นซอฟต์แวร์คู่ใจของพ่อค้าแม่ค้ายุคใหม่
            รวมทุกเครื่องมือไว้ในที่เดียว
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="group border-border/80 bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
            <div>
              <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
                <IconQrcode size={22} />
              </div>
              <h4 className="text-card-foreground text-xl font-bold">
                ระบบ POS & สต็อกซิงก์ Real-time
              </h4>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                เปิดบิลหน้าร้านได้ทันทีผ่านมือถือหรือคอมพิวเตอร์
                สต็อกสินค้าจะตัดพร้อมกันกับหน้าร้านออนไลน์ ป้องกันการขายของเกิน
              </p>
            </div>

            <div className="border-border relative mt-6 overflow-hidden rounded-xl border shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
              <Safari url="pos.sitepow.store" mode="simple" className="w-full">
                <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
              </Safari>
            </div>
          </div>

          <div className="group border-border/80 bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6">
            <div>
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                <IconCpu size={22} />
              </div>
              <h4 className="text-card-foreground text-xl font-bold">
                AI ตรวจสอบสลิปอัตโนมัติ
              </h4>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                ตรวจจับสลิปปลอม สลิปตัดต่อ และสลิปที่นำมาใช้ซ้ำได้ 100%
                ตรวจสอบยอดเงินและบัญชีถูกต้อง ระบบอนุมัติออเดอร์ทันที 24 ชม.
              </p>
            </div>

            <div className="border-border relative mt-6 overflow-hidden rounded-xl border shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
              <Safari url="ai.sitepow.store" mode="simple" className="w-full">
                <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
              </Safari>
            </div>
          </div>

          <div className="group border-border/80 bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-6 md:col-span-2 lg:col-span-1">
            <div>
              <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
                <IconFlame size={22} />
              </div>
              <h4 className="text-card-foreground text-xl font-bold">
                ขายฟรี 0% GP รับเงินเข้าบัญชีตรง
              </h4>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                เงินค่าสินค้าของลูกค้าโอนตรงเข้าบัญชีธนาคารของคุณทันที
                ไม่มีหักเปอร์เซ็นต์ค่าหัวคิว หมุนเวียนเงินคล่องตัวได้ในทุกวัน
              </p>
            </div>

            <div className="border-border relative mt-6 overflow-hidden rounded-xl border shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
              <Safari url="app.sitepow.store" mode="simple" className="w-full">
                <div className="size-full bg-neutral-200 dark:bg-neutral-800" />
              </Safari>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
