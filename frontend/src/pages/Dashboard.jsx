import { AlertTriangle, Package, ShoppingCart, TrendingDown, Users } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import EmptyState from '../components/EmptyState.jsx'
import StatusMessage from '../components/StatusMessage.jsx'
import SummaryCard from '../components/SummaryCard.jsx'
import { getErrorMessage } from '../api/errors.js'
import { inventoryApi, queryKeys } from '../api/inventoryApi.js'
import { formatCurrency } from '../utils/formatters.js'

function Dashboard() {
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

  const products = productsQuery.data ?? []
  const customers = customersQuery.data ?? []
  const orders = ordersQuery.data ?? []
  const lowStockProducts = products.filter((product) => product.quantity_in_stock <= 5)
  const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0)
  const loading = productsQuery.isLoading || customersQuery.isLoading || ordersQuery.isLoading
  const error = productsQuery.error || customersQuery.error || ordersQuery.error

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Operations dashboard</p>
          <h1>Inventory overview</h1>
        </div>
      </div>

      {error ? <StatusMessage type="error">{getErrorMessage(error)}</StatusMessage> : null}

      <div className="summary-grid">
        <SummaryCard icon={Package} label="Total products" value={loading ? '...' : products.length} tone="blue" />
        <SummaryCard icon={Users} label="Total customers" value={loading ? '...' : customers.length} tone="green" />
        <SummaryCard icon={ShoppingCart} label="Total orders" value={loading ? '...' : orders.length} tone="violet" />
        <SummaryCard icon={TrendingDown} label="Low stock products" value={loading ? '...' : lowStockProducts.length} tone="amber" />
      </div>

      <div className="content-grid">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Low stock products</h2>
              <p>Products at or below 5 units</p>
            </div>
          </div>

          {lowStockProducts.length > 0 ? (
            <div className="stock-list">
              {lowStockProducts.map((product) => (
                <article className="stock-row" key={product.id}>
                  <div>
                    <strong>{product.name}</strong>
                    <span>{product.sku}</span>
                  </div>
                  <span className="stock-pill warning">{product.quantity_in_stock} left</span>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={AlertTriangle} title="Stock levels are healthy" message="No products are currently below the low-stock threshold." />
          )}
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent orders</h2>
              <p>{formatCurrency(revenue)} recorded revenue</p>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="order-mini-list">
              {orders.slice(0, 5).map((order) => (
                <article className="order-mini-row" key={order.id}>
                  <div>
                    <strong>{order.customer.full_name}</strong>
                    <span>{order.items.length} item lines</span>
                  </div>
                  <strong>{formatCurrency(order.total_amount)}</strong>
                </article>
              ))}
            </div>
          ) : (
            <EmptyState icon={ShoppingCart} title="No orders yet" message="Created orders will appear here with calculated totals." />
          )}
        </section>
      </div>
    </section>
  )
}

export default Dashboard
