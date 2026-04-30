import React from 'react'
import { useFormEngine } from '../hooks/useFormEngine'
import { FieldRenderer } from './fields'

export function FormEngine({
  schema,
  initialValues = {},
  onSubmit,
  submitButtonText = '提交',
  showSubmitButton = true,
  children,
  ...rest
}) {
  const formState = useFormEngine(schema, initialValues, onSubmit)
  const { handleSubmit, visibleFields, submitting } = formState

  return (
    <form onSubmit={handleSubmit} className="form-container" {...rest}>
      {visibleFields.map((field) => (
        <FieldRenderer key={field.name} field={field} formState={formState} />
      ))}
      
      {children}
      
      {showSubmitButton && (
        <button
          type="submit"
          className="submit-btn"
          disabled={submitting}
          data-testid="submit-button"
        >
          {submitting ? '提交中...' : submitButtonText}
        </button>
      )}
    </form>
  )
}

export { useFormEngine }
