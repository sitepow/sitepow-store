import React from 'react'

import {
  IconBox,
  IconCheck,
  IconCreditCard,
  IconFileInvoice,
  IconFlame,
  IconLayoutDashboard,
  IconPlus,
  IconQrcode,
  IconSearch,
  IconShoppingCart,
  IconSparkles,
  IconTrendingUp,
  IconUsers,
} from '@tabler/icons-react'

export function DashboardMockupContent() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-950 font-sans text-xs text-slate-200 select-none">
      {/* Top Navbar */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary flex size-7 items-center justify-center rounded-lg font-bold text-white shadow-xs">
            S
          </div>
          <span className="font-semibold tracking-tight text-white">
            SitePow Store Admin
          </span>
          <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 sm:inline">
            ● ระบบออนไลน์ 0% GP
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden h-7 items-center gap-2 rounded-md border border-slate-800 bg-slate-950/80 px-2.5 text-slate-400 md:flex">
            <IconSearch size={13} />
            <span className="text-[11px]">ค้นหาออเดอร์, สต็อก, สินค้า...</span>
          </div>
          <button className="bg-primary flex h-7 items-center gap-1 rounded-md px-2.5 text-[11px] font-medium text-white shadow-xs">
            <IconPlus size={13} />
            <span>เพิ่มสินค้า (AI)</span>
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="hidden w-44 shrink-0 flex-col border-r border-slate-800 bg-slate-900/40 p-2.5 md:flex">
          <div className="space-y-1">
            <div className="bg-primary/15 text-primary flex items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium">
              <IconLayoutDashboard size={15} />
              <span>ภาพรวมร้านค้า</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:text-white">
              <IconShoppingCart size={15} />
              <span>คำสั่งซื้อ (Orders)</span>
              <span className="bg-primary/20 py-0.2 text-primary ml-auto rounded-full px-1.5 text-[9px]">
                12
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:text-white">
              <IconBox size={15} />
              <span>จัดการสต็อก</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:text-white">
              <IconQrcode size={15} />
              <span>POS หน้าร้าน</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:text-white">
              <IconSparkles size={15} className="text-amber-400" />
              <span>AI เช็คสลิปอัตโนมัติ</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:text-white">
              <IconUsers size={15} />
              <span>สมาชิกลูกค้า (CRM)</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-slate-400 hover:text-white">
              <IconFileInvoice size={15} />
              <span>พิมพ์ใบปะหน้าขนส่ง</span>
            </div>
          </div>
        </div>

        {/* Content View */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>ยอดขายวันนี้</span>
                <IconTrendingUp size={15} className="text-emerald-400" />
              </div>
              <div className="mt-1 text-base font-bold text-white sm:text-lg">
                ฿48,920
              </div>
              <span className="text-[10px] text-emerald-400">
                +18.4% จากเมื่อวาน
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>คำสั่งซื้อใหม่</span>
                <IconShoppingCart size={15} className="text-primary" />
              </div>
              <div className="mt-1 text-base font-bold text-white sm:text-lg">
                128 ออเดอร์
              </div>
              <span className="text-primary text-[10px] font-medium">
                รอจัดส่ง 12 รายการ
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>AI ตรวจสลิปสำเร็จ</span>
                <IconCheck size={15} className="text-emerald-400" />
              </div>
              <div className="mt-1 text-base font-bold text-white sm:text-lg">
                100% ถูกต้อง
              </div>
              <span className="text-[10px] text-slate-400">
                ไม่ต้องตรวจมือทีละใบ
              </span>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="flex items-center justify-between text-slate-400">
                <span>ค่าคอมมิชชั่น GP</span>
                <IconFlame size={15} className="text-amber-400" />
              </div>
              <div className="mt-1 text-base font-bold text-emerald-400 sm:text-lg">
                ฿0 (0% GP)
              </div>
              <span className="text-[10px] text-slate-400">
                กำไรเข้าบัญชีเต็มๆ
              </span>
            </div>
          </div>

          {/* Orders & POS live split */}
          <div className="grid gap-3 lg:grid-cols-3">
            {/* Live Orders Table */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 lg:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-semibold text-white">
                  คำสั่งซื้อล่าสุด (Omnichannel)
                </span>
                <span className="text-[10px] text-slate-400">
                  อัปเดตแบบ Real-time
                </span>
              </div>
              <div className="space-y-1.5">
                {[
                  {
                    id: 'ORD-9821',
                    channel: 'หน้าร้าน POS',
                    price: '฿1,450',
                    status: 'ชำระสำเร็จ',
                    time: '1 นาทีที่แล้ว',
                    type: 'PromptPay QR',
                  },
                  {
                    id: 'ORD-9820',
                    channel: 'เว็บออนไลน์',
                    price: '฿3,200',
                    status: 'จัดส่งแล้ว',
                    time: '5 นาทีที่แล้ว',
                    type: 'Credit Card',
                  },
                  {
                    id: 'ORD-9819',
                    channel: 'เว็บออนไลน์',
                    price: '฿890',
                    status: 'AI ตรวจสลิปแล้ว',
                    time: '12 นาทีที่แล้ว',
                    type: 'โอนผ่านบัญชี',
                  },
                  {
                    id: 'ORD-9818',
                    channel: 'หน้าร้าน POS',
                    price: '฿2,100',
                    status: 'ชำระสำเร็จ',
                    time: '20 นาทีที่แล้ว',
                    type: 'PromptPay QR',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/70 p-2 text-[11px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-medium">
                        {item.id}
                      </span>
                      <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-300">
                        {item.channel}
                      </span>
                      <span className="hidden text-slate-400 sm:inline">
                        {item.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">
                        {item.price}
                      </span>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick POS & Channels */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <div className="mb-2 font-semibold text-white">
                ช่องทางชำระเงินที่เปิดอยู่
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/70 p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-blue-600/20 font-bold text-blue-400">
                      QR
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-white">
                        PromptPay QR
                      </div>
                      <div className="text-[9px] text-slate-400">
                        เงินเข้าตรงบัญชีทันที
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400">
                    เปิดใช้งาน
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/70 p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-purple-600/20 text-purple-400">
                      <IconCreditCard size={14} />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-white">
                        Stripe / บัตรเครดิต
                      </div>
                      <div className="text-[9px] text-slate-400">
                        รองรับบัตรทั่วโลก
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400">
                    เปิดใช้งาน
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-slate-800/60 bg-slate-950/70 p-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-md bg-amber-600/20 text-amber-400">
                      <IconSparkles size={14} />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-white">
                        AI Smart Slip OCR
                      </div>
                      <div className="text-[9px] text-slate-400">
                        ดักสลิปปลอมอัตโนมัติ
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-emerald-400">
                    ทำงาน 24 ชม.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
