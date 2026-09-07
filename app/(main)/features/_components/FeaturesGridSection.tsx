'use client'

import React, { useState } from 'react'

import Link from 'next/link'

import { FEATURES_DATA, FeatureItem } from '@/constants/features'
import { IconArrowRight, IconCheck } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด (12 ฟีเจอร์)' },
  { id: 'pos', label: 'หน้าร้าน & POS' },
  { id: 'ai', label: 'AI & ระบบอัตโนมัติ' },
  { id: 'inventory', label: 'สต็อก & คลังสินค้า' },
  { id: 'sales', label: 'การขาย & การเงิน' },
  { id: 'marketing', label: 'การตลาด & CRM' },
]

export function FeaturesGridSection() {
  const [selectedCat, setSelectedCat] = useState('all')

  const filteredFeatures =
    selectedCat === 'all'
      ? FEATURES_DATA
      : FEATURES_DATA.filter((f) => f.category === selectedCat)

  return (
    <div className="mx-auto w-full max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
      {/* Category Filter Pills */}
      <div className="flex justify-center">
        <div className="bg-muted/70 border-border/80 inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border p-1.5 shadow-xs">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-3.5 sm:text-sm ${
                  isSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* 12 Features Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredFeatures.map((feat) => (
          <div
            key={feat.slug}
            className="group border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-7"
          >
            <div>
              {/* Header: Icon & Category */}
              <div className="flex items-start justify-between">
                <div className="bg-muted flex size-12 items-center justify-center rounded-2xl shadow-2xs transition-transform group-hover:scale-105">
                  {feat.icon}
                </div>
                <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                  {feat.categoryLabel}
                </span>
              </div>

              {/* Title & Description */}
              <div className="pt-5">
                <h3 className="text-foreground group-hover:text-primary text-lg font-bold transition-colors">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground min-h-[48px] pt-2 text-xs leading-relaxed">
                  {feat.shortDescription}
                </p>
              </div>

              <div className="border-border/60 my-5 border-t" />

              {/* Highlights */}
              <ul className="space-y-2 text-xs">
                {feat.highlights.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div
                      className="text-primary mt-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      <IconCheck size={14} />
                    </div>
                    <span className="text-foreground/90 leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clickable Overlay */}
            <Link
              href={`/features/${feat.slug}`}
              className="absolute inset-0 z-10 cursor-pointer"
              aria-label={feat.title}
            />

            {/* Action Link to Detail Page */}
            <div className="relative z-20 pt-6">
              <Button
                asChild
                variant="outline"
                className="group-hover:border-primary group-hover:text-primary flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold transition-all"
              >
                <Link href={`/features/${feat.slug}`}>
                  <span>ดูรายละเอียดฟังก์ชันนี้</span>
                  <IconArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
