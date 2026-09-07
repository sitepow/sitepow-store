import React from 'react'

import {
  IconCheck,
  IconClock,
  IconPlus,
  IconQrcode,
  IconReceipt,
  IconSearch,
  IconShoppingCart,
  IconSparkles,
} from '@tabler/icons-react'

export function PosMobileMockupContent() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-950 font-sans text-white select-none">
      {/* Top Mobile Status Header */}
      <div className="flex h-16 shrink-0 flex-col justify-end border-b border-slate-800/80 bg-slate-900/80 px-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[12px] font-semibold tracking-tight">
              SitePow Mobile POS
            </span>
          </div>
          <span className="bg-primary/20 text-primary rounded-full px-2 py-0.5 text-[10px] font-medium">
            ตัดสต็อก Real-time
          </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {/* Search & Category */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
          <IconSearch size={14} />
          <span>ค้นหาสินค้า / ยิงบาร์โค้ด...</span>
        </div>

        {/* Quick Cart summary */}
        <div className="border-primary/30 bg-primary/10 rounded-xl border p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300">
              บิลปัจจุบัน (โต๊ะ 3 / หน้าร้าน)
            </span>
            <span className="text-primary font-bold">3 รายการ</span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-[11px] text-slate-400">
              ยอดรวมสุทธิ (0% GP)
            </span>
            <span className="text-lg font-bold text-white">฿1,890</span>
          </div>
        </div>

        {/* Product Items */}
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-slate-400">
            รายการสินค้าขายดี
          </div>
          {[
            {
              name: 'เสื้อยืด Cotton Oversize',
              stock: 'สต็อก: 42 ตัว',
              price: '฿490',
              tag: 'Physical',
            },
            {
              name: 'VIP Game Key Card 30 Days',
              stock: 'คีย์คงเหลือ: 15 คีย์',
              price: '฿650',
              tag: 'Digital',
            },
            {
              name: 'แก้วกาแฟพรีเมียม Limited',
              stock: 'สต็อก: 8 ใบ',
              price: '฿750',
              tag: 'Physical',
            },
          ].map((prod, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/50 p-2.5"
            >
              <div>
                <div className="text-xs font-medium text-white">
                  {prod.name}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                  <span>{prod.stock}</span>
                  <span className="rounded bg-slate-800 px-1 text-[9px] text-slate-300">
                    {prod.tag}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-400">
                  {prod.price}
                </span>
                <button className="bg-primary flex size-6 items-center justify-center rounded-lg text-white">
                  <IconPlus size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom POS Quick Actions */}
      <div className="shrink-0 space-y-2 border-t border-slate-800 bg-slate-900/90 p-3">
        <button className="bg-primary flex h-10 w-full items-center justify-center gap-2 rounded-xl text-xs font-bold text-white shadow-md">
          <IconQrcode size={16} />
          <span>สร้าง PromptPay QR รับเงิน (฿1,890)</span>
        </button>
        <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
          <IconCheck size={12} className="text-emerald-400" />
          <span>เงินเข้าบัญชีทันที ไม่หักค่าธรรมเนียม GP</span>
        </div>
      </div>
    </div>
  )
}
