import React from 'react'

export function TextField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  placeholder,
  disabled,
  type = 'text',
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
      <input
        id={id}
        type={type}
        name={name}
        value={value || ''}
        onChange={(e) => onChange(name, e.target.value)}
        onBlur={() => onBlur(name)}
        placeholder={placeholder}
        disabled={disabled}
        data-testid={`input-${name}`}
        {...rest}
      />
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
