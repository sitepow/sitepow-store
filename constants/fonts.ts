export interface StoreFontOption {
  label: string
  value: string
  fontFamily: string
  description?: string
  cssClass?: string
}

export const STORE_FONT_OPTIONS: StoreFontOption[] = [
  {
    label: 'PG Homeplace (โมเดิร์น คลีน)',
    value: 'default',
    fontFamily: 'var(--font-sans)',
    description: 'Modern Clean & Bold — ฟอนต์มาตรฐานของระบบ',
    cssClass: 'font-default',
  },
  {
    label: 'IBM Plex Sans Thai (เทค ทันสมัย)',
    value: 'ibm_plex_sans_thai',
    fontFamily: 'var(--font-ibm-plex-sans-thai)',
    description: 'Modern Tech & Sharp — สไตล์มินิมอล ไร้หัว ทันสมัย',
    cssClass: 'font-ibm-plex',
  },
  {
    label: 'IBM Plex Sans Thai Looped (มีหัว ทางการ & เป็นมิตร)',
    value: 'ibm_plex_sans_thai_loop',
    fontFamily: 'var(--font-ibm-plex-sans-thai-loop)',
    description: 'Friendly & Formal — สไตล์มีหัว คุ้นตา อ่านง่าย น่าเชื่อถือ',
    cssClass: 'font-ibm-plex-loop',
  },
]

export const FONT_FAMILY_MAP: Record<string, string> = {
  default: 'var(--font-sans)',
  pg_homeplace: 'var(--font-sans)',
  ibm_plex_sans_thai: 'var(--font-ibm-plex-sans-thai)',
  ibm_plex_sans_thai_loop: 'var(--font-ibm-plex-sans-thai-loop)',
}

export function getStoreFontFamily(fontName?: string | null): string {
  if (!fontName) return FONT_FAMILY_MAP.default
  return FONT_FAMILY_MAP[fontName] || FONT_FAMILY_MAP.default
}
