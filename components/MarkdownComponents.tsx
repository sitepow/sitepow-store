/* eslint-disable @next/next/no-img-element */
import { ComponentProps, ElementType } from 'react'
import type { Components } from 'react-markdown'

import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

type AdmonitionType = 'note' | 'tip' | 'danger' | 'info' | 'caution'
interface CustomComponents extends Components {
  accordion?: ElementType<ComponentProps<'details'>>
  accordionheader?: ElementType<ComponentProps<'summary'>>
  accordioncontent?: ElementType<ComponentProps<'div'>>
}

const ADMONITION_COLORS: Record<AdmonitionType, string> = {
  note: 'border-l-blue-500 bg-blue-50/50 text-blue-900',
  tip: 'border-l-emerald-500 bg-emerald-50/50 text-emerald-900',
  danger: 'border-l-red-500 bg-red-50/50 text-red-900',
  info: 'border-l-sky-500 bg-sky-50/50 text-sky-900',
  caution: 'border-l-amber-500 bg-amber-50/50 text-amber-900',
}

export const MarkdownComponents = (fallbackAlt: string): CustomComponents => ({
  li: ({ children, className, ...props }) => {
    const isTask = className?.includes('task-list-item')
    return (
      <li
        {...props}
        className={cn(
          'my-2.5',
          className,
          isTask && '-ml-6 flex list-none items-start gap-2',
        )}
      >
        {children}
      </li>
    )
  },

  input: ({ type, checked }) => {
    if (type === 'checkbox') {
      return (
        <input
          readOnly
          checked={checked}
          className="text-primary focus:ring-primary mt-1.5 h-4 w-4 rounded border-gray-300"
          type="checkbox"
        />
      )
    }
    return null
  },

  a: ({ node, ...props }) => (
    <a
      {...props}
      className="underline underline-offset-4"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),

  table: ({ children }) => (
    <div className="my-3 w-full overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300 dark:border-gray-700">
        {children}
      </table>
    </div>
  ),

  thead: ({ children }) => (
    <thead className="bg-gray-100 dark:bg-gray-800">{children}</thead>
  ),

  th: ({ children }) => (
    <th className="border border-gray-300 px-4 py-2 text-left font-bold dark:border-gray-700">
      {children}
    </th>
  ),

  td: ({ children }) => (
    <td className="border border-gray-300 px-4 py-2 dark:border-gray-700">
      {children}
    </td>
  ),

  accordion: ({ children, className }: ComponentProps<'details'>) => (
    <details
      className={cn(
        'group my-2 overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-transparent',
        className,
      )}
    >
      {children}
    </details>
  ),

  accordionheader: ({ children, className }: ComponentProps<'summary'>) => (
    <summary
      className={cn(
        'flex cursor-pointer list-none items-center justify-between p-4 font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
        'list-none [&::-webkit-details-marker]:hidden',
        className,
      )}
    >
      <span className="flex-1">{children}</span>
      <ChevronDown className="size-5 shrink-0 transition-transform duration-300 group-open:rotate-180" />
    </summary>
  ),

  accordioncontent: ({ children, className }: ComponentProps<'p'>) => (
    <div
      className={cn(
        'border-t border-gray-100 p-6 text-gray-600 dark:border-gray-800 dark:text-gray-400',
        '[&>p]:m-0 [&>p]:leading-relaxed',
        className,
      )}
    >
      {children}
    </div>
  ),

  img: ({ alt, ...props }) => (
    <img
      {...props}
      alt={alt || fallbackAlt}
      className="my-4 w-full rounded-xl border border-gray-100"
      loading="lazy"
    />
  ),

  hr: () => (
    <hr className="my-8 border-t border-gray-200 dark:border-gray-800" />
  ),

  div: ({ className, children, ...props }) => {
    const classList = className?.split(' ') || []
    const isAdmonition = classList.includes('admonition')
    const type = classList.find((c): c is AdmonitionType =>
      Object.keys(ADMONITION_COLORS).includes(c),
    )

    if (isAdmonition && type) {
      const colorStyle = ADMONITION_COLORS[type]
      return (
        <div
          className={cn(
            'my-6 rounded-r-lg border-l-4 p-4 font-sans leading-relaxed shadow-sm',
            colorStyle,
          )}
        >
          {children}
        </div>
      )
    }

    return (
      <div {...props} className={className}>
        {children}
      </div>
    )
  },
})
