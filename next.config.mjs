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
const extractRawCode = () => (tree) => {
  visit(tree, (node) => {
    if (node?.type === 'element' && node?.tagName === 'pre') {
      const [codeEl] = node.children
      if (codeEl?.tagName === 'code') {
        node.raw = codeEl.children?.[0]?.value ?? ''
      }
    }
  })
}

// Visitor 2: forward raw string AFTER Shiki processes
const forwardRawCode = () => (tree) => {
  visit(tree, (node) => {
    if (node?.type === 'element' && node?.tagName === 'div') {
      if (!('data-rehype-pretty-code-fragment' in (node.properties ?? {}))) return
      for (const child of node.children) {
        if (child.tagName === 'pre') {
          child.properties['raw'] = node.raw
        }
      }
    }
  })
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

  // Production headers — aggressive caching for static assets
  async headers() {
    return [
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
