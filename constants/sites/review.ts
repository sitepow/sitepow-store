import { Review } from '@/types/sites/review'

export const REVIEWS: Review[] = [
  {
    id: 1,
    user: 'สมชาย รักดี',
    rating: 5,
    categories: [
      { label: 'คุณภาพสินค้า', rating: 5 },
      { label: 'ความคุ้มค่า', rating: 5 },
      { label: 'การจัดส่ง', rating: 5 },
    ],
    date: '12 เม.ย. 2026',
    comment: 'สินค้าคุณภาพดีมากครับ การแพ็คของมาอย่างดี จัดส่งไวมาก แนะนำเลย!',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    ],
    video: null,
    variantId: 'v-pants-xl-001',
    variantTitle: 'แบบกางเกง ไซส์ XL',
    sku: 'PANTS-XL-WHITE',
    selectedOptions: [
      { title: 'ประเภท', name: 'กางเกง' },
      { title: 'ขนาด', name: 'XL' },
    ],
  },
  {
    id: 2,
    user: 'Jane Doe',
    rating: 4,
    categories: [
      { label: 'คุณภาพสินค้า', rating: 5 },
      { label: 'ความคุ้มค่า', rating: 4 },
      { label: 'การจัดส่ง', rating: 3 },
    ],
    date: '10 เม.ย. 2026',
    comment:
      'ใช้งานได้ดีตามสเปคที่แจ้งไว้ สีสวยถูกใจมากค่ะ แต่ขนส่งแอบช้านิดหน่อย',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    ],
    video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    variantId: 'v-tape-l-002',
    variantTitle: 'แบบเทป ไซส์ L',
    sku: 'TAPE-L-BLACK',
    selectedOptions: [
      { title: 'ประเภท', name: 'เทป' },
      { title: 'ขนาด', name: 'L' },
    ],
  },
]
