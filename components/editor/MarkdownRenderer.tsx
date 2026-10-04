/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useMemo } from 'react'
import ReactMarkdown from 'react-markdown'

import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import remarkDirective from 'remark-directive'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'

import { cn } from '@/lib/utils'

import { MarkdownComponents } from '@/components/editor/MarkdownComponents'

const remarkDirectiveToRehype = () => {
  return (tree: any) => {
    visit(tree, (node: any) => {
      if (
        node.type === 'containerDirective' ||
        node.type === 'leafDirective' ||
        node.type === 'textDirective'
      ) {
        const data = node.data || (node.data = {})
        data.hName = 'div'
        data.hProperties = {
          className: cn('admonition', node.name, node.attributes?.class),
        }
      }
    })
  }
}

interface MarkdownRendererProps {
  content: string
  fallbackAlt?: string
  className?: string
}

export const MarkdownRenderer = ({
  content,
  fallbackAlt = 'image',
  className,
}: MarkdownRendererProps) => {
  const components = useMemo(
    () => MarkdownComponents(fallbackAlt),
    [fallbackAlt],
  )

  const sanitizeSchema = useMemo(
    () => ({
      ...defaultSchema,
      tagNames: [
        ...(defaultSchema.tagNames || []),
        'mark',
        'div',
        'span',
        'input',
        'accordion',
        'accordionheader',
        'accordioncontent',
      ],
      attributes: {
        ...defaultSchema.attributes,
        div: [...(defaultSchema.attributes?.div || []), 'className'],
        input: ['type', 'checked', 'readOnly', 'className'],
        accordion: ['className', 'open'],
        accordionheader: ['className'],
        accordioncontent: ['className'],
      },
    }),
    [],
  )

  return (
    <article
      className={cn(
        'prose prose-neutral dark:prose-invert w-full max-w-none text-start md:w-3xl',
        'prose-base md:prose-lg lg:prose-xl',

        'prose-headings:tracking-tight prose-headings:font-bold',
        'prose-h1:text-3xl md:prose-h1:text-4xl lg:prose-h1:text-5xl',
        'prose-h2:text-2xl md:prose-h2:text-3xl',

        'prose-img:rounded-2xl prose-img:shadow-md',
        'prose-pre:max-w-[90vw] md:prose-pre:max-w-none',
        'prose-table:block prose-table:overflow-x-auto',

        'text-foreground leading-relaxed antialiased',

        className,
      )}
    >
      <ReactMarkdown
        components={components}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
        remarkPlugins={[remarkGfm, remarkDirective, remarkDirectiveToRehype]}
      >
        {content}
      </ReactMarkdown>
    </article>
  )
}
