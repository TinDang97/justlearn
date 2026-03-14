import { render, screen, cleanup } from '@testing-library/react'
import { describe, it, expect, afterEach } from 'vitest'
import { Callout, Tip, Warning, Info, ErrorCallout } from '@/components/callout'

afterEach(() => {
  cleanup()
})

describe('Callout base component', () => {
  it('renders children content', () => {
    render(<Callout variant="tip">Hello world</Callout>)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  it('renders default title for tip variant', () => {
    render(<Callout variant="tip">content</Callout>)
    expect(screen.getByText('Tip')).toBeInTheDocument()
  })

  it('renders default title for warning variant', () => {
    render(<Callout variant="warning">content</Callout>)
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('renders default title for info variant', () => {
    render(<Callout variant="info">content</Callout>)
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('renders default title for error variant', () => {
    render(<Callout variant="error">content</Callout>)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('renders custom title when provided', () => {
    render(<Callout variant="tip" title="Pro tip!">content</Callout>)
    expect(screen.getByText('Pro tip!')).toBeInTheDocument()
    expect(screen.queryByText('Tip')).not.toBeInTheDocument()
  })

  it('tip variant has green border class', () => {
    const { container } = render(<Callout variant="tip">content</Callout>)
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toMatch(/border-green/)
  })

  it('warning variant has amber border class', () => {
    const { container } = render(<Callout variant="warning">content</Callout>)
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toMatch(/border-amber/)
  })

  it('info variant has blue border class', () => {
    const { container } = render(<Callout variant="info">content</Callout>)
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toMatch(/border-blue/)
  })

  it('error variant has red border class', () => {
    const { container } = render(<Callout variant="error">content</Callout>)
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toMatch(/border-red/)
  })
})

describe('Tip shorthand component', () => {
  it('renders with default Tip title', () => {
    render(<Tip>A useful tip</Tip>)
    expect(screen.getByText('Tip')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Tip>A useful tip</Tip>)
    expect(screen.getByText('A useful tip')).toBeInTheDocument()
  })

  it('accepts custom title', () => {
    render(<Tip title="Note">A useful tip</Tip>)
    expect(screen.getByText('Note')).toBeInTheDocument()
  })

  it('has green border', () => {
    const { container } = render(<Tip>content</Tip>)
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toMatch(/border-green/)
  })
})

describe('Warning shorthand component', () => {
  it('renders with default Warning title', () => {
    render(<Warning>Be careful</Warning>)
    expect(screen.getByText('Warning')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Warning>Be careful</Warning>)
    expect(screen.getByText('Be careful')).toBeInTheDocument()
  })

  it('has amber border', () => {
    const { container } = render(<Warning>content</Warning>)
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toMatch(/border-amber/)
  })
})

describe('Info shorthand component', () => {
  it('renders with default Info title', () => {
    render(<Info>Some info</Info>)
    expect(screen.getByText('Info')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<Info>Some info</Info>)
    expect(screen.getByText('Some info')).toBeInTheDocument()
  })

  it('has blue border', () => {
    const { container } = render(<Info>content</Info>)
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toMatch(/border-blue/)
  })
})

describe('ErrorCallout shorthand component', () => {
  it('renders with default Error title', () => {
    render(<ErrorCallout>An error occurred</ErrorCallout>)
    expect(screen.getByText('Error')).toBeInTheDocument()
  })

  it('renders children', () => {
    render(<ErrorCallout>An error occurred</ErrorCallout>)
    expect(screen.getByText('An error occurred')).toBeInTheDocument()
  })

  it('has red border', () => {
    const { container } = render(<ErrorCallout>content</ErrorCallout>)
    const callout = container.firstChild as HTMLElement
    expect(callout.className).toMatch(/border-red/)
  })
})
