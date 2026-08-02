import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components'

import { EmailFooter } from './_components/EmailFooter'

interface ResetPasswordEmailProps {
  resetLink?: string
  expiryMinutes?: number
}

export default function ResetPasswordEmail({
  resetLink = '/reset-password?token=example',
  expiryMinutes = 15,
}: ResetPasswordEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>คำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ</Preview>
      <Tailwind>
        <Body>
          <Container className="mx-auto my-0 max-w-125 px-5 py-10 text-center">
            <Heading className="mb-2 text-2xl font-normal tracking-tight">
              ตั้งรหัสผ่านใหม่
            </Heading>
            <Text className="m-0 text-sm leading-6 opacity-60">
              เราได้รับคำขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณ
            </Text>
            <Text className="my-4 text-xs tracking-widest opacity-30">•••</Text>
            <Text className="mb-4 text-sm font-medium opacity-70">
              กดปุ่มด้านล่างเพื่อกำหนดรหัสผ่านใหม่:
            </Text>
            <Section className="my-6">
              <Link
                href={resetLink}
                className="inline-block rounded-md px-6 py-3 text-sm font-medium no-underline"
              >
                ตั้งรหัสผ่านใหม่
              </Link>
            </Section>
            <Text className="text-sm opacity-50">
              ลิงก์นี้มีอายุการใช้งาน {expiryMinutes} นาที
            </Text>
            <Section className="mt-12 text-xs opacity-40">
              <Text className="m-0 leading-5">
                หากคุณไม่ได้เป็นผู้ขอรีเซ็ตรหัสผ่าน
                สามารถข้ามหรือลบอีเมลนี้ได้อย่างปลอดภัย
                รหัสผ่านของคุณจะยังคงเดิม
              </Text>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}
