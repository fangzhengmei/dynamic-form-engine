import { describe, it, expect } from 'vitest'
import { FIELD_TYPES, VALIDATION_TYPES, CONDITION_OPERATORS } from '../constants'

describe('常量定义', () => {
  describe('FIELD_TYPES', () => {
    it('应该包含所有必要的字段类型', () => {
      expect(FIELD_TYPES.TEXT).toBe('text')
      expect(FIELD_TYPES.EMAIL).toBe('email')
      expect(FIELD_TYPES.PASSWORD).toBe('password')
      expect(FIELD_TYPES.NUMBER).toBe('number')
      expect(FIELD_TYPES.TEXTAREA).toBe('textarea')
      expect(FIELD_TYPES.SELECT).toBe('select')
      expect(FIELD_TYPES.CHECKBOX).toBe('checkbox')
      expect(FIELD_TYPES.RADIO).toBe('radio')
      expect(FIELD_TYPES.DATE).toBe('date')
    })
  })

  describe('VALIDATION_TYPES', () => {
    it('应该包含所有必要的验证类型', () => {
      expect(VALIDATION_TYPES.REQUIRED).toBe('required')
      expect(VALIDATION_TYPES.MIN_LENGTH).toBe('minLength')
      expect(VALIDATION_TYPES.MAX_LENGTH).toBe('maxLength')
      expect(VALIDATION_TYPES.MIN).toBe('min')
      expect(VALIDATION_TYPES.MAX).toBe('max')
      expect(VALIDATION_TYPES.PATTERN).toBe('pattern')
      expect(VALIDATION_TYPES.EMAIL).toBe('email')
      expect(VALIDATION_TYPES.ASYNC).toBe('async')
    })
  })

  describe('CONDITION_OPERATORS', () => {
    it('应该包含所有必要的条件操作符', () => {
      expect(CONDITION_OPERATORS.EQUALS).toBe('equals')
      expect(CONDITION_OPERATORS.NOT_EQUALS).toBe('notEquals')
      expect(CONDITION_OPERATORS.CONTAINS).toBe('contains')
      expect(CONDITION_OPERATORS.NOT_CONTAINS).toBe('notContains')
      expect(CONDITION_OPERATORS.GREATER_THAN).toBe('greaterThan')
      expect(CONDITION_OPERATORS.LESS_THAN).toBe('lessThan')
      expect(CONDITION_OPERATORS.IS_EMPTY).toBe('isEmpty')
      expect(CONDITION_OPERATORS.IS_NOT_EMPTY).toBe('isNotEmpty')
    })
  })
})
