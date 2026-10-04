import { ReactNode, useCallback, useMemo, useState } from 'react'

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

import { Address, Config, ThaiAddressFinder } from '@/lib/address/thai-address-finder'
import { cn } from '@/lib/utils'

import { Input } from '@/components/./ui/input'

export interface Props {
  scope?: 'district' | 'amphoe' | 'province' | 'zipcode'
  delimiter?: string
  value?: string
  filter?: (value?: Address, index?: number, array?: Address[]) => boolean
  onChange?: (value: string) => void
  onSelect?: (address: Address) => void
  className?: string
  placeholder?: string
}

const DefaultProps = {
  scope: 'province' as const,
  delimiter: ', ',
  value: '',
  filter: () => true,
  onChange: () => null,
  onSelect: () => null,
  style: {},
  className: '',
}

export const CreateInput = (config?: Config) => {
  const finder = new ThaiAddressFinder(config)

  const InputThaiAddress = ({
    scope = DefaultProps.scope,
    delimiter = DefaultProps.delimiter,
    value = DefaultProps.value,
    filter = DefaultProps.filter,
    onChange = DefaultProps.onChange,
    onSelect = DefaultProps.onSelect,
    className = DefaultProps.className,
    placeholder = 'ค้นหาที่อยู่...',
  }: Props = DefaultProps): ReactNode => {
    const [open, setOpen] = useState(false)

    const findAndFilter = useCallback(
      (txt: string) => {
        if (!txt) return []
        let result: Address[] = []
        switch (scope) {
          case 'district':
            result = finder.SearchAddressByDistrict(txt, filter)
            break
          case 'amphoe':
            result = finder.SearchAddressByAmphoe(txt, filter)
            break
          case 'province':
            result = finder.SearchAddressByProvince(txt, filter)
            break
          case 'zipcode':
            result = finder.SearchAddressByZipcode(txt, filter)
            break
        }
        return result
      },
      [scope, filter],
    )

    const options = useMemo(() => {
      const filtered = findAndFilter(value)
      return filtered.map((item) => {
        const label = `${item.district}${delimiter}${item.amphoe}${delimiter}${item.province}${delimiter}${item.zipcode}`
        return { label, raw: item }
      })
    }, [findAndFilter, value, delimiter])

    const handleSelect = (currentLabel: string, rawAddress: Address) => {
      if (onChange) {
        onChange(currentLabel)
      }

      if (onSelect) {
        onSelect(rawAddress)
      }
      setOpen(false)
    }

    return (
      <div className={cn('w-full', className)}>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <div className="w-full">
              <Input
                value={value}
                onChange={(e) => {
                  onChange?.(e.target.value)
                  setOpen(true)
                }}
                placeholder={placeholder}
                onClick={() => setOpen(true)}
              />
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="popover-content-width-same-as-its-trigger p-0"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <Command shouldFilter={false}>
              <CommandList>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.label}
                      value={option.label}
                      onSelect={() => handleSelect(option.label, option.raw)}
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                  {value && options.length === 0 && (
                    <div className="py-6 text-center text-sm">ไม่พบข้อมูล</div>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
    )
  }

  return {
    District: (props: Props = DefaultProps) => (
      <InputThaiAddress {...props} scope="district" />
    ),
    Amphoe: (props: Props = DefaultProps) => (
      <InputThaiAddress {...props} scope="amphoe" />
    ),
    Province: (props: Props = DefaultProps) => (
      <InputThaiAddress {...props} scope="province" />
    ),
    Zipcode: (props: Props = DefaultProps) => (
      <InputThaiAddress {...props} scope="zipcode" />
    ),
  }
}
