import React from 'react'

export function RadioField({
  name,
  label,
  value,
  onChange,
  onBlur,
  error,
  required,
  disabled,
  options = [],
  asyncValidating,
  ...rest
}) {
  const hasError = error && error.length > 0
  const groupId = `field-${name}`

  return (
    <div className={`form-field ${hasError ? 'error' : ''}`} data-testid={`form-field-${name}`}>
      {label && (
        <label>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
        {options.map((option) => {
          const optionId = `${groupId}-${option.value}`
          return (
            <label key={option.value} htmlFor={optionId} style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                id={optionId}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(name, e.target.value)}
                onBlur={() => onBlur(name)}
                disabled={disabled}
                data-testid={`radio-${name}-${option.value}`}
                {...rest}
              />
              <span style={{ marginLeft: '8px' }}>{option.label}</span>
            </label>
          )
        })}
      </div>
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
