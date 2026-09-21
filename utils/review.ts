export const getRatingLabel = (rating: number) => {
  const labels: Record<number, string> = {
    5: 'ดีเยี่ยม',
    4: 'ดีมาก',
    3: 'ใช้ได้',
    2: 'ควรปรับปรุง',
    1: 'แย่',
    0: 'ไม่มีคะแนน',
  }

  const roundedRating = Math.round(rating)
  return labels[roundedRating] || 'ไม่มีข้อมูล'
}
