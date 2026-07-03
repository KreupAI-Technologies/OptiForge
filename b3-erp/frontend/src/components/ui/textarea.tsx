'use client'

import React, { TextareaHTMLAttributes, forwardRef } from 'react'
import { AlertCircle } from 'lucide-react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  resize?: 'none' | 'vertical' | 'horizontal' | 'both'
  variant?: 'default' | 'filled' | 'outlined'
  showCharCount?: boolean
  maxLength?: number
}

/**
 * Textarea - Multi-line text input with character counter
 *
 * @example
 * <Textarea
 *   label="Description"
 *   placeholder="Enter description..."
 *   rows={4}
 *   maxLength={500}
 *   showCharCount
 *   required
 * />
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  required,
  resize = 'vertical',
  variant = 'default',
  showCharCount = false,
  maxLength,
  className = '',
  disabled,
  value,
  ...props
}, ref) => {
  const resizeClasses = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize'
  }

  const variantClasses = {
    default: 'bg-white border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    filled: 'bg-gray-100 border border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
    outlined: 'bg-transparent border-2 border-gray-300 focus:border-blue-500'
  }

  const charCount = typeof value === 'string' ? value.length : 0

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        disabled={disabled}
        maxLength={maxLength}
        value={value}
        className={`
          w-full px-4 py-2 text-sm rounded-lg transition-all outline-none
          ${resizeClasses[resize]}
          ${variantClasses[variant]}
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
          ${className}
        `}
        {...props}
      />

      <div className="flex items-start justify-between gap-2 mt-1.5">
        <div className="flex-1">
          {error && (
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {helperText && !error && (
            <p className="text-sm text-gray-500">{helperText}</p>
          )}
        </div>

        {showCharCount && maxLength && (
          <p className={`text-xs font-medium flex-shrink-0 ${
            charCount > maxLength * 0.9 ? 'text-orange-600' : 'text-gray-500'
          }`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
})

Textarea.displayName = 'Textarea'
