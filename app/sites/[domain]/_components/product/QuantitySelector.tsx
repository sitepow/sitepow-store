'use client'

import { MinusIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (value > min) onChange(value - 1)
  }

  const handleIncrement = () => {
    if (value < max) onChange(value + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value)
    if (!isNaN(val)) {
      const clampedValue = Math.max(min, Math.min(val, max))
      onChange(clampedValue)
    }
  }

  return (
    <InputGroup className="max-w-35">
      <InputGroupAddon align="inline-start" className="border-r p-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-muted size-9 rounded-none"
          onClick={handleDecrement}
          disabled={value <= min}
        >
          <MinusIcon className="size-4" />
        </Button>
      </InputGroupAddon>

      <InputGroupInput
        type="number"
        value={value}
        onChange={handleInputChange}
        className="h-9 [appearance:textfield] border-none text-center focus-visible:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />

      <InputGroupAddon align="inline-end" className="border-l p-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:bg-muted size-9 rounded-none"
          onClick={handleIncrement}
          disabled={value >= max}
        >
          <PlusIcon className="size-4" />
        </Button>
      </InputGroupAddon>
    </InputGroup>
  )
}
