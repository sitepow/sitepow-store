'use client'

import React from 'react'
import Image from 'next/image'
import { StoreDocumentInfo } from './types'

interface DocumentHeaderProps {
  titleThai: string
  titleEng: string
  documentNumber: string
  date: string
  subDateLabel?: string
  subDateValue?: string
  store: StoreDocumentInfo
  isCopy?: boolean
  showLogo?: boolean
}

export function DocumentHeader({
  titleThai,
  titleEng,
  documentNumber,
  date,
  subDateLabel,
  subDateValue,
  store,
  isCopy = false,
  showLogo = true,
}: DocumentHeaderProps) {
  return (
    <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-4 mb-4">
      {/* Store Information */}
      <div className="flex items-start gap-4 max-w-[62%]">
        {showLogo && store.logo && (
          <div className="relative size-16 shrink-0 rounded border border-neutral-200 overflow-hidden bg-neutral-50 print:border-neutral-400">
            <Image
              src={store.logo}
              alt={store.name}
              fill
              className="object-contain p-1"
              unoptimized
            />
          </div>
        )}
        <div className="space-y-0.5 text-xs text-neutral-700 leading-tight">
          <h1 className="text-base font-bold text-neutral-900 leading-tight">
            {store.name}
          </h1>
          {store.branchCode && (
            <p className="font-medium text-neutral-800">
              สาขา: {store.branchCode}
            </p>
          )}
          {store.taxId && (
            <p className="font-semibold text-neutral-900">
              เลขประจำตัวผู้เสียภาษีอากร: {store.taxId}
            </p>
          )}
          {store.address && (
            <p className="text-neutral-600 leading-snug">
              ที่อยู่: {store.address}
            </p>
          )}
          <div className="flex flex-wrap gap-x-3 text-neutral-600 pt-0.5">
            {store.phone && <span>โทร: {store.phone}</span>}
            {store.email && <span>อีเมล: {store.email}</span>}
          </div>
        </div>
      </div>

      {/* Document Title & Meta */}
      <div className="text-right shrink-0">
        <div className="inline-block bg-neutral-900 text-white px-3 py-1 rounded text-center mb-2 print:bg-neutral-900 print:text-white">
          <div className="text-sm font-bold tracking-wide">{titleThai}</div>
          <div className="text-[10px] font-medium tracking-wider uppercase text-neutral-300">
            {titleEng}
          </div>
        </div>

        <div className="text-[11px] font-semibold text-neutral-600 uppercase tracking-wider mb-1.5">
          {isCopy ? (
            <span className="inline-block px-2 py-0.5 border border-neutral-400 rounded text-neutral-700 bg-neutral-100">
              สำเนา / COPY
            </span>
          ) : (
            <span className="inline-block px-2 py-0.5 border border-neutral-900 rounded text-neutral-900 bg-neutral-50 font-bold">
              ต้นฉบับ / ORIGINAL
            </span>
          )}
        </div>

        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-neutral-900">
            <span className="text-neutral-500 font-normal">เลขที่ / No: </span>
            {documentNumber}
          </p>
          <p className="text-neutral-700">
            <span className="text-neutral-500 font-normal">วันที่ / Date: </span>
            {date}
          </p>
          {subDateLabel && subDateValue && (
            <p className="text-neutral-700">
              <span className="text-neutral-500 font-normal">{subDateLabel}: </span>
              {subDateValue}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
