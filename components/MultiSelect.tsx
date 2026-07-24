'use client'

import { useState } from 'react'

import { IconCheck, IconChevronDown } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { cn } from '@/lib/utils'

interface MultiSelectOption {
  id: string
  name: string
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
  placeholder?: string
  searchPlaceholder?: string
  allSelectedLabel?: string
  emptyLabel?: string
}

export function MultiSelect({
  options,
  value,
  onChange,
  disabled,
  placeholder = 'เลือกรายการ',
  searchPlaceholder = 'ค้นหา...',
  emptyLabel = 'ไม่พบรายการ',
}: MultiSelectProps) {
  const [open, setOpen] = useState(false)

  const toggle = (id: string) => {
    const updated = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id]
    onChange(updated)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {value.length === 0
            ? placeholder
            : `เลือกแล้ว ${value.length} รายการ`}
          <IconChevronDown size={16} className="text-muted-foreground ml-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = value.includes(option.id)
                return (
                  <CommandItem
                    key={option.id}
                    value={option.id}
                    onSelect={() => toggle(option.id)}
                  >
                    <div
                      className={cn(
                        'border-primary mr-2 flex size-4 items-center justify-center rounded-sm border',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-transparent',
                      )}
                    >
                      <IconCheck
                        size={12}
                        className={cn(isSelected ? 'opacity-100' : 'opacity-0')}
                      />
                    </div>
                    {option.name}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
