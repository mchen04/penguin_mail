import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/utils/cn'
import styles from './Button.module.css'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'small' | 'default' | 'large'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  iconOnly?: boolean
  children: ReactNode
}

export function Button({
  variant = 'secondary',
  size = 'default',
  iconOnly = false,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        size !== 'default' && styles[size],
        iconOnly && styles.iconOnly,
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
