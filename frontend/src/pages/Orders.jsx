import { Eye, Plus, ShoppingCart, Trash2, X } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import StatusMessage from '../components/StatusMessage.jsx'
import { getErrorMessage } from '../api/errors.js'
import { inventoryApi, queryKeys } from '../api/inventoryApi.js'
import { formatCurrency, formatDateTime, productLabel } from '../utils/formatters.js'

const createLine = () => ({
  rowId: `row_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  product_id: '',
  quantity: 1,
})

const idKey = (value) => String(value)

const apiId = (value) => (/^\d+$/.test(String(value)) ? Number(value) : value)

function Orders() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [customerId, setCustomerId] = useState('')
  const [lines, setLines] = useState([createLine()])
  const [message, setMessage] = useState(null)

  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: inventoryApi.products.list,
  })
  const customersQuery = useQuery({
    queryKey: queryKeys.customers,
    queryFn: inventoryApi.customers.list,
  })
  const ordersQuery = useQuery({
    queryKey: queryKeys.orders,
    queryFn: inventoryApi.orders.list,
  })

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])
  const customers = customersQuery.data ?? []
  const orders = ordersQuery.data ?? []
  const productsById = useMemo(() => new Map(products.map((product) => [idKey(product.id), product])), [products])

  const estimatedTotal = lines.reduce((sum, line) => {
    const product = productsById.get(line.product_id)
    const quantity = Number(line.quantity)

    if (!product || !Number.isFinite(quantity)) {
      return sum
    }

    return sum + Number(product.price) * quantity
  }, 0)

  const refreshOrders = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.orders })
    queryClient.invalidateQueries({ queryKey: queryKeys.products })
  }

  const createMutation = useMutation({
    mutationFn: inventoryApi.orders.create,
    onSuccess: (order) => {
      refreshOrders()
      setCustomerId('')
      setLines([createLine()])
      navigate(`/orders/${order.id}`)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.orders.remove,
    onSuccess: () => {
      refreshOrders()
      setMessage({ type: 'success', text: 'Order deleted and stock restored.' })
    },
  })

  const setLine = (rowId, field, value) => {
    setLines((current) => current.map((line) => (line.rowId === rowId ? { ...line, [field]: value } : line)))
  }

  const addLine = () => {
    setLines((current) => [...current, createLine()])
  }

  const removeLine = (rowId) => {
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.rowId !== rowId)))
  }

  const validate = () => {
    if (!customerId) {
      return 'Select a customer for this order.'
    }

    for (const line of lines) {
      if (!line.product_id) {
        return 'Select a product for every order line.'
      }

      if (!Number.isInteger(Number(line.quantity)) || Number(line.quantity) <= 0) {
        return 'Every quantity must be a whole number greater than zero.'
      }
    }

    return ''
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage(null)
    const validationMessage = validate()

    if (validationMessage) {
      setMessage({ type: 'error', text: validationMessage })
      return
    }

    const payload = {
      customer_id: apiId(customerId),
      items: lines.map((line) => ({
        product_id: apiId(line.product_id),
        quantity: Number(line.quantity),
      })),
    }

    try {
      await createMutation.mutateAsync(payload)
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) })
    }
  }

  const deleteOrder = async (order) => {
    if (!window.confirm(`Delete order ${order.id}?`)) {
      return
    }

    setMessage(null)

    try {
      await deleteMutation.mutateAsync(order.id)
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) })
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Order management</p>
          <h1>Orders</h1>
        </div>
      </div>

      <div className="split-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Create order</h2>
              <p>Totals and stock changes are handled by the API layer</p>
            </div>
          </div>

          <StatusMessage type={message?.type}>{message?.text}</StatusMessage>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Customer</span>
              <select value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                <option value="">Select customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={idKey(customer.id)}>
                    {customer.full_name}
                  </option>
                ))}
              </select>
            </label>

            <div className="line-items">
              {lines.map((line) => {
                const product = productsById.get(line.product_id)

                return (
                  <div className="line-item" key={line.rowId}>
                    <label>
                      <span>Product</span>
                      <select value={line.product_id} onChange={(event) => setLine(line.rowId, 'product_id', event.target.value)}>
                        <option value="">Select product</option>
                        {products.map((item) => (
                          <option key={item.id} value={idKey(item.id)}>
                            {productLabel(item)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span>Quantity</span>
                      <input value={line.quantity} onChange={(event) => setLine(line.rowId, 'quantity', event.target.value)} min="1" step="1" type="number" />
                    </label>
                    <button className="icon-button danger line-remove" type="button" title="Remove line" aria-label="Remove order line" onClick={() => removeLine(line.rowId)}>
                      <X size={17} aria-hidden="true" />
                    </button>
                    <p className="line-stock">{product ? `${product.quantity_in_stock} in stock` : 'Select a product'}</p>
                  </div>
                )
              })}
            </div>

            <button className="secondary-button" type="button" onClick={addLine}>
              <Plus size={18} aria-hidden="true" />
              <span>Add line</span>
            </button>

            <div className="order-total">
              <span>Estimated total</span>
              <strong>{formatCurrency(estimatedTotal)}</strong>
            </div>

            <div className="button-row">
              <button className="primary-button" type="submit" disabled={createMutation.isPending || customers.length === 0 || products.length === 0}>
                <ShoppingCart size={18} aria-hidden="true" />
                <span>Create order</span>
              </button>
            </div>
          </form>
        </section>

        <section className="panel wide-panel">
          <div className="panel-heading">
            <div>
              <h2>Order list</h2>
              <p>{orders.length} orders created</p>
            </div>
          </div>

          {productsQuery.isError || customersQuery.isError || ordersQuery.isError ? (
            <StatusMessage type="error">{getErrorMessage(productsQuery.error || customersQuery.error || ordersQuery.error)}</StatusMessage>
          ) : null}

          {orders.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer.full_name}</td>
                      <td>{formatDateTime(order.created_at)}</td>
                      <td>{formatCurrency(order.total_amount)}</td>
                      <td>
                        <div className="table-actions">
                          <Link className="icon-button" title="View order" aria-label={`View ${order.id}`} to={`/orders/${order.id}`}>
                            <Eye size={17} aria-hidden="true" />
                          </Link>
                          <button className="icon-button danger" type="button" title="Delete order" aria-label={`Delete ${order.id}`} onClick={() => deleteOrder(order)} disabled={deleteMutation.isPending}>
                            <Trash2 size={17} aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={ShoppingCart} title="No orders yet" message="Create an order to reduce inventory and view calculated totals." />
          )}
        </section>
      </div>
    </section>
  )
}

export default Orders
