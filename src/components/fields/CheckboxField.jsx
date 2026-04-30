import React from 'react'

export function CheckboxField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  disabled,
  asyncValidating,
  ...rest
}) {
  const hasError = error && error.length > 0
  const id = `field-${name}`

  return (
    <div className={`form-field ${hasError ? 'error' : ''}`} data-testid={`form-field-${name}`}>
      <label htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          name={name}
          checked={!!value}
          onChange={(e) => onChange(name, e.target.checked)}
          onBlur={() => onBlur(name)}
          disabled={disabled}
          data-testid={`checkbox-${name}`}
          {...rest}
        />
        <span style={{ marginLeft: '8px' }}>
          {label}
          {required && <span className="required">*</span>}
        </span>
      </label>
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
