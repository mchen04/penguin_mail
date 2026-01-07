import type { InputHTMLAttributes } from 'react'
import { cn } from '@/utils/cn'
import styles from './Checkbox.module.css'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
}

export function Checkbox({ className, label, id, ...props }: CheckboxProps) {
  return (
    <span className={styles.wrapper}>
      <input
        type="checkbox"
        id={id}
        className={cn(styles.checkbox, className)}
        aria-label={label}
        {...props}
      />
    </span>
  )
}
