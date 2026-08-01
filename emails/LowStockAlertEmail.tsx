import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { Footer } from './_components/Footer'

interface LowStockItem {
  productTitle: string
  variantTitle?: string
  branchName: string
  currentStock: number
  minStock: number
}

interface LowStockAlertEmailProps {
  storeName?: string
  items?: LowStockItem[]
  inventoryUrl?: string
}

export function LowStockAlertEmail({
  storeName = 'Sitepow Store',
  items = [
    {
      productTitle: 'เสื้อยืด Oversized Cotton 100%',
      variantTitle: 'สีดำ / L',
      branchName: 'สาขาหลัก (สำนักงานใหญ่)',
      currentStock: 2,
      minStock: 5,
    },
    {
      productTitle: 'กระเป๋าผ้า Canvas Bag',
      variantTitle: 'สีครีม',
      branchName: 'สาขาหลัก (สำนักงานใหญ่)',
      currentStock: 0,
      minStock: 10,
    },
  ],
  inventoryUrl = '/',
}: LowStockAlertEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>แจ้งเตือน: สินค้าใกล้หมดสต๊อก - {storeName}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              สินค้าใกล้หมดสต๊อก!
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              พบสินค้าที่จำนวนเหลือน้อยกว่าระดับขั้นต่ำในร้าน {storeName}
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Section className="my-6">
              <Link
                href={inventoryUrl}
                className="inline-block rounded-md bg-black px-6 py-3 text-sm font-medium text-white no-underline"
              >
                จัดการสต๊อกสินค้า
              </Link>
            </Section>
            <Section className="my-8 text-left text-sm">
              <Text className="mb-3 text-center font-medium opacity-70">
                รายการสินค้าที่ต้องเติมสต๊อก
              </Text>
              <Hr className="my-3 opacity-20" />
              {items.map((item, index) => (
                <div key={index} className="my-4">
                  <div className="flex justify-between font-medium opacity-90">
                    <Text className="m-0">{item.productTitle}</Text>
                    <Text className="m-0 font-semibold">
                      คงเหลือ: {item.currentStock} ชิ้น
                    </Text>
                  </div>
                  <div className="mt-1 flex justify-between text-xs opacity-50">
                    <Text className="m-0">
                      {item.variantTitle ? `${item.variantTitle} • ` : ''}
                      {item.branchName}
                    </Text>
                    <Text className="m-0">(ขั้นต่ำ {item.minStock} ชิ้น)</Text>
                  </div>
                  {index < items.length - 1 && (
                    <Hr className="my-3 opacity-20" />
                  )}
                </div>
              ))}
              <Hr className="my-3 opacity-20" />
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                อีเมลนี้แจ้งเตือนอัตโนมัติเนื่องจากคุณเปิดใช้งานระบบแจ้งเตือนสินค้าใกล้หมดสต๊อก
              </Text>
              <Footer />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default LowStockAlertEmail
