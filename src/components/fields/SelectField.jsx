import React from 'react'

export function SelectField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  placeholder = '请选择',
  disabled,
  options = [],
  asyncValidating,
  ...rest
}) {
  const hasError = error && error.length > 0
  const id = `field-${name}`

  return (
    <div className={`form-field ${hasError ? 'error' : ''}`} data-testid={`form-field-${name}`}>
      {label && (
        <label htmlFor={id}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <select
        id={id}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        disabled={disabled}
        data-testid={`select-${name}`}
        {...rest}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {asyncValidating && (
        <div className="async-validation" data-testid={`async-validating-${name}`}>
          正在验证...
        </div>
      )}
      {hasError && (
        <div className="error-message" data-testid={`error-${name}`}>
          {error[0]}
        </div>
      )}
    </div>
  )
}
