import { describe, it, expect, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import React from 'react'

afterEach(() => {
  cleanup()
})

describe('hr MDX override', () => {
  it('renders a div with not-prose class', async () => {
    const { useMDXComponents } = await import('@/mdx-components')
    const components = useMDXComponents()
    const Hr = components.hr as React.ComponentType
    const { container } = render(<Hr />)
    const wrapper = container.querySelector('.not-prose')
    expect(wrapper).not.toBeNull()
  })

  it('renders a centered divider with items-center class', async () => {
    const { useMDXComponents } = await import('@/mdx-components')
    const components = useMDXComponents()
    const Hr = components.hr as React.ComponentType
    const { container } = render(<Hr />)
    const wrapper = container.querySelector('.items-center')
    expect(wrapper).not.toBeNull()
  })

  it('renders an inner div acting as the thin line', async () => {
    const { useMDXComponents } = await import('@/mdx-components')
    const components = useMDXComponents()
    const Hr = components.hr as React.ComponentType
    const { container } = render(<Hr />)
    const line = container.querySelector('.h-px')
    expect(line).not.toBeNull()
  })
})
