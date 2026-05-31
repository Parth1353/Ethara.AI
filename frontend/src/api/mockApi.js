import { ApiError } from './errors.js'

const STORAGE_KEY = 'eugen_inventory_order_management'

const timestamp = '2026-05-31T00:00:00.000Z'

const seedProducts = [
  {
    id: 'prod_1001',
    name: 'Wireless Barcode Scanner',
    sku: 'SCN-100',
    price: 129.99,
    quantity_in_stock: 12,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: 'prod_1002',
    name: 'Thermal Shipping Labels',
    sku: 'LBL-240',
    price: 18.5,
    quantity_in_stock: 4,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: 'prod_1003',
    name: 'Inventory Tablet Stand',
    sku: 'STD-330',
    price: 46,
    quantity_in_stock: 21,
    created_at: timestamp,
    updated_at: timestamp,
  },
  {
    id: 'prod_1004',
    name: 'Packing Tape Case',
    sku: 'PKT-090',
    price: 33.75,
    quantity_in_stock: 2,
    created_at: timestamp,
    updated_at: timestamp,
  },
]

const seedCustomers = [
  {
    id: 'cust_1001',
    full_name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+91 98765 43210',
    created_at: timestamp,
  },
  {
    id: 'cust_1002',
    full_name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+91 91234 56780',
    created_at: timestamp,
  },
]

const seedOrders = [
  {
    id: 'ord_1001',
    customer: seedCustomers[0],
    items: [
      {
        product_id: 'prod_1001',
        product_name: 'Wireless Barcode Scanner',
        sku: 'SCN-100',
        quantity: 2,
        unit_price: 129.99,
        line_total: 259.98,
      },
      {
        product_id: 'prod_1002',
        product_name: 'Thermal Shipping Labels',
        sku: 'LBL-240',
        quantity: 3,
        unit_price: 18.5,
        line_total: 55.5,
      },
    ],
    total_amount: 315.48,
    created_at: timestamp,
  },
]

const createSeedState = () => ({
  products: seedProducts,
  customers: seedCustomers,
  orders: seedOrders,
})

const clone = (value) => JSON.parse(JSON.stringify(value))

const now = () => new Date().toISOString()

const roundMoney = (value) => Math.round((Number(value) + Number.EPSILON) * 100) / 100

const newId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

const requiredText = (value) => String(value ?? '').trim()

const normalizedKey = (value) => requiredText(value).toLowerCase()

const readState = () => {
  const stored = window.localStorage.getItem(STORAGE_KEY)

  if (!stored) {
    const seed = createSeedState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return clone(seed)
  }

  try {
    return JSON.parse(stored)
  } catch {
    const seed = createSeedState()
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seed))
    return clone(seed)
  }
}

const writeState = (state) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

const respond = (handler) =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      try {
        resolve(clone(handler()))
      } catch (error) {
        reject(error)
      }
    }, 180)
  })

const parsePrice = (value) => {
  const price = Number(value)

  if (!Number.isFinite(price) || price < 0) {
    throw new ApiError('Product price must be zero or greater.', 422)
  }

  return roundMoney(price)
}

const parseStock = (value) => {
  const quantity = Number(value)

  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new ApiError('Product quantity cannot be negative.', 422)
  }

  return quantity
}

const parseOrderQuantity = (value) => {
  const quantity = Number(value)

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new ApiError('Order quantities must be whole numbers greater than zero.', 422)
  }

  return quantity
}

const ensureProductPayload = (payload) => {
  const name = requiredText(payload.name)
  const sku = requiredText(payload.sku).toUpperCase()

  if (!name) {
    throw new ApiError('Product name is required.', 422)
  }

  if (!sku) {
    throw new ApiError('Product SKU is required.', 422)
  }

  return {
    name,
    sku,
    price: parsePrice(payload.price),
    quantity_in_stock: parseStock(payload.quantity_in_stock),
  }
}

const ensureCustomerPayload = (payload) => {
  const full_name = requiredText(payload.full_name)
  const email = requiredText(payload.email).toLowerCase()
  const phone = requiredText(payload.phone)

  if (!full_name) {
    throw new ApiError('Customer full name is required.', 422)
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new ApiError('Enter a valid customer email address.', 422)
  }

  if (!phone) {
    throw new ApiError('Customer phone number is required.', 422)
  }

  return { full_name, email, phone }
}

const findProduct = (state, id) => {
  const product = state.products.find((item) => item.id === id)

  if (!product) {
    throw new ApiError('Product not found.', 404)
  }

  return product
}

const findCustomer = (state, id) => {
  const customer = state.customers.find((item) => item.id === id)

  if (!customer) {
    throw new ApiError('Customer not found.', 404)
  }

  return customer
}

const findOrder = (state, id) => {
  const order = state.orders.find((item) => item.id === id)

  if (!order) {
    throw new ApiError('Order not found.', 404)
  }

  return order
}

const ensureUniqueSku = (state, sku, productId = null) => {
  const exists = state.products.some(
    (product) => normalizedKey(product.sku) === normalizedKey(sku) && product.id !== productId,
  )

  if (exists) {
    throw new ApiError('Product SKU must be unique.', 409)
  }
}

const ensureUniqueEmail = (state, email) => {
  const exists = state.customers.some((customer) => normalizedKey(customer.email) === normalizedKey(email))

  if (exists) {
    throw new ApiError('Customer email must be unique.', 409)
  }
}

const prepareOrder = (state, payload) => {
  const customer = findCustomer(state, payload.customer_id)
  const items = Array.isArray(payload.items) ? payload.items : []

  if (items.length === 0) {
    throw new ApiError('Add at least one product to the order.', 422)
  }

  const grouped = new Map()

  for (const item of items) {
    const productId = requiredText(item.product_id)
    const quantity = parseOrderQuantity(item.quantity)

    if (!productId) {
      throw new ApiError('Each order item must include a product.', 422)
    }

    findProduct(state, productId)
    grouped.set(productId, (grouped.get(productId) ?? 0) + quantity)
  }

  const preparedItems = Array.from(grouped.entries()).map(([productId, quantity]) => {
    const product = findProduct(state, productId)

    if (product.quantity_in_stock < quantity) {
      throw new ApiError(`Insufficient inventory for ${product.name}.`, 409)
    }

    const unitPrice = roundMoney(product.price)

    return {
      product_id: product.id,
      product_name: product.name,
      sku: product.sku,
      quantity,
      unit_price: unitPrice,
      line_total: roundMoney(unitPrice * quantity),
    }
  })

  const total = preparedItems.reduce((sum, item) => sum + item.line_total, 0)

  return {
    customer: clone(customer),
    items: preparedItems,
    total_amount: roundMoney(total),
  }
}

export const mockApi = {
  products: {
    list: () =>
      respond(() => {
        const state = readState()
        return state.products.sort((a, b) => a.name.localeCompare(b.name))
      }),
    get: (id) =>
      respond(() => {
        const state = readState()
        return findProduct(state, id)
      }),
    create: (payload) =>
      respond(() => {
        const state = readState()
        const productPayload = ensureProductPayload(payload)
        ensureUniqueSku(state, productPayload.sku)

        const created = {
          id: newId('prod'),
          ...productPayload,
          created_at: now(),
          updated_at: now(),
        }

        state.products.push(created)
        writeState(state)
        return created
      }),
    update: (id, payload) =>
      respond(() => {
        const state = readState()
        findProduct(state, id)
        const productPayload = ensureProductPayload(payload)
        ensureUniqueSku(state, productPayload.sku, id)

        const updated = {
          ...state.products.find((product) => product.id === id),
          ...productPayload,
          updated_at: now(),
        }

        state.products = state.products.map((product) => (product.id === id ? updated : product))
        writeState(state)
        return updated
      }),
    remove: (id) =>
      respond(() => {
        const state = readState()
        findProduct(state, id)

        const hasOrders = state.orders.some((order) => order.items.some((item) => item.product_id === id))

        if (hasOrders) {
          throw new ApiError('Products used in existing orders cannot be deleted.', 409)
        }

        state.products = state.products.filter((product) => product.id !== id)
        writeState(state)
        return { id }
      }),
  },
  customers: {
    list: () =>
      respond(() => {
        const state = readState()
        return state.customers.sort((a, b) => a.full_name.localeCompare(b.full_name))
      }),
    get: (id) =>
      respond(() => {
        const state = readState()
        return findCustomer(state, id)
      }),
    create: (payload) =>
      respond(() => {
        const state = readState()
        const customerPayload = ensureCustomerPayload(payload)
        ensureUniqueEmail(state, customerPayload.email)

        const created = {
          id: newId('cust'),
          ...customerPayload,
          created_at: now(),
        }

        state.customers.push(created)
        writeState(state)
        return created
      }),
    remove: (id) =>
      respond(() => {
        const state = readState()
        findCustomer(state, id)
        state.customers = state.customers.filter((customer) => customer.id !== id)
        writeState(state)
        return { id }
      }),
  },
  orders: {
    list: () =>
      respond(() => {
        const state = readState()
        return state.orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      }),
    get: (id) =>
      respond(() => {
        const state = readState()
        return findOrder(state, id)
      }),
    create: (payload) =>
      respond(() => {
        const state = readState()
        const prepared = prepareOrder(state, payload)
        const orderTimestamp = now()

        state.products = state.products.map((product) => {
          const orderItem = prepared.items.find((item) => item.product_id === product.id)

          if (!orderItem) {
            return product
          }

          return {
            ...product,
            quantity_in_stock: product.quantity_in_stock - orderItem.quantity,
            updated_at: orderTimestamp,
          }
        })

        const created = {
          id: newId('ord'),
          ...prepared,
          created_at: orderTimestamp,
        }

        state.orders.unshift(created)
        writeState(state)
        return created
      }),
    remove: (id) =>
      respond(() => {
        const state = readState()
        const order = findOrder(state, id)
        const deleteTimestamp = now()

        state.products = state.products.map((product) => {
          const orderItem = order.items.find((item) => item.product_id === product.id)

          if (!orderItem) {
            return product
          }

          return {
            ...product,
            quantity_in_stock: product.quantity_in_stock + orderItem.quantity,
            updated_at: deleteTimestamp,
          }
        })

        state.orders = state.orders.filter((item) => item.id !== id)
        writeState(state)
        return { id }
      }),
  },
}
