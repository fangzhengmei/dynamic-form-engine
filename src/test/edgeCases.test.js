import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useFormEngine } from '../hooks/useFormEngine'
import { FIELD_TYPES, VALIDATION_TYPES, CONDITION_OPERATORS } from '../constants'

describe('边界场景测试', () => {
  describe('空值处理', () => {
    const schema = {
      fields: [
        {
          name: 'requiredField',
          type: FIELD_TYPES.TEXT,
          label: '必填字段',
          validations: [
            { type: VALIDATION_TYPES.REQUIRED, message: '此字段为必填项' },
          ],
        },
        {
          name: 'optionalField',
          type: FIELD_TYPES.TEXT,
          label: '可选字段',
        },
      ],
    }

    it('空字符串应该触发必填验证', async () => {
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

    it('null 应该触发必填验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, { requiredField: null })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[0],
          null,
          { requiredField: null }
        )
      })
      
      expect(errors).toContain('此字段为必填项')
    })

    it('undefined 应该触发必填验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, {})
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[0],
          undefined,
          {}
        )
      })
      
      expect(errors).toContain('此字段为必填项')
    })

    it('空数组应该触发必填验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, { requiredField: [] })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[0],
          [],
          { requiredField: [] }
        )
      })
      
      expect(errors).toContain('此字段为必填项')
    })

    it('可选字段为空时不应该验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, { optionalField: '' })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[1],
          '',
          { optionalField: '' }
        )
      })
      
      expect(errors).toEqual([])
    })
  })

  describe('非法输入验证', () => {
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
        {
          name: 'patternField',
          type: FIELD_TYPES.TEXT,
          label: '正则字段',
          validations: [
            { type: VALIDATION_TYPES.PATTERN, value: '^[a-z]+$', message: '只能包含小写字母' },
          ],
        },
        {
          name: 'numberField',
          type: FIELD_TYPES.NUMBER,
          label: '数字字段',
          validations: [
            { type: VALIDATION_TYPES.MIN, value: 0, message: '不能为负数' },
            { type: VALIDATION_TYPES.MAX, value: 100, message: '不能超过100' },
          ],
        },
      ],
    }

    it('无效邮箱格式应该验证失败', async () => {
      const invalidEmails = ['not-an-email', '@.com', 'test@', 'test@.com', 'test@example']
      
      for (const email of invalidEmails) {
        const { result } = renderHook(() => 
          useFormEngine(schema, { emailField: email })
        )
        
        let errors
        await act(async () => {
          errors = await result.current.validateField(
            schema.fields[0],
            email,
            { emailField: email }
          )
        })
        
        expect(errors).toContain('请输入有效邮箱')
      }
    })

    it('有效邮箱格式应该验证成功', async () => {
      const validEmails = ['test@example.com', 'user.name+tag@domain.co.uk', 'a@b.com']
      
      for (const email of validEmails) {
        const { result } = renderHook(() => 
          useFormEngine(schema, { emailField: email })
        )
        
        let errors
        await act(async () => {
          errors = await result.current.validateField(
            schema.fields[0],
            email,
            { emailField: email }
          )
        })
        
        expect(errors).toEqual([])
      }
    })

    it('不符合正则表达式应该验证失败', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, { patternField: 'ABC123' })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[1],
          'ABC123',
          { patternField: 'ABC123' }
        )
      })
      
      expect(errors).toContain('只能包含小写字母')
    })

    it('符合正则表达式应该验证成功', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, { patternField: 'abcdef' })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[1],
          'abcdef',
          { patternField: 'abcdef' }
        )
      })
      
      expect(errors).toEqual([])
    })

    it('超出数值范围应该验证失败', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, { numberField: -5 })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[2],
          -5,
          { numberField: -5 }
        )
      })
      
      expect(errors).toContain('不能为负数')
      
      const { result: result2 } = renderHook(() => 
        useFormEngine(schema, { numberField: 150 })
      )
      
      await act(async () => {
        errors = await result2.current.validateField(
          schema.fields[2],
          150,
          { numberField: 150 }
        )
      })
      
      expect(errors).toContain('不能超过100')
    })

    it('数值范围内应该验证成功', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, { numberField: 50 })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[2],
          50,
          { numberField: 50 }
        )
      })
      
      expect(errors).toEqual([])
    })
  })

  describe('条件切换后状态一致性', () => {
    const conditionalSchema = {
      fields: [
        {
          name: 'showDetails',
          type: FIELD_TYPES.CHECKBOX,
          label: '显示详情',
        },
        {
          name: 'detailField',
          type: FIELD_TYPES.TEXT,
          label: '详情字段',
          condition: {
            field: 'showDetails',
            operator: CONDITION_OPERATORS.EQUALS,
            value: true,
          },
          validations: [
            { type: VALIDATION_TYPES.REQUIRED, message: '详情字段为必填项' },
          ],
        },
      ],
    }

    it('条件字段隐藏时不应该验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(conditionalSchema, {
          showDetails: false,
          detailField: '',
        })
      )
      
      const visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).not.toContain('detailField')
      
      let isValid
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(true)
      expect(result.current.errors.detailField).toBeUndefined()
    })

    it('条件字段显示后应该验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(conditionalSchema, {
          showDetails: false,
          detailField: '',
        })
      )
      
      let visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).not.toContain('detailField')
      
      act(() => {
        result.current.setValue('showDetails', true)
      })
      
      visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).toContain('detailField')
      
      let isValid
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(false)
      expect(result.current.errors.detailField).toContain('详情字段为必填项')
    })

    it('条件字段隐藏后应该忽略其值的验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(conditionalSchema, {
          showDetails: true,
          detailField: '有值',
        })
      )
      
      let visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).toContain('detailField')
      
      let isValid
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(true)
      
      act(() => {
        result.current.setValue('showDetails', false)
      })
      
      visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).not.toContain('detailField')
      
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(true)
    })

    it('条件字段的值在隐藏时应该保留', () => {
      const { result } = renderHook(() => 
        useFormEngine(conditionalSchema, {
          showDetails: true,
          detailField: '重要信息',
        })
      )
      
      expect(result.current.values.detailField).toBe('重要信息')
      
      act(() => {
        result.current.setValue('showDetails', false)
      })
      
      expect(result.current.values.detailField).toBe('重要信息')
    })

    it('嵌套条件应该正确处理', () => {
      const nestedSchema = {
        fields: [
          {
            name: 'level1',
            type: FIELD_TYPES.SELECT,
            label: '一级选择',
            options: [
              { value: 'a', label: '选项A' },
              { value: 'b', label: '选项B' },
            ],
          },
          {
            name: 'level2',
            type: FIELD_TYPES.SELECT,
            label: '二级选择',
            condition: {
              field: 'level1',
              operator: CONDITION_OPERATORS.EQUALS,
              value: 'a',
            },
            options: [
              { value: 'x', label: '选项X' },
              { value: 'y', label: '选项Y' },
            ],
          },
          {
            name: 'level3',
            type: FIELD_TYPES.TEXT,
            label: '三级字段',
            condition: {
              field: 'level2',
              operator: CONDITION_OPERATORS.EQUALS,
              value: 'x',
            },
          },
        ],
      }
      
      const { result } = renderHook(() => 
        useFormEngine(nestedSchema, {
          level1: 'a',
          level2: 'x',
        })
      )
      
      let visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).toContain('level1')
      expect(visibleFieldNames).toContain('level2')
      expect(visibleFieldNames).toContain('level3')
      
      act(() => {
        result.current.setValue('level2', 'y')
      })
      
      visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).toContain('level1')
      expect(visibleFieldNames).toContain('level2')
      expect(visibleFieldNames).not.toContain('level3')
      
      act(() => {
        result.current.setValue('level1', 'b')
      })
      
      visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).toContain('level1')
      expect(visibleFieldNames).not.toContain('level2')
      expect(visibleFieldNames).not.toContain('level3')
    })
  })

  describe('异步验证边界场景', () => {
    it('异步验证器应该接收正确的参数', async () => {
      const mockAsyncValidator = vi.fn().mockResolvedValue(true)
      
      const schema = {
        fields: [
          {
            name: 'username',
            type: FIELD_TYPES.TEXT,
            label: '用户名',
            validations: [
              {
                type: VALIDATION_TYPES.ASYNC,
                validator: mockAsyncValidator,
                message: '用户名已被占用',
              },
            ],
          },
        ],
      }
      
      const { result } = renderHook(() => 
        useFormEngine(schema, { username: 'testuser', otherField: 'value' })
      )
      
      await act(async () => {
        await result.current.validateField(
          schema.fields[0],
          'testuser',
          { username: 'testuser', otherField: 'value' }
        )
      })
      
      expect(mockAsyncValidator).toHaveBeenCalledWith(
        'testuser',
        { username: 'testuser', otherField: 'value' }
      )
    })

    it('异步验证器的返回值应该正确判断', async () => {
      const returnValues = [
        { returnValue: true, expectError: false },
        { returnValue: false, expectError: true },
        { returnValue: 'truthy', expectError: true },
        { returnValue: 0, expectError: true },
        { returnValue: null, expectError: true },
        { returnValue: undefined, expectError: true },
        { returnValue: '', expectError: true },
      ]
      
      for (const { returnValue, expectError } of returnValues) {
        const mockAsyncValidator = vi.fn().mockResolvedValue(returnValue)
        
        const schema = {
          fields: [
            {
              name: 'testField',
              type: FIELD_TYPES.TEXT,
              label: '测试字段',
              validations: [
                {
                  type: VALIDATION_TYPES.ASYNC,
                  validator: mockAsyncValidator,
                  message: '验证失败',
                },
              ],
            },
          ],
        }
        
        const { result } = renderHook(() => 
          useFormEngine(schema, { testField: 'value' })
        )
        
        let errors
        await act(async () => {
          errors = await result.current.validateField(
            schema.fields[0],
            'value',
            { testField: 'value' }
          )
        })
        
        if (expectError) {
          expect(errors).toContain('验证失败')
        } else {
          expect(errors).toEqual([])
        }
      }
    })

    it('异步验证应该可以与同步验证组合', async () => {
      const mockAsyncValidator = vi.fn().mockResolvedValue(false)
      
      const schema = {
        fields: [
          {
            name: 'username',
            type: FIELD_TYPES.TEXT,
            label: '用户名',
            validations: [
              { type: VALIDATION_TYPES.REQUIRED, message: '用户名不能为空' },
              { type: VALIDATION_TYPES.MIN_LENGTH, value: 3, message: '至少3个字符' },
              {
                type: VALIDATION_TYPES.ASYNC,
                validator: mockAsyncValidator,
                message: '用户名已被占用',
              },
            ],
          },
        ],
      }
      
      const { result: result1 } = renderHook(() => 
        useFormEngine(schema, { username: '' })
      )
      
      let errors
      await act(async () => {
        errors = await result1.current.validateField(
          schema.fields[0],
          '',
          { username: '' }
        )
      })
      
      expect(errors).toContain('用户名不能为空')
      expect(errors).not.toContain('用户名已被占用')
      
      const { result: result2 } = renderHook(() => 
        useFormEngine(schema, { username: 'ab' })
      )
      
      await act(async () => {
        errors = await result2.current.validateField(
          schema.fields[0],
          'ab',
          { username: 'ab' }
        )
      })
      
      expect(errors).toContain('至少3个字符')
      expect(errors).toContain('用户名已被占用')
      
      mockAsyncValidator.mockResolvedValue(true)
      const { result: result3 } = renderHook(() => 
        useFormEngine(schema, { username: 'valid' })
      )
      
      await act(async () => {
        errors = await result3.current.validateField(
          schema.fields[0],
          'valid',
          { username: 'valid' }
        )
      })
      
      expect(errors).toEqual([])
    })
  })

  describe('字符串长度验证边界', () => {
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
        {
          name: 'maxLengthField',
          type: FIELD_TYPES.TEXT,
          label: '最大长度字段',
          validations: [
            { type: VALIDATION_TYPES.MAX_LENGTH, value: 10, message: '最多10个字符' },
          ],
        },
      ],
    }

    it('最小长度边界值应该正确验证', async () => {
      const testCases = [
        { value: '', expectedError: true },
        { value: 'a', expectedError: true },
        { value: 'ab', expectedError: true },
        { value: 'abc', expectedError: true },
        { value: 'abcd', expectedError: true },
        { value: 'abcde', expectedError: false },
        { value: 'abcdef', expectedError: false },
      ]
      
      for (const { value, expectedError } of testCases) {
        const { result } = renderHook(() => 
          useFormEngine(schema, { minLengthField: value })
        )
        
        let errors
        await act(async () => {
          errors = await result.current.validateField(
            schema.fields[0],
            value,
            { minLengthField: value }
          )
        })
        
        if (expectedError) {
          expect(errors).toContain('至少5个字符')
        } else {
          expect(errors).toEqual([])
        }
      }
    })

    it('最大长度边界值应该正确验证', async () => {
      const testCases = [
        { value: '', expectedError: false },
        { value: 'a', expectedError: false },
        { value: 'abcdefghij', expectedError: false },
        { value: 'abcdefghijk', expectedError: true },
        { value: 'abcdefghijklmnop', expectedError: true },
      ]
      
      for (const { value, expectedError } of testCases) {
        const { result } = renderHook(() => 
          useFormEngine(schema, { maxLengthField: value })
        )
        
        let errors
        await act(async () => {
          errors = await result.current.validateField(
            schema.fields[1],
            value,
            { maxLengthField: value }
          )
        })
        
        if (expectedError) {
          expect(errors).toContain('最多10个字符')
        } else {
          expect(errors).toEqual([])
        }
      }
    })

    it('非字符串值不应该触发长度验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(schema, { minLengthField: 123 })
      )
      
      let errors
      await act(async () => {
        errors = await result.current.validateField(
          schema.fields[0],
          123,
          { minLengthField: 123 }
        )
      })
      
      expect(errors).toEqual([])
    })
  })

  describe('条件操作符边界测试', () => {
    const { result } = renderHook(() => 
      useFormEngine({ fields: [] }, {})
    )

    it('EQUALS 操作符应该正确处理不同类型', () => {
      const tests = [
        { fieldValue: 'a', conditionValue: 'a', expected: true },
        { fieldValue: 'a', conditionValue: 'b', expected: false },
        { fieldValue: 1, conditionValue: 1, expected: true },
        { fieldValue: 1, conditionValue: '1', expected: false },
        { fieldValue: true, conditionValue: true, expected: true },
        { fieldValue: false, conditionValue: true, expected: false },
        { fieldValue: null, conditionValue: null, expected: true },
        { fieldValue: undefined, conditionValue: undefined, expected: true },
        { fieldValue: '', conditionValue: '', expected: true },
        { fieldValue: 0, conditionValue: 0, expected: true },
      ]
      
      for (const { fieldValue, conditionValue, expected } of tests) {
        const result2 = result.current.evaluateCondition(
          { field: 'test', operator: CONDITION_OPERATORS.EQUALS, value: conditionValue },
          { test: fieldValue }
        )
        expect(result2).toBe(expected)
      }
    })

    it('NOT_EQUALS 操作符应该正确处理不同类型', () => {
      const tests = [
        { fieldValue: 'a', conditionValue: 'a', expected: false },
        { fieldValue: 'a', conditionValue: 'b', expected: true },
        { fieldValue: 1, conditionValue: '1', expected: true },
      ]
      
      for (const { fieldValue, conditionValue, expected } of tests) {
        const result2 = result.current.evaluateCondition(
          { field: 'test', operator: CONDITION_OPERATORS.NOT_EQUALS, value: conditionValue },
          { test: fieldValue }
        )
        expect(result2).toBe(expected)
      }
    })

    it('GREATER_THAN 和 LESS_THAN 操作符应该正确比较数值', () => {
      const greaterThanTests = [
        { fieldValue: 10, conditionValue: 5, expected: true },
        { fieldValue: 5, conditionValue: 10, expected: false },
        { fieldValue: 5, conditionValue: 5, expected: false },
        { fieldValue: '10', conditionValue: 5, expected: true },
        { fieldValue: 10, conditionValue: '5', expected: true },
      ]
      
      for (const { fieldValue, conditionValue, expected } of greaterThanTests) {
        const result2 = result.current.evaluateCondition(
          { field: 'test', operator: CONDITION_OPERATORS.GREATER_THAN, value: conditionValue },
          { test: fieldValue }
        )
        expect(result2).toBe(expected)
      }
      
      const lessThanTests = [
        { fieldValue: 5, conditionValue: 10, expected: true },
        { fieldValue: 10, conditionValue: 5, expected: false },
        { fieldValue: 5, conditionValue: 5, expected: false },
      ]
      
      for (const { fieldValue, conditionValue, expected } of lessThanTests) {
        const result2 = result.current.evaluateCondition(
          { field: 'test', operator: CONDITION_OPERATORS.LESS_THAN, value: conditionValue },
          { test: fieldValue }
        )
        expect(result2).toBe(expected)
      }
    })

    it('IS_EMPTY 和 IS_NOT_EMPTY 操作符应该正确判断空值', () => {
      const isEmptyTests = [
        { fieldValue: '', expected: true },
        { fieldValue: null, expected: true },
        { fieldValue: undefined, expected: true },
        { fieldValue: 'a', expected: false },
        { fieldValue: 0, expected: false },
        { fieldValue: false, expected: false },
      ]
      
      for (const { fieldValue, expected } of isEmptyTests) {
        const result2 = result.current.evaluateCondition(
          { field: 'test', operator: CONDITION_OPERATORS.IS_EMPTY, value: null },
          { test: fieldValue }
        )
        expect(result2).toBe(expected)
      }
      
      for (const { fieldValue, expected } of isEmptyTests) {
        const result2 = result.current.evaluateCondition(
          { field: 'test', operator: CONDITION_OPERATORS.IS_NOT_EMPTY, value: null },
          { test: fieldValue }
        )
        expect(result2).toBe(!expected)
      }
    })

    it('未知操作符应该返回 true', () => {
      const result2 = result.current.evaluateCondition(
        { field: 'test', operator: 'unknown-operator', value: 'value' },
        { test: 'test' }
      )
      expect(result2).toBe(true)
    })

    it('没有条件应该返回 true', () => {
      const result2 = result.current.evaluateCondition(
        null,
        { test: 'value' }
      )
      expect(result2).toBe(true)
    })
  })
})
