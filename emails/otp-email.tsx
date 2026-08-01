import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface OtpEmailProps {
  otp: string
  expiryMinutes?: number
}

export function OtpEmail({ otp, expiryMinutes = 5 }: OtpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>รหัสยืนยัน OTP สำหรับเปิดใช้งานบัญชีของคุณ</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>รหัสยืนยันตัวตน (OTP)</Heading>
          <Text style={text}>
            โปรดใช้รหัส OTP ด้านล่างนี้เพื่อยืนยันการเปิดใช้งานบัญชีของคุณ:
          </Text>
          <Section style={codeContainer}>
            <Text style={codeText}>{otp}</Text>
          </Section>
          <Text style={text}>
            รหัสนี้มีอายุการใช้งาน <strong>{expiryMinutes} นาที</strong>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            หากคุณไม่ได้เป็นผู้ขอรหัสนี้ สามารถข้ามหรือลบอีเมลนี้ได้ทันที
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export default OtpEmail

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '480px',
}

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1a1a1a',
  padding: '17px 0 0',
  textAlign: 'center' as const,
}

const text = {
  margin: '0 0 10px',
  color: '#525f7f',
  fontSize: '15px',
  lineHeight: '24px',
  textAlign: 'left' as const,
}

const codeContainer = {
  background: '#f4f4f5',
  borderRadius: '6px',
  margin: '16px auto',
  verticalAlign: 'middle',
  width: '280px',
}

const codeText = {
  color: '#2563eb',
  fontSize: '32px',
  fontWeight: 'bold',
  letterSpacing: '6px',
  lineHeight: '50px',
  padding: '10px 0',
  textAlign: 'center' as const,
}

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
}

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
}
