import type { ReactNode } from 'react'
import { Lightbulb, AlertTriangle, Info as InfoIcon, AlertCircle } from 'lucide-react'

type CalloutVariant = 'tip' | 'warning' | 'info' | 'error'

interface CalloutProps {
  variant: CalloutVariant
  title?: string
  children: ReactNode
}

interface VariantConfig {
  icon: React.ComponentType<{ className?: string }>
  borderClass: string
  bgClass: string
  defaultTitle: string
  iconClass: string
}

const variantConfig: Record<CalloutVariant, VariantConfig> = {
  tip: {
    icon: Lightbulb,
    borderClass: 'border-green-500',
    bgClass: 'bg-green-50 dark:bg-green-950/20',
    defaultTitle: 'Tip',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  warning: {
    icon: AlertTriangle,
    borderClass: 'border-amber-500',
    bgClass: 'bg-amber-50 dark:bg-amber-950/20',
    defaultTitle: 'Warning',
    iconClass: 'text-amber-600 dark:text-amber-400',
  },
  info: {
    icon: InfoIcon,
    borderClass: 'border-blue-500',
    bgClass: 'bg-blue-50 dark:bg-blue-950/20',
    defaultTitle: 'Info',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  error: {
    icon: AlertCircle,
    borderClass: 'border-red-500',
    bgClass: 'bg-red-50 dark:bg-red-950/20',
    defaultTitle: 'Error',
    iconClass: 'text-red-600 dark:text-red-400',
  },
}

export function Callout({ variant, title, children }: CalloutProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const displayTitle = title ?? config.defaultTitle

  return (
    <div
      className={`not-prose border-l-[3px] ${config.borderClass} ${config.bgClass} rounded-r-lg my-6 p-4`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`h-4 w-4 shrink-0 ${config.iconClass}`} />
        <span className={`font-semibold text-sm ${config.iconClass}`}>{displayTitle}</span>
      </div>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  )
}

export function Tip({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout variant="tip" title={title}>{children}</Callout>
}

export function Warning({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout variant="warning" title={title}>{children}</Callout>
}

export function Info({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout variant="info" title={title}>{children}</Callout>
}

export function ErrorCallout({ title, children }: { title?: string; children: ReactNode }) {
  return <Callout variant="error" title={title}>{children}</Callout>
}
