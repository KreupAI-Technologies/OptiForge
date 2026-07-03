'use client'

import React, { InputHTMLAttributes, forwardRef } from 'react'
import { Check, Minus } from 'lucide-react'

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
  indeterminate?: boolean
}

/**
 * Checkbox - Custom styled checkbox with label and description
 *
 * @example
 * <Checkbox
 *   label="Accept terms and conditions"
 *   description="You must agree to continue"
 *   required
 * />
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  error,
  size = 'md',
  indeterminate = false,
  className = '',
  disabled,
  checked,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex items-center h-5">
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className={`
            ${sizeClasses[size]}
            border-2 rounded transition-all cursor-pointer
            peer-focus:ring-2 peer-focus:ring-blue-500/20
            ${checked || indeterminate
              ? 'bg-blue-600 border-blue-600'
              : 'bg-white border-gray-300 peer-hover:border-blue-400'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${error ? 'border-red-500' : ''}
          `}>
            {(checked || indeterminate) && (
              <div className="flex items-center justify-center h-full">
                {indeterminate ? (
                  <Minus className={`${iconSizes[size]} text-white`} />
                ) : (
                  <Check className={`${iconSizes[size]} text-white`} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {(label || description) && (
        <div className="flex-1">
          {label && (
            <label className={`
              block font-medium text-gray-900 cursor-pointer
              ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-base' : 'text-sm'}
              ${disabled ? 'cursor-not-allowed opacity-60' : ''}
            `}>
              {label}
            </label>
          )}
          {description && (
            <p className={`text-gray-600 mt-0.5 ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              {description}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}
        </div>
      )}
    </div>
  )
})

Checkbox.displayName = 'Checkbox'
