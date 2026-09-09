'use client'
import { useRef } from 'react'

import { useIsMounted } from '@/hooks/use-is-mounted'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'
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
  const isMounted = useIsMounted()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted) return
      if (containerRef.current) {
        const accordionItems =
          containerRef.current.querySelectorAll('[data-faq-item]')
        accordionItems.forEach((item) => {
          gsap.fromTo(
            item,
            { y: 30, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: item,
                start: 'top 92%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }
      ScrollTrigger.refresh()
    },
    { scope: containerRef, dependencies: [isMounted, items] },
  )

  return (
    <div
      ref={containerRef}
      className={cn(
        'border-border/80 bg-card/60 rounded-2xl border p-3.5 shadow-xs backdrop-blur-xs sm:rounded-3xl sm:p-6',
        className,
      )}
    >
      <Accordion type="single" collapsible className="w-full">
        {items.map((faq, idx) => (
          <AccordionItem
            key={idx}
            value={`${idPrefix}-${idx}`}
            data-faq-item
            className="border-border/60"
          >
            <AccordionTrigger className="text-foreground hover:text-primary cursor-pointer py-3 text-left text-xs font-semibold sm:py-4 sm:text-base">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-3 text-xs leading-relaxed sm:pb-4 sm:text-sm">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
