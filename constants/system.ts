export const SECOND = 1000
export const MINUTE = 60 * SECOND
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR
export const WEEK = 7 * DAY
export const YEAR = 365 * DAY

export const THAILAND_UTC_OFFSET = 7 * HOUR

const toSeconds = (ms: number) => ms / SECOND

export const SUBSCRIPTION_DAYS = 30
export const TRANSFER_EXPIRY_DAYS = 1
export const OVERDUE_INVOICE_DAYS = 7
export const FAKE_SLIP_BLOCK_DAYS = 7
export const OTP_EXPIRY_MINUTES = 5
export const ORDER_EXPIRY_MINUTES = 30
export const OTP_RESEND_COOLDOWN_SECONDS = 60

export const CHAT_REFETCH_INTERVAL = 15 * SECOND
export const UNREAD_COUNT_REFETCH_INTERVAL = 10 * SECOND
export const SSE_KEEP_ALIVE_INTERVAL = 15 * SECOND
export const LANDING_STORES_STALE_TIME = MINUTE
export const COPY_RESET_INTERVAL = 2 * SECOND
export const DOMAIN_VERIFY_TIMEOUT = 5 * SECOND
export const DB_IDLE_TIMEOUT = 30 * SECOND
export const DB_CONNECTION_TIMEOUT = 10 * SECOND

export const REDIS_CACHE_TTL_SECONDS = toSeconds(HOUR)
export const PERMISSION_CACHE_TTL_SECONDS = toSeconds(WEEK)
export const LATEST_MESSAGES_CACHE_TTL_SECONDS = toSeconds(5 * MINUTE)
export const DOMAIN_CACHE_TTL_SECONDS = toSeconds(WEEK)
export const DOMAIN_NOT_FOUND_CACHE_TTL_SECONDS = toSeconds(MINUTE)
export const TENANT_ORIGIN_CACHE_TTL_SECONDS = toSeconds(DAY)
export const AUTH_TICKET_TTL_SECONDS = toSeconds(MINUTE)
export const SESSION_COOKIE_MAX_AGE_SECONDS = toSeconds(WEEK)
export const LOCALE_COOKIE_MAX_AGE_SECONDS = toSeconds(YEAR)
export const R2_UPLOAD_URL_EXPIRY_SECONDS = toSeconds(5 * MINUTE)

export const OTP_MIN_RANGE = 100_000
export const OTP_MAX_RANGE = 1_000_000
export const SERVER_ERROR_MESSAGE =
  'ขออภัย ระบบขัดข้องชั่วคราว โปรดลองใหม่อีกครั้ง'
export const AI_BOT_ID = '9bc5e6c4-666f-45d1-a41e-ccba7a37fb28'
export const RESERVED_STORE_SUBDOMAIN_SLUG = [
  'www',
  'api',
  'app',
  'admin',
  'dashboard',
  'billing',
  'auth',
  'account',
  'accounts',
  'status',
  'cdn',
  'assets',
  'static',
  'mail',
  'email',
  'smtp',
  'imap',
  'pop',
  'dns',
  'ns1',
  'ns2',
  'ftp',
  'ssh',
  'root',
  'webmaster',
  'security',
  'dev',
  'test',
  'staging',
  'preview',
  'config',
  'settings',
  'logs',
  'metrics',
  'monitor',
  'probe',
  'node',
  'nodes',
  'cluster',
  'cache',
  'database',
  'db',
  'login',
  'signin',
  'signup',
  'register',
  'verify',
  'verification',
  'password',
  'forgot',
  'recovery',
  'reset',
  'update',
  'support',
  'help',
  'service',
  'customer',
  'client',
  'payment',
  'checkout',
  'orders',
  'order',
  'transaction',
  'blog',
  'news',
  'about',
  'team',
  'contact',
  'legal',
  'privacy',
  'terms',
  'policy',
  'jobs',
  'careers',
  'press',
  'media',
  'partner',
  'partners',
  'affiliate',
  'affiliates',
  'marketing',
  'promo',
  'sales',
  'deals',
  'shop',
  'store',
  'cart',
  'buy',
  'sell',
  'merchant',
  'merchants',
  'catalog',
  'product',
  'products',
  'inventory',
  'warehouse',
  'checkout',
  'demo',
  'trial',
  'community',
  'forum',
  'feedback',
  'survey',
  'guide',
  'docs',
  'documentation',
  'dev',
  'developer',
  'developers',
  'sandbox',
  'invite',
]
export const SUPPORTED_LNGS = ['th', 'en']
export const LANGUAGE_NAMES: Record<string, string> = {
  th: 'ภาษาไทย',
  en: 'English',
}
export const FIELD_LABELS: Record<string, string> = {
  basic: 'ข้อมูลพื้นฐาน (ชื่อ, slug, หมวดหมู่)',
  metadata: 'Metadata (ข้อมูลทางเทคนิค)',
  variants: 'ตัวเลือกสินค้า (Variants)',
  addons: 'บริการเสริม (Addons)',
  tags: 'แท็กสินค้า (Tags)',
}
export const FALLBACK_IMAGE = '/images/navigation/navigation-header.jpeg'
export const FALLBACK_MERCHANT_BANNER_IMAGE = '/images/pos-cart.jpeg'
export const FALLBACK_MERCHANT_LOGO_IMAGE = '/images/merchant-logo.png'
export const PRIMARY_COLOR_OPTIONS = [
  { label: 'Neutral', value: '#737373' },
  { label: 'Amber', value: '#f59e0b' },
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Cyan', value: '#06b6d4' },
  { label: 'Emerald', value: '#10b981' },
  { label: 'Fuchsia', value: '#d946ef' },
  { label: 'Green', value: '#22c55e' },
  { label: 'Indigo', value: '#6366f1' },
  { label: 'Lime', value: '#84cc16' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Pink', value: '#ec4899' },
  { label: 'Purple', value: '#a855f7' },
  { label: 'Red', value: '#ef4444' },
  { label: 'Rose', value: '#f43f5e' },
  { label: 'Sky', value: '#0ea5e9' },
  { label: 'Teal', value: '#14b8a6' },
  { label: 'Violet', value: '#8b5cf6' },
  { label: 'Yellow', value: '#eab308' },
]
export const THAI_DAYS = [
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
  'อาทิตย์',
]
export const THAI_MONTHS = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
]
export const RESPONSIVE_DEVICE = {
  desktop: '600px',
}
export const DEFAULT_PASSWORD_EMPLOYEE = '123456'
export const FORBIDDEN_TITLES = [
  'นาย',
  'นาง',
  'นางสาว',
  'น.ส.',
  'ด.ช.',
  'ด.ญ.',
  'เด็กชาย',
  'เด็กหญิง',
  'ร.ต.',
  'ร.อ.',
  'ร.ท.',
  'พ.ต.',
  'พ.อ.',
  'พ.ท.',
  'พล.ต.',
  'พล.อ.',
  'พล.ท.',
  'นพ.',
  'พญ.',
  'ดร.',
  'บริษัท',
  'บมจ.',
  'หจก.',
]
export const THAI_NAME_REGEX = /^[ก-ฮะ-์\s]+$/
export const DAYS = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
]
export const HOURS = Array.from({ length: 24 }, (_, i) => i)
