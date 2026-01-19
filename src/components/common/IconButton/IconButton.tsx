import { memo, type ButtonHTMLAttributes } from 'react'
import { Icon, type IconName } from '@/components/common/Icon/Icon'
import { cn } from '@/utils/cn'
import styles from './IconButton.module.css'

type IconButtonSize = 'small' | 'default' | 'large'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName
  size?: IconButtonSize
  label: string // Required for accessibility
}

export const IconButton = memo(function IconButton({
  icon,
  size = 'default',
  label,
  className,
  ...props
}: IconButtonProps) {
  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20

  return (
    <button
      className={cn(
        styles.iconButton,
        size !== 'default' && styles[size],
        className
      )}
      aria-label={label}
      title={label}
      {...props}
    >
      <Icon name={icon} size={iconSize} />
    </button>
  )
})
