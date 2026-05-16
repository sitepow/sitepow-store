import { MERCHANT_NAVIGATION } from '@/constants/navigation'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function MerchantAccountTabs() {
  return (
    <Tabs defaultValue="dashboard" orientation="vertical" className="w-full">
      <TabsList className="flex h-auto flex-col justify-start space-y-1">
        {MERCHANT_NAVIGATION.map((item) => {
          const Icon = item.icon

          return (
            <TabsTrigger
              key={item.value}
              value={item.value}
              className="w-full justify-start gap-2"
            >
              <Icon size={18} stroke={1.5} />
              <span>{item.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}
