'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import QRCode from 'qrcode'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency, formatDecimal, formatNumber } from '@/utils/formatting/number'
import { formatThaiBahtText } from '@/utils/formatting/thai-baht-text'
import { BarcodeSvg } from '../order/documents/BarcodeSvg'

export interface PurchaseOrderData {
  id: string
  orderNumber: string
  title?: string | null
  status: string
  supplier?: string | null
  buyerName?: string | null
  note?: string | null
  totalEstimatedAmount: number
  totalActualAmount: number
  targetDate?: string | Date | null
  createdAt: string | Date
  items: Array<{
    id: string
    productId?: string | null
    variantId?: string | null
    title: string
    variantTitle?: string | null
    sku?: string | null
    image?: string | null
    quantity: number
    costPrice?: number | null
    unit?: string | null
    isPurchased: boolean
    purchasedQty?: number | null
    actualCostPrice?: number | null
    note?: string | null
  }>
  store?: {
    name?: string
    phone?: string | null
    email?: string | null
    logo?: string | null
    taxId?: string | null
    branches?: Array<{
      address?: string | null
      subDistrict?: string | null
      district?: string | null
      province?: string | null
      postcode?: string | null
    }>
  } | null
}

interface PurchaseOrderDocumentProps {
  po: PurchaseOrderData
  showSignatures?: boolean
}

export function PurchaseOrderDocument({
  po,
  showSignatures = true,
}: PurchaseOrderDocumentProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [webUrl, setWebUrl] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/procurement/${po.id}`
      setWebUrl(url)
      QRCode.toDataURL(url, { width: 140, margin: 1 }, (err, dataUrl) => {
        if (!err && dataUrl) {
          setQrCodeUrl(dataUrl)
        }
      })
    }
  }, [po.id])

  const store = po.store
  const branch = store?.branches?.[0]
  const branchAddress = branch
    ? [
        branch.address,
        branch.subDistrict ? `ต.${branch.subDistrict}` : '',
        branch.district ? `อ.${branch.district}` : '',
        branch.province ? `จ.${branch.province}` : '',
        branch.postcode,
      ]
        .filter(Boolean)
        .join(' ')
    : ''

  const totalQuantity = po.items.reduce((sum, it) => sum + (it.quantity || 1), 0)
  const totalEstimatedAmount = Number(po.totalEstimatedAmount || 0)

  return (
    <div className="w-full bg-white text-neutral-900 p-8 font-sans print:p-0 print:text-black">
      <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-4 mb-4">
        <div className="flex items-start gap-4 max-w-[62%]">
          {store?.logo && (
            <div className="relative size-16 shrink-0 rounded border border-neutral-200 overflow-hidden bg-neutral-50 print:border-neutral-400">
              <Image
                src={store.logo}
                alt={store.name || 'Store Logo'}
                fill
                className="object-contain p-1"
                unoptimized
              />
            </div>
          )}
          <div className="space-y-0.5 text-xs text-neutral-700 leading-tight">
            <h1 className="text-base font-bold text-neutral-900 leading-tight">
              {store?.name || 'ร้านค้า'}
            </h1>
            {store?.taxId && (
              <p className="font-semibold text-neutral-900">
                เลขประจำตัวผู้เสียภาษี: {store.taxId}
              </p>
            )}
            {branchAddress && (
              <p className="text-neutral-600 leading-snug">
                ที่อยู่: {branchAddress}
              </p>
            )}
            <div className="flex flex-wrap gap-x-3 text-neutral-600 pt-0.5">
              {store?.phone && <span>โทร: {store.phone}</span>}
              {store?.email && <span>อีเมล: {store.email}</span>}
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="inline-block bg-neutral-900 text-white px-3 py-1 rounded text-center mb-2 print:bg-neutral-900 print:text-white">
            <div className="text-sm font-bold tracking-wide">
              ใบสั่งซื้อสินค้า / รายการซื้อของ
            </div>
            <div className="text-[10px] font-medium tracking-wider uppercase text-neutral-300">
              PURCHASE ORDER / BUYING LIST
            </div>
          </div>

          <div className="space-y-0.5 text-xs">
            <p className="font-semibold text-neutral-900">
              <span className="text-neutral-500 font-normal">เลขที่ / No: </span>
              {po.orderNumber}
            </p>
            <p className="text-neutral-700">
              <span className="text-neutral-500 font-normal">วันที่สั่งซื้อ: </span>
              {formatDateTime(po.createdAt)}
            </p>
            {po.targetDate && (
              <p className="text-neutral-700 font-medium">
                <span className="text-neutral-500 font-normal">วันที่นัดซื้อ: </span>
                {formatDateTime(po.targetDate)}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-3 border border-neutral-300 rounded p-3 mb-4 text-xs">
        <div className="col-span-8 space-y-1">
          <h2 className="font-bold text-neutral-900 mb-1 border-b pb-0.5 text-xs">
            รายละเอียดการจัดซื้อ (Procurement Details)
          </h2>
          <div className="grid grid-cols-2 gap-2 text-neutral-700">
            <div>
              <p>
                <span className="font-semibold text-neutral-900">หัวข้อ: </span>
                {po.title || 'สั่งซื้อสินค้า / เติมสต็อก'}
              </p>
              <p>
                <span className="font-semibold text-neutral-900">แหล่งซื้อ/ร้านส่ง: </span>
                <span className="font-bold text-neutral-900">
                  {po.supplier || 'ไม่ระบุ (ร้านค้าทั่วไป)'}
                </span>
              </p>
            </div>
            <div>
              <p>
                <span className="font-semibold text-neutral-900">ผู้จัดซื้อ: </span>
                {po.buyerName || 'พนักงานจัดซื้อ'}
              </p>
              <p>
                <span className="font-semibold text-neutral-900">สถานะ: </span>
                <span className="font-semibold text-neutral-900">
                  {po.status === 'COMPLETED'
                    ? 'ซื้อครบถ้วนแล้ว'
                    : po.status === 'PARTIAL'
                      ? 'ซื้อแล้วบางส่วน'
                      : 'รอดำเนินการซื้อ'}
                </span>
              </p>
            </div>
          </div>
          {po.note && (
            <p className="text-neutral-600 pt-1 text-[11px] leading-snug">
              <span className="font-semibold text-neutral-800">หมายเหตุ: </span>
              {po.note}
            </p>
          )}
        </div>

        <div className="col-span-4 border-l border-neutral-200 pl-3 flex items-center gap-3">
          {qrCodeUrl && (
            <div className="shrink-0 text-center">
              <img
                src={qrCodeUrl}
                alt="Scan to open checklist"
                className="size-20 border border-neutral-300 p-0.5 rounded shadow-2xs"
              />
            </div>
          )}
          <div className="text-[10px] text-neutral-600 leading-tight space-y-1">
            <span className="font-bold text-neutral-900 text-xs block">
              📱 แสกนเปิดเช็คลิสต์
            </span>
            <p>สแกน QR ด้วยกล้องมือถือ เพื่อเปิดติ๊กรายการที่ซื้อแล้วบนเว็บ</p>
            {webUrl && (
              <a
                href={webUrl}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-mono truncate block text-[9px]"
              >
                เปิดลิงก์บนเว็บ
              </a>
            )}
          </div>
        </div>
      </div>

      <table className="w-full text-xs border-collapse border border-neutral-300 mb-4">
        <thead>
          <tr className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-300 print:bg-neutral-200">
            <th className="py-2 px-2 text-center border-r border-neutral-300 w-10">ลำดับ</th>
            <th className="py-2 px-2 text-center border-r border-neutral-300 w-14">รูป</th>
            <th className="py-2 px-3 text-left border-r border-neutral-300">รายการสินค้า / ตัวเลือก</th>
            <th className="py-2 px-2.5 text-center border-r border-neutral-300 w-24">รหัส SKU</th>
            <th className="py-2 px-2.5 text-center border-r border-neutral-300 w-20">จำนวนที่ซื้อ</th>
            <th className="py-2 px-3 text-right border-r border-neutral-300 w-24">ราคาประมาณ</th>
            <th className="py-2 px-3 text-right border-r border-neutral-300 w-24">รวมประมาณ</th>
            <th className="py-2 px-2 text-center w-28">ตรวจซื้อ [ ✓ ]</th>
          </tr>
        </thead>
        <tbody>
          {po.items.map((item, index) => {
            const lineTotal = (Number(item.costPrice) || 0) * (item.quantity || 1)
            return (
              <tr
                key={item.id || index}
                className="border-b border-neutral-200 text-neutral-800"
              >
                <td className="py-2 px-2 text-center border-r border-neutral-300 text-neutral-600 font-medium">
                  {index + 1}
                </td>
                <td className="py-1.5 px-1.5 text-center border-r border-neutral-300">
                  {item.image ? (
                    <div className="relative size-8 mx-auto rounded border border-neutral-200 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="size-8 mx-auto rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[8px] text-neutral-400">
                      -
                    </div>
                  )}
                </td>
                <td className="py-2 px-3 border-r border-neutral-300">
                  <div className="font-bold text-neutral-900">{item.title}</div>
                  {item.variantTitle && (
                    <div className="text-[11px] text-neutral-600">
                      ตัวเลือก: {item.variantTitle}
                    </div>
                  )}
                  {item.note && (
                    <div className="text-[10px] text-neutral-500 italic">
                      โน้ต: {item.note}
                    </div>
                  )}
                </td>
                <td className="py-2 px-2.5 text-center border-r border-neutral-300 font-mono text-[11px] text-neutral-600">
                  {item.sku || '-'}
                </td>
                <td className="py-2 px-2.5 text-center border-r border-neutral-300 font-bold text-neutral-900">
                  {item.quantity} {item.unit || 'ชิ้น'}
                </td>
                <td className="py-2 px-3 text-right border-r border-neutral-300">
                  {formatDecimal(item.costPrice || 0)}
                </td>
                <td className="py-2 px-3 text-right border-r border-neutral-300 font-medium">
                  {formatDecimal(lineTotal)}
                </td>
                <td className="py-2 px-2 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <span
                      className={`inline-block size-4.5 border-2 rounded ${
                        item.isPurchased
                          ? 'bg-neutral-900 border-neutral-900 text-white text-[10px] leading-tight text-center font-bold'
                          : 'border-neutral-500'
                      }`}
                    >
                      {item.isPurchased ? '✓' : ''}
                    </span>
                    {item.isPurchased && (
                      <span className="text-[10px] text-emerald-700 font-bold">
                        ซื้อแล้ว
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <div className="flex items-start justify-between gap-4 mb-6 print-avoid-break">
        <div className="flex-1 border border-neutral-300 rounded p-3 text-xs space-y-2">
          <div>
            <span className="font-semibold text-neutral-700">
              งบประมาณประมาณการรวม (ตัวอักษร):
            </span>
            <p className="font-bold text-neutral-900 mt-0.5 text-sm bg-neutral-50 p-1.5 rounded border border-neutral-200">
              {formatThaiBahtText(totalEstimatedAmount)}
            </p>
          </div>
          <div className="text-[10px] text-neutral-500 pt-1 leading-snug">
            <p>* ราคาสินค้าเป็นราคาประมาณการ อาจมีการเปลี่ยนแปลงตามราคาจริงที่จัดซื้อ</p>
            <p>* สามารถแสกน QR Code เพื่อเปิดอัปเดตราคาจริงและติ๊กรายการซื้อแล้วผ่านโทรศัพท์มือถือ</p>
          </div>
        </div>

        <div className="w-72 border border-neutral-300 rounded overflow-hidden text-xs">
          <div className="flex justify-between px-3 py-1.5 border-b border-neutral-200 text-neutral-700">
            <span>จำนวนรายการทั้งหมด</span>
            <span className="font-medium text-neutral-900">
              {po.items.length} รายการ
            </span>
          </div>

          <div className="flex justify-between px-3 py-1.5 border-b border-neutral-200 text-neutral-700">
            <span>จำนวนชิ้นสินค้ารวม</span>
            <span className="font-medium text-neutral-900">
              {formatNumber(totalQuantity)} ชิ้น
            </span>
          </div>

          <div className="flex justify-between px-3 py-2 bg-neutral-900 text-white font-bold text-sm print:bg-neutral-900 print:text-white">
            <span>งบประมาณประมาณการรวม</span>
            <span>{formatCurrency(totalEstimatedAmount)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end pt-3 border-t border-neutral-300 print-avoid-break">
        <div className="text-left">
          <BarcodeSvg
            value={po.orderNumber}
            height={36}
            moduleWidth={1.3}
            showText={true}
          />
        </div>

        {showSignatures && (
          <div className="grid grid-cols-2 gap-8 text-xs text-center">
            <div className="space-y-8">
              <p className="font-medium text-neutral-800">ผู้ขอสั่งซื้อ / Prepared by</p>
              <div className="border-b border-neutral-400 w-36 mx-auto" />
              <p className="text-[10px] text-neutral-500">วันที่ ..... / ..... / .........</p>
            </div>
            <div className="space-y-8">
              <p className="font-medium text-neutral-800">
                ผู้อนุมัติ / ผู้ตรวจรับสินค้า
              </p>
              <div className="border-b border-neutral-400 w-36 mx-auto" />
              <p className="text-[10px] text-neutral-500">วันที่ ..... / ..... / .........</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

