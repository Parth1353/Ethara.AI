import { httpApi } from './httpApi.js'
import { mockApi } from './mockApi.js'

const useMockApi = import.meta.env.VITE_USE_MOCK_API !== 'false'

export const inventoryApi = useMockApi ? mockApi : httpApi

export const queryKeys = {
  products: ['products'],
  customers: ['customers'],
  orders: ['orders'],
  order: (id) => ['orders', id],
}
