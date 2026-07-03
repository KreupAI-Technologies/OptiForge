'use client'

import React, { InputHTMLAttributes, forwardRef } from 'react'
import { AlertCircle, Eye, EyeOff } from 'lucide-react'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'filled' | 'outlined'
}

/**
 * Input - Reusable input field with validation and icons
 *
 * @example
 * <Input
 *   label="Email Address"
 *   type="email"
 *   placeholder="you@example.com"
 *   required
 *   error={errors.email}
 *   helperText="We'll never share your email"
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  required,
  leftIcon,
  rightIcon,
  size = 'md',
  variant = 'default',
  className = '',
  type = 'text',
  disabled,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false)

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  const variantClasses = {
    default: 'bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    filled: 'bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    outlined: 'bg-transparent border-2 border-gray-300 focus:border-blue-500'
  }

  const inputType = type === 'password' && showPassword ? 'text' : type

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}

        <input
          ref={ref}
          type={inputType}
          disabled={disabled}
          className={`
            w-full rounded-lg transition-all outline-none
            ${sizeClasses[size]}
            ${variantClasses[variant]}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || type === 'password' ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
            ${className}
          `}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}

        {rightIcon && type !== 'password' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {helperText && !error && (
        <p className="text-sm text-gray-500 mt-1.5">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
