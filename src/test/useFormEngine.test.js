import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useFormEngine } from '../hooks/useFormEngine'
import { FIELD_TYPES, VALIDATION_TYPES, CONDITION_OPERATORS } from '../constants'

describe('useFormEngine', () => {
  const basicSchema = {
    fields: [
      {
        name: 'name',
        type: FIELD_TYPES.TEXT,
        label: '姓名',
        required: true,
        validations: [
          { type: VALIDATION_TYPES.REQUIRED, message: '姓名不能为空' },
        ],
      },
      {
        name: 'email',
        type: FIELD_TYPES.EMAIL,
        label: '邮箱',
        validations: [
          { type: VALIDATION_TYPES.EMAIL, message: '请输入有效邮箱' },
        ],
      },
    ],
  }

  describe('初始化', () => {
    it('应该使用初始值初始化表单', () => {
      const initialValues = { name: '张三', email: 'test@example.com' }
      const { result } = renderHook(() => 
        useFormEngine(basicSchema, initialValues)
      )
      
      expect(result.current.values).toEqual(initialValues)
    })

    it('应该有默认的空错误对象', () => {
      const { result } = renderHook(() => 
        useFormEngine(basicSchema, {})
      )
      
      expect(result.current.errors).toEqual({})
    })

    it('应该有默认的空 touched 对象', () => {
      const { result } = renderHook(() => 
        useFormEngine(basicSchema, {})
      )
      
      expect(result.current.touched).toEqual({})
    })
  })

  describe('值管理', () => {
    it('应该能够设置字段值', () => {
      const { result } = renderHook(() => 
        useFormEngine(basicSchema, {})
      )
      
      act(() => {
        result.current.setValue('name', '李四')
      })
      
      expect(result.current.values.name).toBe('李四')
    })

    it('应该能够获取字段值', () => {
      const initialValues = { name: '王五' }
      const { result } = renderHook(() => 
        useFormEngine(basicSchema, initialValues)
      )
      
      expect(result.current.getValue('name')).toBe('王五')
    })

    it('handleChange 应该更新值并清除错误', () => {
      const { result } = renderHook(() => 
        useFormEngine(basicSchema, {})
      )
      
      act(() => {
        result.current.handleChange('name', '测试')
      })
      
      expect(result.current.values.name).toBe('测试')
    })
  })

  describe('同步验证', () => {
    it('应该验证必填字段', async () => {
      const schema = {
        fields: [
          {
            name: 'requiredField',
            type: FIELD_TYPES.TEXT,
            label: '必填字段',
            required: true,
            validations: [
              { type: VALIDATION_TYPES.REQUIRED, message: '此字段为必填项' },
            ],
          },
        ],
      }
      
      const { result } = renderHook(() => 
        useFormEngine(schema, { requiredField: '' })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[0],
          '',
          { requiredField: '' }
        )
      })
      
      expect(errors).toContain('此字段为必填项')
    })

    it('应该验证最小长度', async () => {
      const schema = {
        fields: [
          {
            name: 'minLengthField',
            type: FIELD_TYPES.TEXT,
            label: '最小长度字段',
            validations: [
              { type: VALIDATION_TYPES.MIN_LENGTH, value: 5, message: '至少5个字符' },
            ],
          },
        ],
      }
      
      const { result } = renderHook(() => 
        useFormEngine(schema, { minLengthField: 'abc' })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[0],
          'abc',
          { minLengthField: 'abc' }
        )
      })
      
      expect(errors).toContain('至少5个字符')
    })

    it('应该验证邮箱格式', async () => {
      const schema = {
        fields: [
          {
            name: 'emailField',
            type: FIELD_TYPES.EMAIL,
            label: '邮箱',
            validations: [
              { type: VALIDATION_TYPES.EMAIL, message: '请输入有效邮箱' },
            ],
          },
        ],
      }
      
      const { result } = renderHook(() => 
        useFormEngine(schema, { emailField: 'invalid-email' })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[0],
          'invalid-email',
          { emailField: 'invalid-email' }
        )
      })
      
      expect(errors).toContain('请输入有效邮箱')
    })

    it('应该验证数值范围', async () => {
      const schema = {
        fields: [
          {
            name: 'age',
            type: FIELD_TYPES.NUMBER,
            label: '年龄',
            validations: [
              { type: VALIDATION_TYPES.MIN, value: 18, message: '必须大于等于18' },
              { type: VALIDATION_TYPES.MAX, value: 100, message: '必须小于等于100' },
            ],
          },
        ],
      }
      
      const { result } = renderHook(() => 
        useFormEngine(schema, { age: 10 })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[0],
          10,
          { age: 10 }
        )
      })
      
      expect(errors).toContain('必须大于等于18')
    })
  })

  describe('条件字段', () => {
    const conditionalSchema = {
      fields: [
        {
          name: 'userType',
          type: FIELD_TYPES.SELECT,
          label: '用户类型',
          options: [
            { value: 'personal', label: '个人' },
            { value: 'company', label: '企业' },
          ],
        },
        {
          name: 'companyName',
          type: FIELD_TYPES.TEXT,
          label: '公司名称',
          condition: {
            field: 'userType',
            operator: CONDITION_OPERATORS.EQUALS,
            value: 'company',
          },
        },
        {
          name: 'age',
          type: FIELD_TYPES.NUMBER,
          label: '年龄',
          condition: {
            field: 'userType',
            operator: CONDITION_OPERATORS.EQUALS,
            value: 'personal',
          },
        },
      ],
    }

    it('当条件满足时应该显示字段', () => {
      const { result } = renderHook(() => 
        useFormEngine(conditionalSchema, { userType: 'company' })
      )
      
      const visibleFieldNames = result.current.visibleFields.map(f => f.name)
      
      expect(visibleFieldNames).toContain('userType')
      expect(visibleFieldNames).toContain('companyName')
      expect(visibleFieldNames).not.toContain('age')
    })

    it('当条件不满足时应该隐藏字段', () => {
      const { result } = renderHook(() => 
        useFormEngine(conditionalSchema, { userType: 'personal' })
      )
      
      const visibleFieldNames = result.current.visibleFields.map(f => f.name)
      
      expect(visibleFieldNames).toContain('userType')
      expect(visibleFieldNames).toContain('age')
      expect(visibleFieldNames).not.toContain('companyName')
    })

    it('evaluateCondition 应该正确评估条件', () => {
      const { result } = renderHook(() => 
        useFormEngine(conditionalSchema, {})
      )
      
      expect(result.current.evaluateCondition(
        { field: 'test', operator: CONDITION_OPERATORS.EQUALS, value: 'value' },
        { test: 'value' }
      )).toBe(true)
      
      expect(result.current.evaluateCondition(
        { field: 'test', operator: CONDITION_OPERATORS.EQUALS, value: 'value' },
        { test: 'different' }
      )).toBe(false)
      
      expect(result.current.evaluateCondition(
        { field: 'test', operator: CONDITION_OPERATORS.NOT_EQUALS, value: 'value' },
        { test: 'different' }
      )).toBe(true)
      
      expect(result.current.evaluateCondition(
        { field: 'test', operator: CONDITION_OPERATORS.CONTAINS, value: 'hello' },
        { test: 'hello world' }
      )).toBe(true)
      
      expect(result.current.evaluateCondition(
        { field: 'test', operator: CONDITION_OPERATORS.GREATER_THAN, value: 10 },
        { test: 15 }
      )).toBe(true)
      
      expect(result.current.evaluateCondition(
        { field: 'test', operator: CONDITION_OPERATORS.LESS_THAN, value: 10 },
        { test: 5 }
      )).toBe(true)
      
      expect(result.current.evaluateCondition(
        { field: 'test', operator: CONDITION_OPERATORS.IS_EMPTY, value: null },
        { test: '' }
      )).toBe(true)
      
      expect(result.current.evaluateCondition(
        { field: 'test', operator: CONDITION_OPERATORS.IS_NOT_EMPTY, value: null },
        { test: 'value' }
      )).toBe(true)
    })
  })

  describe('表单状态', () => {
    it('should track isDirty correctly', () => {
      const { result } = renderHook(() => 
        useFormEngine(basicSchema, {})
      )
      
      expect(result.current.isDirty).toBe(false)
      
      act(() => {
        result.current.setValue('name', 'test')
      })
      
      expect(result.current.isDirty).toBe(true)
    })

    it('reset 应该重置表单状态', () => {
      const initialValues = { name: '初始值' }
      const { result } = renderHook(() => 
        useFormEngine(basicSchema, initialValues)
      )
      
      act(() => {
        result.current.setValue('name', '新值')
      })
      
      expect(result.current.values.name).toBe('新值')
      
      act(() => {
        result.current.reset()
      })
      
      expect(result.current.values).toEqual(initialValues)
      expect(result.current.errors).toEqual({})
      expect(result.current.touched).toEqual({})
    })
  })

  describe('验证所有字段', () => {
    it('validateAll 应该验证所有可见字段', async () => {
      const schema = {
        fields: [
          {
            name: 'field1',
            type: FIELD_TYPES.TEXT,
            label: '字段1',
            validations: [
              { type: VALIDATION_TYPES.REQUIRED, message: '字段1不能为空' },
            ],
          },
          {
            name: 'field2',
            type: FIELD_TYPES.TEXT,
            label: '字段2',
            validations: [
              { type: VALIDATION_TYPES.REQUIRED, message: '字段2不能为空' },
            ],
          },
        ],
      }
      
      const { result } = renderHook(() => 
        useFormEngine(schema, { field1: '', field2: '' })
      )
      
      let isValid
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(false)
      expect(result.current.errors.field1).toContain('字段1不能为空')
      expect(result.current.errors.field2).toContain('字段2不能为空')
    })

    it('当所有字段有效时 validateAll 应该返回 true', async () => {
      const schema = {
        fields: [
          {
            name: 'field1',
            type: FIELD_TYPES.TEXT,
            label: '字段1',
            validations: [
              { type: VALIDATION_TYPES.REQUIRED, message: '字段1不能为空' },
            ],
          },
        ],
      }
      
      const { result } = renderHook(() => 
        useFormEngine(schema, { field1: '有值' })
      )
      
      let isValid
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(true)
    })
  })
})
