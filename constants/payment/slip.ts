export const SLIP2GO_API =
  'https://connect.slip2go.com/api/verify-slip/qr-image-link/info'

export const SLIP_CODE = {
  FOUND: '200000',
  INFO_SUCCESS: '200001',
  VALID: '200200',
  QUEUE_SUCCESS: '200202',
  RECIPIENT_NOT_MATCH: '200401',
  AMOUNT_NOT_MATCH: '200402',
  DATE_NOT_MATCH: '200403',
  NOT_FOUND: '200404',
  FRAUD: '200500',
  DUPLICATED: '200501',
  BANK_ERROR: '200502',
} as const

export const getSlipErrorMessage = (code: string, apiMessage?: string) => {
  switch (code) {
    case SLIP_CODE.RECIPIENT_NOT_MATCH:
      return 'บัญชีผู้รับเงินไม่ถูกต้องหรือไม่ตรงกับของทางร้านค้า'
    case SLIP_CODE.AMOUNT_NOT_MATCH:
      return 'ยอดเงินในสลิปไม่ตรงกับยอดชำระของออเดอร์นี้'
    case SLIP_CODE.DATE_NOT_MATCH:
      return 'วันที่โอนเงินในสลิปไม่ตรงกับเงื่อนไขเวลา'
    case SLIP_CODE.NOT_FOUND:
      return 'ไม่พบข้อมูลสลิปนี้ในระบบธนาคาร'
    case SLIP_CODE.FRAUD:
      return 'สลิปไม่สมบูรณ์ หรือตรวจสอบพบว่าเป็นสลิปปลอม'
    case SLIP_CODE.DUPLICATED:
      return 'คุณได้ใช้สลิปนี้ไปแล้วในออเดอร์ก่อนหน้า'
    case SLIP_CODE.BANK_ERROR:
      return 'ระบบธนาคารขัดข้องในขณะตรวจสอบ กรุณาลองใหม่อีกครั้ง'
    default:
      return apiMessage || 'สลิปไม่ถูกต้องหรือข้อมูลไม่ตรงกับร้านค้า'
  }
}
