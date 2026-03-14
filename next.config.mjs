import createMDX from '@next/mdx'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import { visit } from 'unist-util-visit'

/** @type {import('rehype-pretty-code').Options} */
const rehypePrettyCodeOptions = {
  theme: {
    light: 'github-light',
    dark: 'github-dark-dimmed',
  },
  keepBackground: false,
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

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

export default withMDX(nextConfig)
