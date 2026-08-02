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

interface DigitalItem {
  title: string
  codeOrKey?: string
  downloadUrl?: string
}

interface DigitalProductDeliveredEmailProps {
  orderNumber?: string
  customerName?: string
  items?: DigitalItem[]
}

export default function DigitalProductDeliveredEmail({
  orderNumber = 'SP2058-29583-92984',
  customerName = 'คุณลูกค้า',
  items = [
    {
      title: 'Software License Key (PRO Version)',
      codeOrKey: '4928-2855-2852-555-184729',
    },
    {
      title: 'E-Book PDF Guide',
      downloadUrl: '/',
    },
  ],
}: DigitalProductDeliveredEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>สินค้าดิจิทัลของคุณพร้อมใช้งานแล้ว #{orderNumber}</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              สินค้าดิจิทัลของคุณพร้อมใช้งาน!
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              สวัสดี {customerName} ขอบคุณสำหรับคำสั่งซื้อ #{orderNumber}{' '}
              คุณสามารถรับสินค้าดิจิทัลได้ด้านล่างนี้
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Section className="my-6 text-left text-sm">
              {items.map((item, index) => (
                <div key={index} className="my-6 text-center">
                  <Text className="m-0 text-base font-medium opacity-90">
                    {item.title}
                  </Text>
                  {item.codeOrKey && (
                    <div className="my-3">
                      <Text className="m-0 text-xs font-medium opacity-60">
                        รหัสเปิดใช้งาน / License Key:
                      </Text>
                      <Text className="my-2 text-xl font-semibold tracking-wider opacity-90 select-all">
                        {item.codeOrKey}
                      </Text>
                    </div>
                  )}
                  {item.downloadUrl && (
                    <div className="my-4">
                      <Link
                        href={item.downloadUrl}
                        className="inline-block rounded-md bg-black px-6 py-2.5 text-xs font-medium text-white no-underline"
                      >
                        ดาวน์โหลด / เข้าถึงไฟล์
                      </Link>
                    </div>
                  )}
                  {index < items.length - 1 && (
                    <Hr className="my-6 opacity-20" />
                  )}
                </div>
              ))}
            </Section>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                โปรดเก็บรักษาข้อมูลและรหัสเข้าใช้งานนี้ไว้เป็นความลับ
                หากมีข้อสงสัยในการใช้งานสามารถติดต่อศูนย์ช่วยเหลือได้ตลอดเวลา
              </Text>
              <Footer />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
