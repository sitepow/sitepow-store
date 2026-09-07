import {
  IconCircleCheck,
  IconPackage,
  IconPrinter,
  IconSparkles,
} from '@tabler/icons-react'

export function ScannerMobileMockupContent() {
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-slate-950 font-sans text-white select-none">
      <div className="flex h-16 shrink-0 flex-col justify-end border-b border-slate-800/80 bg-slate-900/80 px-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconSparkles size={16} className="text-amber-400" />
            <span className="text-[12px] font-semibold tracking-tight">
              AI Smart Slip & Shipping
            </span>
          </div>
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            ระบบทำงานอัตโนมัติ
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <div className="space-y-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-3.5">
          <div className="flex items-center gap-2 text-emerald-400">
            <IconCircleCheck size={18} />
            <span className="text-xs font-bold">
              สลิปถูกต้อง 100% (ตรวจผ่าน AI)
            </span>
          </div>
          <div className="space-y-1 rounded-lg border border-emerald-500/20 bg-slate-950/70 p-2 text-[11px]">
            <div className="flex justify-between text-slate-400">
              <span>ยอดเงินที่โอน:</span>
              <span className="font-bold text-white">฿2,450.00</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>เวลาที่โอน:</span>
              <span className="text-slate-300">11:42:15 น. (วันนี้)</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>สถานะสลิป:</span>
              <span className="font-medium text-emerald-400">
                ไม่พบการใช้สลิปซ้ำ
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <IconPackage size={16} className="text-primary" />
              <span>เตรียมพัสดุจัดส่ง</span>
            </div>
            <span className="text-[10px] text-slate-400">Flash Express</span>
          </div>
          <div className="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-2.5 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tracking No.</span>
              <span className="text-primary font-bold">TH09281726458</span>
            </div>
            <div className="text-[10px] text-slate-400">
              ผู้รับ: คุณกิตติศักดิ์ พ. (081-xxx-xxxx)
            </div>
          </div>
          <button className="flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 text-xs font-medium text-white hover:bg-slate-700">
            <IconPrinter size={15} />
            <span>พิมพ์ใบปะหน้าพัสดุ (Thermal)</span>
          </button>
        </div>
      </div>

      <div className="shrink-0 border-t border-slate-800 bg-slate-900/90 p-3 text-center">
        <div className="text-[10px] text-slate-400">
          เชื่อมต่อกับเครื่องพิมพ์ความร้อนและกล้องสแกนทันที
        </div>
      </div>
    </div>
  )
}
