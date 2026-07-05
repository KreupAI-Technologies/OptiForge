'use client'

import React, { InputHTMLAttributes, forwardRef } from 'react'

export interface RadioOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string
  description?: string
  error?: string
  size?: 'sm' | 'md' | 'lg'
}

export interface RadioGroupProps {
  label?: string
  description?: string
  options: RadioOption[]
  value?: string
  onChange?: (value: string) => void
  error?: string
  required?: boolean
  orientation?: 'vertical' | 'horizontal'
  size?: 'sm' | 'md' | 'lg'
  name: string
}

/**
 * Radio - Single radio button component
 */
export const Radio = forwardRef<HTMLInputElement, RadioProps>(({
  label,
  description,
  error,
  size = 'md',
  className = '',
  disabled,
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <div className="flex items-center h-5">
        <div className="relative">
          <input
            ref={ref}
            type="radio"
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div className={`
            ${sizeClasses[size]}
            border-2 rounded-full transition-all cursor-pointer
            peer-focus:ring-2 peer-focus:ring-blue-500/20
            peer-checked:border-blue-600 peer-checked:border-[6px]
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'border-gray-300 peer-hover:border-blue-400'}
            ${error ? 'border-red-500' : ''}
          `} />
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
        </div>
      )}
    </div>
  )
})

Radio.displayName = 'Radio'

/**
 * RadioGroup - Group of radio buttons
 *
 * @example
 * <RadioGroup
 *   label="Priority Level"
 *   name="priority"
 *   options={[
 *     { value: 'low', label: 'Low', description: 'Non-urgent' },
 *     { value: 'medium', label: 'Medium', description: 'Standard priority' },
 *     { value: 'high', label: 'High', description: 'Urgent' }
 *   ]}
 *   value={priority}
 *   onChange={setPriority}
 * />
 */
export const RadioGroup: React.FC<RadioGroupProps> = ({
  label,
  description,
  options,
  value,
  onChange,
  error,
  required,
  orientation = 'vertical',
  size = 'md',
  name
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-3">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {description && (
        <p className="text-sm text-gray-600 mb-3">{description}</p>
      )}

      <div className={`
        ${orientation === 'vertical' ? 'space-y-3' : 'flex flex-wrap gap-2'}
      `}>
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            description={option.description}
            checked={value === option.value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={option.disabled}
            size={size}
            error={error}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}
    </div>
  )
}
