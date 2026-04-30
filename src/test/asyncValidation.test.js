import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFormEngine } from '../hooks/useFormEngine'
import { FIELD_TYPES, VALIDATION_TYPES } from '../constants'

describe('异步验证', () => {
  it('应该执行异步验证器', async () => {
    const mockAsyncValidator = vi.fn().mockResolvedValue(true)
    
    const schema = {
      fields: [
        {
          name: 'asyncField',
          type: FIELD_TYPES.TEXT,
          label: '异步验证字段',
          validations: [
            {
              type: VALIDATION_TYPES.ASYNC,
              validator: mockAsyncValidator,
              message: '异步验证失败',
            },
          ],
        },
      ],
    }
    
    const { result } = renderHook(() => 
      useFormEngine(schema, { asyncField: 'test-value' })
    )
    
    await act(async () => {
      await result.current.validateField(
        schema.fields[0],
        'test-value',
        { asyncField: 'test-value' }
      )
    })
    
    expect(mockAsyncValidator).toHaveBeenCalledWith('test-value', { asyncField: 'test-value' })
  })

  it('当异步验证失败时应该返回错误', async () => {
    const mockAsyncValidator = vi.fn().mockResolvedValue(false)
    
    const schema = {
      fields: [
        {
          name: 'asyncField',
          type: FIELD_TYPES.TEXT,
          label: '异步验证字段',
          validations: [
            {
              type: VALIDATION_TYPES.ASYNC,
              validator: mockAsyncValidator,
              message: '该用户名已被占用',
            },
          ],
        },
      ],
    }
    
    const { result } = renderHook(() => 
      useFormEngine(schema, { asyncField: 'admin' })
    )
    
    let errors
    await act(async () => {
      errors = await result.current.validateField(
        schema.fields[0],
        'admin',
        { asyncField: 'admin' }
      )
    })
    
    expect(errors).toContain('该用户名已被占用')
  })

  it('当异步验证成功时不应该返回错误', async () => {
    const mockAsyncValidator = vi.fn().mockResolvedValue(true)
    
    const schema = {
      fields: [
        {
          name: 'asyncField',
          type: FIELD_TYPES.TEXT,
          label: '异步验证字段',
          validations: [
            {
              type: VALIDATION_TYPES.ASYNC,
              validator: mockAsyncValidator,
              message: '异步验证失败',
            },
          ],
        },
      ],
    }
    
    const { result } = renderHook(() => 
      useFormEngine(schema, { asyncField: 'valid-value' })
    )
    
    let errors
    await act(async () => {
      errors = await result.current.validateField(
        schema.fields[0],
        'valid-value',
        { asyncField: 'valid-value' }
      )
    })
    
    expect(errors).toEqual([])
  })

  it('当验证器抛出异常时应该处理错误', async () => {
    const mockAsyncValidator = vi.fn().mockRejectedValue(new Error('网络错误'))
    
    const schema = {
      fields: [
        {
          name: 'asyncField',
          type: FIELD_TYPES.TEXT,
          label: '异步验证字段',
          validations: [
            {
              type: VALIDATION_TYPES.ASYNC,
              validator: mockAsyncValidator,
              message: '验证过程中出错',
            },
          ],
        },
      ],
    }
    
    const { result } = renderHook(() => 
      useFormEngine(schema, { asyncField: 'test' })
    )
    
    let errors
    await act(async () => {
      errors = await result.current.validateField(
        schema.fields[0],
        'test',
        { asyncField: 'test' }
      )
    })
    
    expect(errors).toContain('验证过程中出错')
  })

  it('当值为空时不应该执行异步验证', async () => {
    const mockAsyncValidator = vi.fn().mockResolvedValue(false)
    
    const schema = {
      fields: [
        {
          name: 'asyncField',
          type: FIELD_TYPES.TEXT,
          label: '异步验证字段',
          validations: [
            {
              type: VALIDATION_TYPES.ASYNC,
              validator: mockAsyncValidator,
              message: '异步验证失败',
            },
          ],
        },
      ],
    }
    
    const { result } = renderHook(() => 
      useFormEngine(schema, { asyncField: '' })
    )
    
    let errors
    await act(async () => {
      errors = await result.current.validateField(
        schema.fields[0],
        '',
        { asyncField: '' }
      )
    })
    
    expect(mockAsyncValidator).not.toHaveBeenCalled()
    expect(errors).toEqual([])
  })
})
