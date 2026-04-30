import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useFormEngine } from '../hooks/useFormEngine'
import { FIELD_TYPES, VALIDATION_TYPES, CONDITION_OPERATORS } from '../constants'

describe('完整表单场景', () => {
  const registrationSchema = {
    fields: [
      {
        name: 'username',
        type: FIELD_TYPES.TEXT,
        label: '用户名',
        required: true,
        validations: [
          { type: VALIDATION_TYPES.REQUIRED, message: '用户名不能为空' },
          { type: VALIDATION_TYPES.MIN_LENGTH, value: 3, message: '用户名至少3个字符' },
        ],
      },
      {
        name: 'email',
        type: FIELD_TYPES.EMAIL,
        label: '邮箱',
        required: true,
        validations: [
          { type: VALIDATION_TYPES.REQUIRED, message: '邮箱不能为空' },
          { type: VALIDATION_TYPES.EMAIL, message: '请输入有效邮箱' },
        ],
      },
      {
        name: 'password',
        type: FIELD_TYPES.PASSWORD,
        label: '密码',
        required: true,
        validations: [
          { type: VALIDATION_TYPES.REQUIRED, message: '密码不能为空' },
          { type: VALIDATION_TYPES.MIN_LENGTH, value: 6, message: '密码至少6个字符' },
        ],
      },
      {
        name: 'accountType',
        type: FIELD_TYPES.SELECT,
        label: '账户类型',
        required: true,
        options: [
          { value: 'free', label: '免费版' },
          { value: 'premium', label: '高级版' },
        ],
        validations: [
          { type: VALIDATION_TYPES.REQUIRED, message: '请选择账户类型' },
        ],
      },
      {
        name: 'company',
        type: FIELD_TYPES.TEXT,
        label: '公司名称',
        condition: {
          field: 'accountType',
          operator: CONDITION_OPERATORS.EQUALS,
          value: 'premium',
        },
        validations: [
          { type: VALIDATION_TYPES.REQUIRED, message: '高级版需要填写公司名称' },
        ],
      },
    ],
  }

  describe('表单提交流程', () => {
    it('应该能够成功提交有效表单', async () => {
      const mockOnSubmit = vi.fn()
      
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {}, mockOnSubmit)
      )
      
      act(() => {
        result.current.setValue('username', 'testuser')
        result.current.setValue('email', 'test@example.com')
        result.current.setValue('password', 'password123')
        result.current.setValue('accountType', 'free')
      })
      
      let isValid
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(true)
      expect(result.current.errors).toEqual({})
    })

    it('应该验证无效表单并显示错误', async () => {
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {})
      )
      
      let isValid
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(false)
      expect(result.current.errors.username).toContain('用户名不能为空')
      expect(result.current.errors.email).toContain('邮箱不能为空')
      expect(result.current.errors.password).toContain('密码不能为空')
      expect(result.current.errors.accountType).toContain('请选择账户类型')
    })

    it('当选择高级版时应该验证公司名称', async () => {
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          accountType: 'premium',
          company: '',
        })
      )
      
      const visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).toContain('company')
      
      let isValid
      await act(async () => {
        isValid = await result.current.validateAll()
      })
      
      expect(isValid).toBe(false)
      expect(result.current.errors.company).toContain('高级版需要填写公司名称')
    })

    it('当选择免费版时不应该显示公司名称字段', () => {
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {
          accountType: 'free',
        })
      )
      
      const visibleFieldNames = result.current.visibleFields.map(f => f.name)
      expect(visibleFieldNames).not.toContain('company')
    })

    it('handleBlur 应该触发单字段验证', async () => {
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {})
      )
      
      act(() => {
        result.current.setValue('username', 'ab')
      })
      
      await act(async () => {
        await result.current.handleBlur('username')
      })
      
      expect(result.current.errors.username).toContain('用户名至少3个字符')
    })

    it('handleChange 应该清除字段错误', async () => {
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {
          username: 'ab',
        })
      )
      
      await act(async () => {
        await result.current.validateAll()
      })
      
      expect(result.current.errors.username).toHaveLength(1)
      
      act(() => {
        result.current.handleChange('username', 'validusername')
      })
      
      expect(result.current.errors.username).toBeUndefined()
    })
  })

  describe('状态管理', () => {
    it('should track touched fields', async () => {
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {})
      )
      
      expect(result.current.isFieldTouched('username')).toBe(false)
      
      act(() => {
        result.current.setFieldTouched('username', true)
      })
      
      expect(result.current.isFieldTouched('username')).toBe(true)
    })

    it('getFieldError 应该返回字段的错误', async () => {
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {
          username: '',
        })
      )
      
      await act(async () => {
        await result.current.validateAll()
      })
      
      expect(result.current.getFieldError('username')).toContain('用户名不能为空')
      expect(result.current.getFieldError('nonexistent')).toEqual([])
    })

    it('isValid 应该反映表单的整体有效性', async () => {
      const { result } = renderHook(() => 
        useFormEngine(registrationSchema, {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          accountType: 'free',
        })
      )
      
      await act(async () => {
        await result.current.validateAll()
      })
      
      expect(result.current.isValid).toBe(true)
    })
  })
})
