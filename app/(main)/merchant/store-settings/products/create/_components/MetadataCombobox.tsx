'use client'

import * as React from 'react'

import { PRODUCT_METADATA_MASTER } from '@/constants/storefront/metadata'
import { Check, ChevronDownIcon } from 'lucide-react'

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

interface Props {
  value: string
  onChange: (value: string) => void
}

export function MetadataCombobox({ value, onChange }: Props) {
  const [open, setOpen] = React.useState(false)

  const selectedLabel = PRODUCT_METADATA_MASTER.flatMap((g) => g.fields).find(
    (f) => f.key === value,
  )?.label

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            'border-input bg-input/30 flex w-24 items-center justify-between gap-1.5 rounded-4xl border px-3 py-2 text-sm whitespace-nowrap transition-colors outline-none sm:w-full',
            'focus-visible:border-ring focus-visible:ring-ring/50 h-9 focus-visible:ring-[3px]',
            !value && 'text-muted-foreground',
            'hover:bg-input/50',
          )}
        >
          <span className="line-clamp-1 flex items-center gap-1.5">
            {selectedLabel || 'เลือกคุณสมบัติ...'}
          </span>
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-75 p-0">
        <Command>
          <CommandInput placeholder="ค้นหาคุณสมบัติ..." />
          <CommandList>
            <CommandEmpty>ไม่พบข้อมูล</CommandEmpty>
            {PRODUCT_METADATA_MASTER.map((group) => (
              <CommandGroup key={group.category} heading={group.category}>
                {group.fields.map((item) => (
                  <CommandItem
                    key={item.key}
                    value={item.label}
                    onSelect={() => {
                      onChange(item.key)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4',
                        value === item.key ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {item.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
