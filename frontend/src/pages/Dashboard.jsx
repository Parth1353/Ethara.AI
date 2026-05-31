import { AlertTriangle, Package, ShoppingCart, TrendingDown, Users, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import EmptyState from '../components/EmptyState.jsx'
import StatusMessage from '../components/StatusMessage.jsx'
import SummaryCard from '../components/SummaryCard.jsx'
import { getErrorMessage } from '../api/errors.js'
import { inventoryApi, queryKeys } from '../api/inventoryApi.js'
import { formatCurrency } from '../utils/formatters.js'
import CartLoader from '../components/CartLoader.jsx'

const PIE_COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']

function Dashboard() {
  const productsQuery = useQuery({ queryKey: queryKeys.products, queryFn: inventoryApi.products.list })
  const customersQuery = useQuery({ queryKey: queryKeys.customers, queryFn: inventoryApi.customers.list })
  const ordersQuery = useQuery({ queryKey: queryKeys.orders, queryFn: inventoryApi.orders.list })

  const loading = productsQuery.isLoading || customersQuery.isLoading || ordersQuery.isLoading
  const error = productsQuery.error || customersQuery.error || ordersQuery.error

  if (loading) {
    return (
      <section className="page-stack">
        <CartLoader text="Loading dashboard data..." />
      </section>
    )
  }

  const products = productsQuery.data ?? []
  const customers = customersQuery.data ?? []
  const orders = ordersQuery.data ?? []
  
  const lowStockProducts = products.filter((product) => product.quantity_in_stock <= 5)
  const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0)

  // Chart Data Calculations
  const revenueData = [...orders]
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
    .slice(-15)
    .map((o, i) => ({
      name: `Order ${i + 1}`,
      amount: o.total_amount,
    }))

  const productSales = {}
  orders.forEach((order) => {
    order.items.forEach((item) => {
      productSales[item.product_name] = (productSales[item.product_name] || 0) + item.line_total
    })
  })
  
  const topProductsData = Object.entries(productSales)
    .map(([name, sales]) => ({ name, sales }))
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5)

  const stockData = [...products]
    .sort((a, b) => b.quantity_in_stock - a.quantity_in_stock)
    .slice(0, 5)
    .map((p) => ({ name: p.name, value: p.quantity_in_stock }))

  // Custom tooltip formatters
  const CurrencyTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{label}</p>
          <p className="chart-tooltip-value">{formatCurrency(payload[0].value)}</p>
        </div>
      )
    }
    return null
  }

  const StandardTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">{payload[0].name}</p>
          <p className="chart-tooltip-value">{payload[0].value} units</p>
        </div>
      )
    }
    return null
  }

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
        <SummaryCard icon={Package} label="Total products" value={products.length} tone="blue" />
        <SummaryCard icon={Users} label="Total customers" value={customers.length} tone="green" />
        <SummaryCard icon={ShoppingCart} label="Total orders" value={orders.length} tone="violet" />
        <SummaryCard icon={TrendingDown} label="Low stock products" value={lowStockProducts.length} tone="amber" />
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

      {/* Analytics Charts Grid */}
      <div className="content-grid">
        {/* Revenue Area Chart */}
        <section className="panel col-span-full">
          <div className="panel-heading">
            <div>
              <h2 className="flex-center"><Activity size={18} className="mr-2" /> Revenue Trend</h2>
              <p>Recent order totals</p>
            </div>
          </div>
          <div className="chart-container">
            {orders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--accent-blue)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--accent-blue)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip content={<CurrencyTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="var(--accent-blue)" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={Activity} title="No revenue data" message="Created orders will populate this chart." />
            )}
          </div>
        </section>

        {/* Top Products Bar Chart */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2 className="flex-center"><BarChart3 size={18} className="mr-2" /> Top Products</h2>
              <p>Highest revenue items</p>
            </div>
          </div>
          <div className="chart-container">
            {topProductsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-glass)" horizontal={true} vertical={false} />
                  <XAxis type="number" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <YAxis dataKey="name" type="category" width={115} stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => value.length > 18 ? value.substring(0, 16) + '...' : value} />
                  <Tooltip content={<CurrencyTooltip />} cursor={{ fill: 'var(--border-glass)' }} />
                  <Bar dataKey="sales" fill="var(--accent-purple)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} title="No sales data" message="Products sold will appear here." />
            )}
          </div>
        </section>

        {/* Stock Distribution Pie Chart */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2 className="flex-center"><PieChartIcon size={18} className="mr-2" /> Stock Distribution</h2>
              <p>Highest inventory levels</p>
            </div>
          </div>
          <div className="chart-container">
            {stockData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<StandardTooltip />} />
                  <Pie
                    data={stockData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {stockData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={PieChartIcon} title="No inventory" message="Add products to see stock distribution." />
            )}
          </div>
        </section>
      </div>
    </section>
  )
}

export default Dashboard
