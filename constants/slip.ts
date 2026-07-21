export const SLIP2GO_API =
  'https://connect.slip2go.com/api/verify-slip/qr-image-link/info'

export const SLIP_CODE = {
  FOUND: '200000',
  VALID: '200200',
  RECIPIENT_NOT_MATCH: '200401',
  AMOUNT_NOT_MATCH: '200402',
  IMAGE_INVALID: '400004',
  DUPLICATED: '200501',
}

export const getSlipErrorMessage = (code: string, apiMessage?: string) => {
  switch (code) {
    case SLIP_CODE.DUPLICATED:
      return 'คุณได้ใช้สลิปนี้ไปแล้วในออเดอร์ก่อนหน้า'
    case SLIP_CODE.RECIPIENT_NOT_MATCH:
      return 'ชื่อหรือบัญชีผู้รับเงินไม่ตรงกับของทางร้านค้า'
    case SLIP_CODE.AMOUNT_NOT_MATCH:
      return 'ยอดเงินในสลิปไม่ตรงกับยอดชำระของออเดอร์นี้'
    case SLIP_CODE.IMAGE_INVALID:
      return 'รูปภาพสลิปไม่ถูกต้อง เสียหาย หรือระบบไม่รองรับ'
    default:
      return apiMessage || 'สลิปไม่ถูกต้องหรือข้อมูลไม่ตรงกับร้านค้า'
  }
}
