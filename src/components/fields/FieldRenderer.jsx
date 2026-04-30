import React from 'react'
import { FIELD_TYPES } from '../../constants'
import { TextField } from './TextField'
import { TextAreaField } from './TextAreaField'
import { SelectField } from './SelectField'
import { CheckboxField } from './CheckboxField'
import { RadioField } from './RadioField'

export function FieldRenderer({ field, formState }) {
  const {
    name,
    type,
    label,
    required,
    placeholder,
    disabled,
    options,
    rows,
  } = field

  const {
    values,
    errors,
    asyncValidating,
    handleChange,
    handleBlur,
    getFieldError,
    isAsyncValidating,
  } = formState

  const value = values[name]
  const error = getFieldError(name)
  const asyncValidatingField = isAsyncValidating(name)

  const commonProps = {
    name,
    label,
    value,
    error,
    required,
    disabled,
    onChange: handleChange,
    onBlur: handleBlur,
    asyncValidating: asyncValidatingField,
  }

  switch (type) {
    case FIELD_TYPES.TEXT:
    case FIELD_TYPES.EMAIL:
    case FIELD_TYPES.PASSWORD:
    case FIELD_TYPES.NUMBER:
    case FIELD_TYPES.DATE:
      return (
        <TextField
          {...commonProps}
          type={type}
          placeholder={placeholder}
        />
      )

    case FIELD_TYPES.TEXTAREA:
      return (
        <TextAreaField
          {...commonProps}
          placeholder={placeholder}
          rows={rows}
        />
      )

    case FIELD_TYPES.SELECT:
      return (
        <SelectField
          {...commonProps}
          options={options}
          placeholder={placeholder}
        />
      )

    case FIELD_TYPES.CHECKBOX:
      return <CheckboxField {...commonProps} />

    case FIELD_TYPES.RADIO:
      return (
        <RadioField
          {...commonProps}
          options={options}
        />
      )

    default:
      return (
        <TextField
          {...commonProps}
          type="text"
          placeholder={placeholder}
        />
      )
  }
}
