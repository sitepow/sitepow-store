/**
 * Internationalization (Intl DB) helper functions for resolving localized fields
 */

export interface TranslationsMap {
  [locale: string]: Record<string, any>
}

/**
 * Extracts a localized string field from an entity containing a `translations` Json field.
 * Hierarchy: translations[locale][field] -> translations[fallbackLocale][field] -> entity[field]
 */
export function getLocalizedField<T extends Record<string, any>>(
  entity: T | null | undefined,
  field: keyof T | string,
  locale: string = 'th',
  fallbackLocale: string = 'th',
): string {
  if (!entity) return ''

  const translations = (entity as any).translations as TranslationsMap | null | undefined

  if (translations && typeof translations === 'object') {
    if (translations[locale] && translations[locale][field as string]) {
      return String(translations[locale][field as string])
    }
    if (
      fallbackLocale &&
      translations[fallbackLocale] &&
      translations[fallbackLocale][field as string]
    ) {
      return String(translations[fallbackLocale][field as string])
    }
  }

  return (entity as any)[field] ? String((entity as any)[field]) : ''
}

/**
 * Returns a localized copy of a Blog entity
 */
export function localizeBlog<T extends { title: string; content?: string; translations?: any }>(
  blog: T | null | undefined,
  locale: string = 'th',
): T | null {
  if (!blog) return null
  return {
    ...blog,
    title: getLocalizedField(blog, 'title', locale) || blog.title,
    content: (blog.content ? getLocalizedField(blog, 'content', locale) : undefined) || blog.content,
  }
}

/**
 * Returns a localized copy of a Category entity
 */
export function localizeCategory<T extends { title: string; description?: string | null; translations?: any }>(
  category: T | null | undefined,
  locale: string = 'th',
): T | null {
  if (!category) return null
  return {
    ...category,
    title: getLocalizedField(category, 'title', locale) || category.title,
    description: getLocalizedField(category, 'description', locale) || category.description,
  }
}

/**
 * Returns a localized copy of a Product entity (including variants, options, and addons)
 */
export function localizeProduct<T extends Record<string, any>>(
  product: T | null | undefined,
  locale: string = 'th',
): T | null {
  if (!product) return null

  const localized: any = {
    ...product,
    title: getLocalizedField(product, 'title', locale) || product.title,
  }

  // Localize category if present
  if (product.category) {
    localized.category = localizeCategory(product.category, locale)
  }

  // Localize variants
  if (Array.isArray(product.variants)) {
    localized.variants = product.variants.map((variant: any) => ({
      ...variant,
      title: getLocalizedField(variant, 'title', locale) || variant.title,
    }))
  }

  // Localize options & choices
  if (Array.isArray(product.options)) {
    localized.options = product.options.map((option: any) => ({
      ...option,
      title: getLocalizedField(option, 'title', locale) || option.title,
      choices: Array.isArray(option.choices)
        ? option.choices.map((choice: any) => ({
            ...choice,
            name: getLocalizedField(choice, 'name', locale) || choice.name,
          }))
        : option.choices,
    }))
  }

  // Localize addons
  if (Array.isArray(product.addons)) {
    localized.addons = product.addons.map((addon: any) => ({
      ...addon,
      title: getLocalizedField(addon, 'title', locale) || addon.title,
    }))
  }

  return localized as T
}

