import NewOrderNotificationEmail from '@/emails/sales/NewOrderNotificationEmail'
import {
  PaymentMethod,
  PermissionAction,
  PermissionDomain,
} from '@/generated/prisma/enums'

import { prisma } from '@/lib/db/prisma'
import { resend } from '@/lib/integrations/resend'

import { formatCurrency } from '@/utils/formatting/number'

export async function getStoreOrderNotificationEmails(
  storeId: string,
): Promise<string[]> {
  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: {
        owner: {
          select: {
            email: true,
          },
        },
        employeeStores: {
          where: {
            branches: {
              some: {
                OR: [
                  {
                    role: {
                      permissions: {
                        some: {
                          permission: {
                            domain: PermissionDomain.ORDER,
                            action: PermissionAction.READ,
                          },
                        },
                      },
                    },
                  },
                  {
                    customPermissions: {
                      some: {
                        permission: {
                          domain: PermissionDomain.ORDER,
                          action: PermissionAction.READ,
                        },
                      },
                    },
                  },
                ],
              },
            },
          },
          select: {
            employee: {
              select: {
                email: true,
                user: {
                  select: {
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!store) {
      return []
    }

    const emails = new Set<string>()

    if (store.owner?.email) {
      emails.add(store.owner.email)
    }

    store.employeeStores?.forEach((es) => {
      const staffEmail = es.employee?.email || es.employee?.user?.email
      if (staffEmail) {
        emails.add(staffEmail)
      }
    })

    return Array.from(emails)
  } catch (error) {
    console.error(error)
    return []
  }
}

interface SendNewOrderEmailParams {
  storeId: string
  storeName: string
  orderNumber: string
  customerName: string
  totalAmount: number
  paymentMethod: PaymentMethod
  items: {
    title: string
    quantity: number
    price: number
  }[]
}

export async function sendNewOrderNotificationEmail(
  params: SendNewOrderEmailParams,
) {
  try {
    const recipientEmails = await getStoreOrderNotificationEmails(
      params.storeId,
    )

    if (recipientEmails.length === 0) {
      return { success: false, message: 'ไม่พบอีเมลผู้รับ' }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL
    const dashboardUrl = `${appUrl}/merchant/orders`

    const formattedItems = params.items.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      price: formatCurrency(item.price),
    }))

    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: recipientEmails,
      subject: `[คำสั่งซื้อใหม่] #${params.orderNumber} - ${params.storeName}`,
      react: NewOrderNotificationEmail({
        orderNumber: params.orderNumber,
        storeName: params.storeName,
        customerName: params.customerName,
        totalAmount: formatCurrency(params.totalAmount),
        paymentMethod: params.paymentMethod,
        items: formattedItems,
        dashboardUrl,
      }),
    })

    if (error) {
      console.error(error)
      return { success: false, message: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
