import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type InputProps = InputHTMLAttributes<HTMLInputElement>

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      className={cn(
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base outline-none transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  ),
)

Input.displayName = 'Input'
