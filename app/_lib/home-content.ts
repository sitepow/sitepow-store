export interface FaqItem {
  q: string
  a: string
}

export function buildFaqJsonLd(faqItems: FaqItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }
}

export function getFeaturesBentoCards(tBento: (key: string) => string) {
  return {
    pos: {
      name: tBento('cards.pos.name'),
      description: tBento('cards.pos.description'),
      cta: tBento('cards.pos.cta'),
    },
    ai: {
      name: tBento('cards.ai.name'),
      description: tBento('cards.ai.description'),
      cta: tBento('cards.ai.cta'),
    },
    zeroGp: {
      name: tBento('cards.zeroGp.name'),
      description: tBento('cards.zeroGp.description'),
      cta: tBento('cards.zeroGp.cta'),
    },
    inventory: {
      name: tBento('cards.inventory.name'),
      description: tBento('cards.inventory.description'),
      cta: tBento('cards.inventory.cta'),
    },
    digital: {
      name: tBento('cards.digital.name'),
      description: tBento('cards.digital.description'),
      cta: tBento('cards.digital.cta'),
    },
    crm: {
      name: tBento('cards.crm.name'),
      description: tBento('cards.crm.description'),
      cta: tBento('cards.crm.cta'),
    },
    global: {
      name: tBento('cards.global.name'),
      description: tBento('cards.global.description'),
      cta: tBento('cards.global.cta'),
      badges: {
        zoneRates: tBento('cards.global.badges.zoneRates'),
        multiCurrency: tBento('cards.global.badges.multiCurrency'),
        stripeGlobal: tBento('cards.global.badges.stripeGlobal'),
      },
    },
  }
}
