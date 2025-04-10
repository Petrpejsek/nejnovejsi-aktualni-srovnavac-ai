import { ReactNode, ButtonHTMLAttributes } from 'react'
import { twMerge } from 'tailwind-merge'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function Button({
  children,
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variants = {
    default: 'bg-purple-600 text-white hover:bg-purple-700',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 bg-white hover:bg-gray-100 text-gray-700',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200'
  }

  const sizes = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3',
    lg: 'h-11 px-8'
  }

  return (
    <button
      className={twMerge(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
} 