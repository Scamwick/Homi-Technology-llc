import { forwardRef, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive' | 'glow'
  glowColor?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      glowColor,
      padding = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-surface-1 border border-surface-3 rounded-brand-lg'
    
    const variants = {
      default: '',
      elevated: 'shadow-brand',
      interactive: 'cursor-pointer hover:border-brand-cyan transition-colors',
      glow: '',
    }

    const paddings = {
      none: '',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    }

    const glowStyle = variant === 'glow' && glowColor
      ? { boxShadow: `0 0 20px ${glowColor}20` }
      : undefined

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          className
        )}
        style={glowStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Sub-components for Card structure
function CardHeader({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('mb-4', className)}>{children}</div>
}

function CardTitle({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <h3 className={cn('text-lg font-semibold', className)}>{children}</h3>
}

function CardDescription({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <p className={cn('text-sm text-text-2 mt-1', className)}>{children}</p>
}

function CardBody({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={className}>{children}</div>
}

function CardFooter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={cn('mt-4 pt-4 border-t border-surface-3', className)}>{children}</div>
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Body = CardBody
Card.Footer = CardFooter

export { Card }
