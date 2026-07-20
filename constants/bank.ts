export const THAI_BANKS = [
  { code: '01002', name: 'ธนาคารกรุงเทพ (Bangkok Bank)' },
  { code: '01004', name: 'ธนาคารกสิกรไทย (Kasikorn Bank)' },
  { code: '01006', name: 'ธนาคารกรุงไทย (Krung Thai Bank)' },
  { code: '01008', name: 'ธนาคารเจพีมอร์แกน เชส (JPMC)' },
  { code: '01011', name: 'ธนาคารทหารไทยธนชาต (TMB Thanachart Bank)' },
  { code: '01014', name: 'ธนาคารไทยพาณิชย์ (SCB)' },
  { code: '01017', name: 'ธนาคารซิตี้แบงก์ (CITI)' },
  { code: '01018', name: 'ธนาคารซูมิโตโม มิตซุย (SMBC)' },
  { code: '01020', name: 'ธนาคารสแตนดาร์ดชาร์เตอร์ด (SCBT)' },
  { code: '01022', name: 'ธนาคารซีไอเอ็มบีไทย (CIMB Thai Bank)' },
  { code: '01024', name: 'ธนาคารยูโอบี (UOB)' },
  { code: '01025', name: 'ธนาคารกรุงศรีอยุธยา (Krungsri Bank)' },
  { code: '01029', name: 'ธนาคารอินเดียนโอเวอร์ซีส์ (IOBA)' },
  { code: '01030', name: 'ธนาคารออมสิน (GSB)' },
  { code: '01031', name: 'ธนาคารเอชเอสบีซี (HSBC)' },
  { code: '01032', name: 'ธนาคารดอยซ์แบงก์ เอจี (DB)' },
  { code: '01033', name: 'ธนาคารอาคารสงเคราะห์ (GHB)' },
  { code: '01034', name: 'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (BAAC)' },
  { code: '01039', name: 'ธนาคารมิซูโฮ (MIZUHO)' },
  { code: '01045', name: 'ธนาคารบีเอ็นพี พารีบาส์ (BNPP)' },
  { code: '01052', name: 'ธนาคารแห่งประเทศจีน (ไทย) (BOC)' },
  { code: '01066', name: 'ธนาคารอิสลามแห่งประเทศไทย (Islamic Bank)' },
  { code: '01067', name: 'ธนาคารทิสโก้ (TISCO Bank)' },
  { code: '01069', name: 'ธนาคารเกียรตินาคินภัทร (Kiatnakin Bank)' },
  { code: '01070', name: 'ธนาคารไอซีบีซี (ไทย) (ICBC Thai)' },
  { code: '01071', name: 'ธนาคารไทยเครดิต (Thai Credit Bank)' },
  { code: '01073', name: 'ธนาคารแลนด์ แอนด์ เฮ้าส์ (LH Bank)' },
  { code: '01088', name: 'ธนาคารคลิกซ์ (CLICX Bank)' },
  { code: '01098', name: 'ธพว. (SME Bank)' },
] as const

export function mapBankCodeToSlip2Go(bankName: string): string {
  const foundBank = THAI_BANKS.find((bank) => bank.name === bankName)
  if (foundBank) {
    return foundBank.code
  }

  const foundPartial = THAI_BANKS.find(
    (bank) =>
      bank.name.includes(bankName) ||
      bankName.includes(bank.name.split(' ')[0]),
  )
  if (foundPartial) {
    return foundPartial.code
  }

  return bankName
}
