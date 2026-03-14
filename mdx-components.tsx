import type { MDXComponents } from 'mdx/types'
import { CopyButton } from '@/components/copy-button'

export function useMDXComponents(): MDXComponents {
  return {
    pre: ({
      children,
      raw,
      ...props
    }: React.ComponentProps<'pre'> & { raw?: string }) => (
      <div className="relative group not-prose">
        <pre {...props} className="overflow-x-auto rounded-lg p-4 text-sm">
          {children}
        </pre>
        {raw && <CopyButton code={raw} />}
      </div>
    ),
    code: ({ children, ...props }: React.ComponentProps<'code'>) => (
      <code {...props}>{children}</code>
    ),
  }
}
