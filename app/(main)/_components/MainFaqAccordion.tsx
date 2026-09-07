import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { cn } from '@/lib/utils'

interface FaqItem {
  q: string
  a: string
}
interface MainFaqAccordionProps {
  items: FaqItem[]
  idPrefix?: string
  className?: string
}
export function MainFaqAccordion({
  items,
  idPrefix = 'faq',
  className,
}: MainFaqAccordionProps) {
  return (
    <div
      className={cn(
        'border-border/80 bg-card/60 rounded-3xl border p-4 shadow-xs backdrop-blur-xs sm:p-6',
        className,
      )}
    >
      <Accordion type="single" collapsible className="w-full">
        {items.map((faq, idx) => (
          <AccordionItem
            key={idx}
            value={`${idPrefix}-${idx}`}
            className="border-border/60"
          >
            <AccordionTrigger className="text-foreground hover:text-primary cursor-pointer py-4 text-left text-sm font-semibold sm:text-base">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-4 text-xs leading-relaxed sm:text-sm">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
