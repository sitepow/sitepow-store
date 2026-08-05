import { formatPromptPay } from '@/utils/slip'
import { User2 } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CustomerInfo {
  avatar?: string | null
  firstName?: string | null
  lastName?: string | null
  email?: string | null
  phone?: string | null
}

interface OrderCustomerInfoCardProps {
  customer?: CustomerInfo | null
}

export function OrderCustomerInfoCard({
  customer,
}: OrderCustomerInfoCardProps) {
  if (!customer) {
    return null
  }

  return (
    <div className="bg-muted/20 space-y-2 rounded-lg border p-3">
      <div className="flex items-center">
        <Avatar className="size-9 border">
          {customer.avatar && <AvatarImage src={customer.avatar} />}
          <AvatarFallback>
            <User2 size={16} />
          </AvatarFallback>
        </Avatar>
        <div className="ml-3 max-w-72 space-y-0.5">
          <p className="text-sm leading-none font-medium">
            {customer.firstName} {customer.lastName}
          </p>
          <p className="text-muted-foreground text-xs">
            อีเมล: {customer.email ?? '-'}
            <br />
            เบอร์โทรศัพท์:{' '}
            {customer.phone ? formatPromptPay(customer.phone) : '-'}
          </p>
        </div>
      </div>
    </div>
  )
}
