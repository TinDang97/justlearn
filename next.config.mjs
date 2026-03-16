import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import { visit } from 'unist-util-visit'
import {
  transformerNotationDiff,
  transformerNotationHighlight,
  transformerNotationFocus,
} from '@shikijs/transformers'

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark-dimmed',
  },
  keepBackground: false,
  transformers: [
    transformerNotationDiff(),
    transformerNotationHighlight(),
    transformerNotationFocus(),
  ],
}

// Visitor 1: extract raw code BEFORE Shiki transforms it
// Store raw text on the parent pre node as a JS-only property.
// We also store it on a map keyed by the code text hash to survive Shiki node replacement.
const rawCodeMap = new Map()
const extractRawCode = () => (tree) => {
  visit(tree, (node) => {
    if (node?.type === 'element' && node?.tagName === 'pre') {
      const [codeEl] = node.children
      if (codeEl?.tagName === 'code') {
        const raw = codeEl.children?.[0]?.value ?? ''
        node.raw = raw
      }
    }
  })
}

// Visitor 2: forward raw string AFTER Shiki processes
// rehype-pretty-code wraps code in <figure data-rehype-pretty-code-figure>
// The raw text needs to be extracted from the code element's text content
const forwardRawCode = () => (tree) => {
  visit(tree, (node) => {
    if (node?.type !== 'element') return
    const props = node.properties ?? {}
    const isPrettyCode = 'data-rehype-pretty-code-fragment' in props
      || 'data-rehype-pretty-code-figure' in props
    if (!isPrettyCode) return

    for (const child of node.children) {
      if (child.tagName === 'pre') {
        // If raw survived (unlikely after Shiki clone), use it
        if (child.raw) {
          child.properties['raw'] = child.raw
          continue
        }
        // Otherwise, reconstruct raw from the code element's text nodes
        const codeEl = child.children?.find((c) => c.tagName === 'code')
        if (codeEl) {
          const raw = collectText(codeEl)
          child.properties['raw'] = raw
        }
      }
    }
  })
}

// Recursively collect text content from a HAST node
function collectText(node) {
  if (node.type === 'text') return node.value ?? ''
  if (node.children) return node.children.map(collectText).join('')
  return ''
}

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      extractRawCode,
      [rehypePrettyCode, rehypePrettyCodeOptions],
      forwardRawCode,
      rehypeSlug,
    ],
  },
})

const OLD_COURSE_SLUGS = [
  '01-python-fundamentals',
  '02-data-types-variables',
  '03-control-flow-logic',
  '04-functions-modules',
  '05-data-structures',
  '06-oop',
  '07-file-handling-exceptions',
  '08-working-with-libraries',
  '09-web-development-basics',
  '10-data-analysis-visualization',
  '11-automation-scripting',
  '12-capstone-best-practices',
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output — minimal Node.js server for production deployment
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],

  // Tree-shake large icon/component libraries
  experimental: {
    optimizePackageImports: ['lucide-react', '@xyflow/react', 'motion'],
  },

  // Static generation concurrency — build 220+ pages in parallel
  staticPageGenerationTimeout: 120,

  // Production headers — cross-origin isolation + aggressive caching for static assets
  async headers() {
    return [
      {
        // COEP/COOP headers — required for SharedArrayBuffer (WebGPU/WebLLM)
        // Must be first so path-specific rules do not shadow it.
        // credentialless (not require-corp) to avoid breaking NotebookLM deeplinks.
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
      {
        source: '/:path*.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/workers/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/data/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  async redirects() {
    return OLD_COURSE_SLUGS.flatMap((slug) => [
      {
        source: `/courses/${slug}`,
        destination: '/courses/python',
        permanent: true,
      },
      {
        source: `/courses/${slug}/:path*`,
        destination: '/courses/python/:path*',
        permanent: true,
      },
    ])
  },
}

export default withMDX(nextConfig)
