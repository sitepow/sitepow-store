'use client'

import * as React from 'react'

import { PRODUCT_METADATA_MASTER } from '@/constants/sites/metadata'
import { Check, ChevronsUpDown } from 'lucide-react'

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
        <Button
          variant="outline"
          role="combobox"
          size="lg"
          className="w-full justify-between wrap-break-word whitespace-pre-line"
        >
          {value ? selectedLabel : 'เลือกคุณสมบัติ...'}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
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
