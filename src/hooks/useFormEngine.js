import { useState, useCallback, useMemo } from 'react'
import { VALIDATION_TYPES, CONDITION_OPERATORS } from '../constants'

export function useFormEngine(schema, initialValues = {}, onSubmit) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [asyncValidating, setAsyncValidating] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const getValue = useCallback((name) => {
    return values[name]
  }, [values])

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    setTouched(prev => ({ ...prev, [name]: true }))
  }, [])

  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({ ...prev, [name]: isTouched }))
  }, [])

  const evaluateCondition = useCallback((condition, formValues) => {
    if (!condition) return true

    const { field, operator, value } = condition
    const fieldValue = formValues[field]

    switch (operator) {
      case CONDITION_OPERATORS.EQUALS:
        return fieldValue === value
      case CONDITION_OPERATORS.NOT_EQUALS:
        return fieldValue !== value
      case CONDITION_OPERATORS.CONTAINS:
        return typeof fieldValue === 'string' && fieldValue.includes(value)
      case CONDITION_OPERATORS.NOT_CONTAINS:
        return typeof fieldValue === 'string' && !fieldValue.includes(value)
      case CONDITION_OPERATORS.GREATER_THAN:
        return Number(fieldValue) > Number(value)
      case CONDITION_OPERATORS.LESS_THAN:
        return Number(fieldValue) < Number(value)
      case CONDITION_OPERATORS.IS_EMPTY:
        return fieldValue === undefined || fieldValue === null || fieldValue === ''
      case CONDITION_OPERATORS.IS_NOT_EMPTY:
        return fieldValue !== undefined && fieldValue !== null && fieldValue !== ''
      default:
        return true
    }
  }, [])

  const visibleFields = useMemo(() => {
    return schema.fields.filter(field => {
      if (!field.condition) return true
      return evaluateCondition(field.condition, values)
    })
  }, [schema.fields, values, evaluateCondition])

  const validateField = useCallback(async (field, value, allValues) => {
    const fieldErrors = []

    if (!field.validations || field.validations.length === 0) {
      return fieldErrors
    }

    for (const validation of field.validations) {
      switch (validation.type) {
        case VALIDATION_TYPES.REQUIRED:
          if (value === undefined || value === null || value === '' ||
              (Array.isArray(value) && value.length === 0)) {
            fieldErrors.push(validation.message || '此字段为必填项')
          }
          break

        case VALIDATION_TYPES.MIN_LENGTH:
          if (typeof value === 'string' && value.length < validation.value) {
            fieldErrors.push(validation.message || `最少需要 ${validation.value} 个字符`)
          }
          break

        case VALIDATION_TYPES.MAX_LENGTH:
          if (typeof value === 'string' && value.length > validation.value) {
            fieldErrors.push(validation.message || `最多允许 ${validation.value} 个字符`)
          }
          break

        case VALIDATION_TYPES.MIN:
          if (value !== '' && value !== null && value !== undefined) {
            if (Number(value) < validation.value) {
              fieldErrors.push(validation.message || `最小值为 ${validation.value}`)
            }
          }
          break

        case VALIDATION_TYPES.MAX:
          if (value !== '' && value !== null && value !== undefined) {
            if (Number(value) > validation.value) {
              fieldErrors.push(validation.message || `最大值为 ${validation.value}`)
            }
          }
          break

        case VALIDATION_TYPES.PATTERN:
          if (typeof value === 'string' && value !== '') {
            const regex = new RegExp(validation.value)
            if (!regex.test(value)) {
              fieldErrors.push(validation.message || '格式不正确')
            }
          }
          break

        case VALIDATION_TYPES.EMAIL:
          if (typeof value === 'string' && value !== '') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) {
              fieldErrors.push(validation.message || '请输入有效的邮箱地址')
            }
          }
          break

        case VALIDATION_TYPES.ASYNC:
          if (validation.validator && value !== '' && value !== null && value !== undefined) {
            setAsyncValidating(prev => ({ ...prev, [field.name]: true }))
            try {
              const isValid = await validation.validator(value, allValues)
              if (!isValid) {
                fieldErrors.push(validation.message || '异步验证失败')
              }
            } catch (error) {
              fieldErrors.push(validation.message || '验证过程中出错')
            } finally {
              setAsyncValidating(prev => ({ ...prev, [field.name]: false }))
            }
          }
          break

        default:
          break
      }
    }

    return fieldErrors
  }, [])

  const validateAll = useCallback(async () => {
    const newErrors = {}
    let hasErrors = false

    for (const field of visibleFields) {
      const fieldErrors = await validateField(field, values[field.name], values)
      if (fieldErrors.length > 0) {
        newErrors[field.name] = fieldErrors
        hasErrors = true
      }
      setTouched(prev => ({ ...prev, [field.name]: true }))
    }

    setErrors(newErrors)
    return !hasErrors
  }, [visibleFields, validateField, values])

  const handleChange = useCallback((name, value) => {
    setValue(name, value)
    setErrors(prev => ({ ...prev, [name]: [] }))
  }, [setValue])

  const handleBlur = useCallback(async (name) => {
    setFieldTouched(name, true)
    const field = schema.fields.find(f => f.name === name)
    if (field) {
      const fieldErrors = await validateField(field, values[name], values)
      setErrors(prev => ({ ...prev, [name]: fieldErrors }))
    }
  }, [schema.fields, validateField, values, setFieldTouched])

  const handleSubmit = useCallback(async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }

    setSubmitting(true)
    const isValid = await validateAll()

    if (isValid && onSubmit) {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }

    setSubmitting(false)
  }, [validateAll, onSubmit, values])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
    setTouched({})
    setAsyncValidating({})
    setSubmitting(false)
  }, [initialValues])

  const getFieldError = useCallback((name) => {
    return errors[name] || []
  }, [errors])

  const isFieldTouched = useCallback((name) => {
    return touched[name] || false
  }, [touched])

  const isAsyncValidating = useCallback((name) => {
    return asyncValidating[name] || false
  }, [asyncValidating])

  const isDirty = useMemo(() => {
    return Object.keys(touched).some(key => touched[key])
  }, [touched])

  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => errors[key].length === 0)
  }, [errors])

  return {
    values,
    errors,
    touched,
    submitting,
    visibleFields,
    getValue,
    setValue,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    validateAll,
    validateField,
    getFieldError,
    isFieldTouched,
    isAsyncValidating,
    isDirty,
    isValid,
  }
}
