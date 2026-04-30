import React, { useState } from 'react'
import { FormEngine, useFormEngine } from './components'
import { FIELD_TYPES, VALIDATION_TYPES, CONDITION_OPERATORS } from './constants'

const mockCheckUsername = async (username) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const takenUsernames = ['admin', 'root', 'test', 'user']
      resolve(!takenUsernames.includes(username.toLowerCase()))
    }, 1000)
  })
}

const formSchema = {
  fields: [
    {
      name: 'username',
      type: FIELD_TYPES.TEXT,
      label: '用户名',
      placeholder: '请输入用户名',
      required: true,
      validations: [
        {
          type: VALIDATION_TYPES.REQUIRED,
          message: '用户名不能为空',
        },
        {
          type: VALIDATION_TYPES.MIN_LENGTH,
          value: 3,
          message: '用户名至少需要3个字符',
        },
        {
          type: VALIDATION_TYPES.ASYNC,
          validator: mockCheckUsername,
          message: '该用户名已被占用',
        },
      ],
    },
    {
      name: 'email',
      type: FIELD_TYPES.EMAIL,
      label: '邮箱',
      placeholder: '请输入邮箱地址',
      required: true,
      validations: [
        {
          type: VALIDATION_TYPES.REQUIRED,
          message: '邮箱不能为空',
        },
        {
          type: VALIDATION_TYPES.EMAIL,
          message: '请输入有效的邮箱地址',
        },
      ],
    },
    {
      name: 'password',
      type: FIELD_TYPES.PASSWORD,
      label: '密码',
      placeholder: '请输入密码',
      required: true,
      validations: [
        {
          type: VALIDATION_TYPES.REQUIRED,
          message: '密码不能为空',
        },
        {
          type: VALIDATION_TYPES.MIN_LENGTH,
          value: 6,
          message: '密码至少需要6个字符',
        },
      ],
    },
    {
      name: 'userType',
      type: FIELD_TYPES.SELECT,
      label: '用户类型',
      placeholder: '请选择用户类型',
      required: true,
      options: [
        { value: 'personal', label: '个人用户' },
        { value: 'company', label: '企业用户' },
      ],
      validations: [
        {
          type: VALIDATION_TYPES.REQUIRED,
          message: '请选择用户类型',
        },
      ],
    },
    {
      name: 'companyName',
      type: FIELD_TYPES.TEXT,
      label: '公司名称',
      placeholder: '请输入公司名称',
      condition: {
        field: 'userType',
        operator: CONDITION_OPERATORS.EQUALS,
        value: 'company',
      },
      validations: [
        {
          type: VALIDATION_TYPES.REQUIRED,
          message: '公司名称不能为空',
        },
      ],
    },
    {
      name: 'age',
      type: FIELD_TYPES.NUMBER,
      label: '年龄',
      placeholder: '请输入年龄',
      condition: {
        field: 'userType',
        operator: CONDITION_OPERATORS.EQUALS,
        value: 'personal',
      },
      validations: [
        {
          type: VALIDATION_TYPES.MIN,
          value: 18,
          message: '年龄必须大于等于18岁',
        },
        {
          type: VALIDATION_TYPES.MAX,
          value: 120,
          message: '年龄必须小于等于120岁',
        },
      ],
    },
    {
      name: 'subscribeNewsletter',
      type: FIELD_TYPES.CHECKBOX,
      label: '订阅新闻通讯',
    },
    {
      name: 'frequency',
      type: FIELD_TYPES.RADIO,
      label: '订阅频率',
      options: [
        { value: 'daily', label: '每日' },
        { value: 'weekly', label: '每周' },
        { value: 'monthly', label: '每月' },
      ],
      condition: {
        field: 'subscribeNewsletter',
        operator: CONDITION_OPERATORS.EQUALS,
        value: true,
      },
    },
    {
      name: 'bio',
      type: FIELD_TYPES.TEXTAREA,
      label: '个人简介',
      placeholder: '请输入个人简介',
      rows: 4,
      validations: [
        {
          type: VALIDATION_TYPES.MAX_LENGTH,
          value: 500,
          message: '个人简介最多500个字符',
        },
      ],
    },
  ],
}

function FormWithValues() {
  const [submittedData, setSubmittedData] = useState(null)
  
  const formState = useFormEngine(formSchema, {}, (values) => {
    setSubmittedData(values)
    console.log('Form submitted:', values)
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    formState.handleSubmit(e)
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="form-container">
        {formState.visibleFields.map((field) => (
          <div key={field.name} data-testid={`field-wrapper-${field.name}`}>
            {field.type === FIELD_TYPES.TEXT && (
              <div>
                <label>{field.label}{field.required && <span className="required">*</span>}</label>
                <input
                  type="text"
                  value={formState.values[field.name] || ''}
                  onChange={(e) => formState.handleChange(field.name, e.target.value)}
                  onBlur={() => formState.handleBlur(field.name)}
                  placeholder={field.placeholder}
                  data-testid={`input-${field.name}`}
                />
                {formState.isAsyncValidating(field.name) && (
                  <div className="async-validation">正在验证...</div>
                )}
                {formState.getFieldError(field.name).length > 0 && (
                  <div className="error-message" data-testid={`error-${field.name}`}>
                    {formState.getFieldError(field.name)[0]}
                  </div>
                )}
              </div>
            )}
            {field.type === FIELD_TYPES.EMAIL && (
              <div>
                <label>{field.label}{field.required && <span className="required">*</span>}</label>
                <input
                  type="email"
                  value={formState.values[field.name] || ''}
                  onChange={(e) => formState.handleChange(field.name, e.target.value)}
                  onBlur={() => formState.handleBlur(field.name)}
                  placeholder={field.placeholder}
                  data-testid={`input-${field.name}`}
                />
                {formState.getFieldError(field.name).length > 0 && (
                  <div className="error-message" data-testid={`error-${field.name}`}>
                    {formState.getFieldError(field.name)[0]}
                  </div>
                )}
              </div>
            )}
            {field.type === FIELD_TYPES.PASSWORD && (
              <div>
                <label>{field.label}{field.required && <span className="required">*</span>}</label>
                <input
                  type="password"
                  value={formState.values[field.name] || ''}
                  onChange={(e) => formState.handleChange(field.name, e.target.value)}
                  onBlur={() => formState.handleBlur(field.name)}
                  placeholder={field.placeholder}
                  data-testid={`input-${field.name}`}
                />
                {formState.getFieldError(field.name).length > 0 && (
                  <div className="error-message" data-testid={`error-${field.name}`}>
                    {formState.getFieldError(field.name)[0]}
                  </div>
                )}
              </div>
            )}
            {field.type === FIELD_TYPES.NUMBER && (
              <div>
                <label>{field.label}{field.required && <span className="required">*</span>}</label>
                <input
                  type="number"
                  value={formState.values[field.name] || ''}
                  onChange={(e) => formState.handleChange(field.name, e.target.value)}
                  onBlur={() => formState.handleBlur(field.name)}
                  placeholder={field.placeholder}
                  data-testid={`input-${field.name}`}
                />
                {formState.getFieldError(field.name).length > 0 && (
                  <div className="error-message" data-testid={`error-${field.name}`}>
                    {formState.getFieldError(field.name)[0]}
                  </div>
                )}
              </div>
            )}
            {field.type === FIELD_TYPES.SELECT && (
              <div>
                <label>{field.label}{field.required && <span className="required">*</span>}</label>
                <select
                  value={formState.values[field.name] || ''}
                  onChange={(e) => formState.handleChange(field.name, e.target.value)}
                  onBlur={() => formState.handleBlur(field.name)}
                  data-testid={`select-${field.name}`}
                >
                  <option value="">{field.placeholder}</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                {formState.getFieldError(field.name).length > 0 && (
                  <div className="error-message" data-testid={`error-${field.name}`}>
                    {formState.getFieldError(field.name)[0]}
                  </div>
                )}
              </div>
            )}
            {field.type === FIELD_TYPES.CHECKBOX && (
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={!!formState.values[field.name]}
                    onChange={(e) => formState.handleChange(field.name, e.target.checked)}
                    onBlur={() => formState.handleBlur(field.name)}
                    data-testid={`checkbox-${field.name}`}
                  />
                  <span style={{ marginLeft: '8px' }}>{field.label}</span>
                </label>
              </div>
            )}
            {field.type === FIELD_TYPES.RADIO && (
              <div>
                <label>{field.label}</label>
                <div>
                  {field.options.map((opt) => (
                    <label key={opt.value} style={{ marginRight: '16px' }}>
                      <input
                        type="radio"
                        name={field.name}
                        value={opt.value}
                        checked={formState.values[field.name] === opt.value}
                        onChange={(e) => formState.handleChange(field.name, e.target.value)}
                        onBlur={() => formState.handleBlur(field.name)}
                        data-testid={`radio-${field.name}-${opt.value}`}
                      />
                      <span style={{ marginLeft: '4px' }}>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            {field.type === FIELD_TYPES.TEXTAREA && (
              <div>
                <label>{field.label}{field.required && <span className="required">*</span>}</label>
                <textarea
                  value={formState.values[field.name] || ''}
                  onChange={(e) => formState.handleChange(field.name, e.target.value)}
                  onBlur={() => formState.handleBlur(field.name)}
                  placeholder={field.placeholder}
                  rows={field.rows || 4}
                  data-testid={`textarea-${field.name}`}
                />
                {formState.getFieldError(field.name).length > 0 && (
                  <div className="error-message" data-testid={`error-${field.name}`}>
                    {formState.getFieldError(field.name)[0]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        
        <button
          type="submit"
          className="submit-btn"
          disabled={formState.submitting}
          data-testid="submit-button"
        >
          {formState.submitting ? '提交中...' : '提交'}
        </button>
      </form>
      
      {submittedData && (
        <div className="form-values">
          <h3>提交的数据:</h3>
          <pre>{JSON.stringify(submittedData, null, 2)}</pre>
        </div>
      )}
      
      <div className="form-values" style={{ marginTop: '16px' }}>
        <h3>当前表单值:</h3>
        <pre>{JSON.stringify(formState.values, null, 2)}</pre>
      </div>
    </div>
  )
}

function App() {
  return (
    <div>
      <h1>动态表单引擎演示</h1>
      <p style={{ marginBottom: '24px', color: '#666' }}>
        功能特性：Schema 渲染、条件字段、异步校验
      </p>
      
      <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <strong>提示：</strong>
        <ul style={{ margin: '8px 0 0 20px' }}>
          <li>尝试输入 <code style={{ background: '#ddd', padding: '2px 4px', borderRadius: '2px' }}>admin</code> 作为用户名，会触发异步校验失败</li>
          <li>选择不同的用户类型，会显示不同的条件字段</li>
          <li>勾选订阅新闻通讯，会显示订阅频率选项</li>
        </ul>
      </div>
      
      <FormWithValues />
    </div>
  )
}

export default App
