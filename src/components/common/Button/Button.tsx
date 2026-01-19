import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'default',
    iconOnly = false,
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
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
})
