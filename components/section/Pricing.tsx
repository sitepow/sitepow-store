import { HeroHeader } from '../HeroHeader'
import { SectionContainer } from '../SectionContainer'

export function PricingSection() {
  return (
    <SectionContainer>
      <HeroHeader
        title={
          <>
            เลือก Package ที่เหมาะกับ{' '}
            <span className="text-primary">ขนาดร้านค้าและธุรกิจของคุณ</span>
          </>
        }
      />
    </SectionContainer>
  )
}
