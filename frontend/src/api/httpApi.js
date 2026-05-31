import { ApiError } from './errors.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const readResponseBody = async (response) => {
  const text = await response.text()

  if (!text) {
    return null
  }

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  const body = await readResponseBody(response)

  if (!response.ok) {
    const detail = typeof body === 'object' && body !== null ? body.detail ?? body.message : body
    throw new ApiError(detail || 'Request failed.', response.status, body)
  }

  return body
}

const jsonOptions = (method, body) => ({
  method,
  body: JSON.stringify(body),
})

export const httpApi = {
  products: {
    list: () => request('/products'),
    get: (id) => request(`/products/${id}`),
    create: (payload) => request('/products', jsonOptions('POST', payload)),
    update: (id, payload) => request(`/products/${id}`, jsonOptions('PUT', payload)),
    remove: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => request('/customers'),
    get: (id) => request(`/customers/${id}`),
    create: (payload) => request('/customers', jsonOptions('POST', payload)),
    remove: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    get: (id) => request(`/orders/${id}`),
    create: (payload) => request('/orders', jsonOptions('POST', payload)),
    remove: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  },
}
