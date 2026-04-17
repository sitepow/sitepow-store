import { Review } from '@/types/sites/review'

export const REVIEWS: Review[] = [
  {
    reviewId: '018ee96f-7500-777e-8000-01d0f50b4a7d',
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
    variantId: '018ee972-e400-7aa0-8000-33a8220f1b2c',
    variantTitle: 'แบบกางเกง ไซส์ XL',
    sku: 'PANTS-XL-WHITE',
    selectedOptions: [
      { title: 'ประเภท', name: 'กางเกง' },
      { title: 'ขนาด', name: 'XL' },
    ],
  },
  {
    reviewId: '018ee96f-c100-755c-b000-3f48a0f9a2e1',
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
    variantId: '018ee973-1f00-7bb2-9000-44b933102c3d',
    variantTitle: 'แบบเทป ไซส์ L',
    sku: 'TAPE-L-BLACK',
    selectedOptions: [
      { title: 'ประเภท', name: 'เทป' },
      { title: 'ขนาด', name: 'L' },
    ],
  },
]
