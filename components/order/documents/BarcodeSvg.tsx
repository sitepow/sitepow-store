'use client'

import React from 'react'

/**
 * Code 128 (Subset B) SVG Barcode Generator
 * Self-contained, zero-dependency, ultra crisp vector output for printing.
 */

// Code 128 bar widths (widths of alternating bars and spaces: 6 elements, sum = 11 modules)
const CODE128_PATTERNS: string[] = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', // 0-9
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', // 10-19
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', // 20-29
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', // 30-39
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', // 40-49
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', // 50-59
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', // 60-69
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', // 70-79
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', // 80-89
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', // 90-99
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112' // 100-106 (104=Start B, 106=Stop)
]

const START_CODE_B = 104
const STOP_CODE = 106

function encodeCode128B(text: string): string[] | null {
  if (!text) return null

  const codes: number[] = [START_CODE_B]
  let checkSum = START_CODE_B

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    // ASCII 32 to 126
    const code = charCode - 32
    if (code < 0 || code > 95) {
      // Fallback for unmappable char, map to question mark
      codes.push(31) // '?'
      checkSum += 31 * (i + 1)
    } else {
      codes.push(code)
      checkSum += code * (i + 1)
    }
  }

  const checkDigit = checkSum % 103
  codes.push(checkDigit)
  codes.push(STOP_CODE)

  return codes.map((c) => CODE128_PATTERNS[c] || CODE128_PATTERNS[0])
}

interface BarcodeSvgProps {
  value: string
  height?: number
  moduleWidth?: number
  showText?: boolean
  className?: string
}

export function BarcodeSvg({
  value,
  height = 48,
  moduleWidth = 1.6,
  showText = true,
  className = '',
}: BarcodeSvgProps) {
  const patterns = encodeCode128B(value)
  if (!patterns) return null

  // Calculate bars
  const rects: { x: number; width: number }[] = []
  let currentX = 10 // Quiet zone

  for (const pattern of patterns) {
    for (let i = 0; i < pattern.length; i++) {
      const widthInModules = parseInt(pattern[i], 10)
      const w = widthInModules * moduleWidth
      const isBar = i % 2 === 0
      if (isBar) {
        rects.push({ x: currentX, width: w })
      }
      currentX += w
    }
  }

  const totalWidth = currentX + 10 // Quiet zone right
  const totalHeight = showText ? height + 16 : height

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        width={totalWidth}
        height={totalHeight}
        className="max-w-full"
        style={{ display: 'block' }}
      >
        <rect width={totalWidth} height={totalHeight} fill="#FFFFFF" />
        {rects.map((r, idx) => (
          <rect
            key={idx}
            x={r.x}
            y={0}
            width={r.width}
            height={height}
            fill="#000000"
          />
        ))}
        {showText && (
          <text
            x={totalWidth / 2}
            y={height + 12}
            textAnchor="middle"
            fontFamily="monospace, Courier, sans-serif"
            fontSize="11"
            fontWeight="600"
            fill="#000000"
            letterSpacing="2"
          >
            {value}
          </text>
        )}
      </svg>
    </div>
  )
}
