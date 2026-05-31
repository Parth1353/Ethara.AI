import { ArrowLeft, ShoppingCart, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import CartLoader from '../components/CartLoader.jsx'
import EmptyState from '../components/EmptyState.jsx'
import StatusMessage from '../components/StatusMessage.jsx'
import { getErrorMessage } from '../api/errors.js'
import { inventoryApi, queryKeys } from '../api/inventoryApi.js'
import { formatCurrency, formatDateTime } from '../utils/formatters.js'

function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const orderQuery = useQuery({
    queryKey: queryKeys.order(id),
    queryFn: () => inventoryApi.orders.get(id),
    retry: false,
  })

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.orders.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders })
      queryClient.invalidateQueries({ queryKey: queryKeys.products })
      navigate('/orders')
    },
  })

  const deleteOrder = async () => {
    if (!window.confirm(`Delete order ${id}?`)) {
      return
    }

    await deleteMutation.mutateAsync(id)
  }

  if (orderQuery.isLoading) {
    return (
      <section className="page-stack">
        <CartLoader text="Loading order..." />
      </section>
    )
  }

  if (orderQuery.isError) {
    return (
      <section className="page-stack">
        <Link className="back-link" to="/orders">
          <ArrowLeft size={18} aria-hidden="true" />
          <span>Back to orders</span>
        </Link>
        <EmptyState icon={ShoppingCart} title="Order not found" message={getErrorMessage(orderQuery.error)} />
      </section>
    )
  }

  const order = orderQuery.data

  return (
    <section className="page-stack">
      <Link className="back-link" to="/orders">
        <ArrowLeft size={18} aria-hidden="true" />
        <span>Back to orders</span>
      </Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">Order details</p>
          <h1>{order.id}</h1>
        </div>
        <button className="danger-button" type="button" onClick={deleteOrder} disabled={deleteMutation.isPending}>
          <Trash2 size={18} aria-hidden="true" />
          <span>Delete order</span>
        </button>
      </div>

      {deleteMutation.isError ? <StatusMessage type="error">{getErrorMessage(deleteMutation.error)}</StatusMessage> : null}

      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Customer</h2>
              <p>{formatDateTime(order.created_at)}</p>
            </div>
          </div>
          <div className="detail-list">
            <div>
              <span>Name</span>
              <strong>{order.customer.full_name}</strong>
            </div>
            <div>
              <span>Email</span>
              <strong>{order.customer.email}</strong>
            </div>
            <div>
              <span>Phone</span>
              <strong>{order.customer.phone}</strong>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Total amount</h2>
              <p>Calculated from item prices</p>
            </div>
          </div>
          <div className="total-display">{formatCurrency(order.total_amount)}</div>
        </section>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h2>Items</h2>
            <p>{order.items.length} item lines</p>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Quantity</th>
                <th>Unit price</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.product_id}>
                  <td>{item.product_name}</td>
                  <td>{item.sku}</td>
                  <td>{item.quantity}</td>
                  <td>{formatCurrency(item.unit_price)}</td>
                  <td>{formatCurrency(item.line_total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

export default OrderDetails
