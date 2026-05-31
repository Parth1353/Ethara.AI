import { Edit3, PackagePlus, Save, Trash2, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import StatusMessage from '../components/StatusMessage.jsx'
import { getErrorMessage } from '../api/errors.js'
import { inventoryApi, queryKeys } from '../api/inventoryApi.js'
import { formatCurrency } from '../utils/formatters.js'

const emptyForm = {
  name: '',
  sku: '',
  price: '',
  quantity_in_stock: '',
}

function Products() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState(null)

  const productsQuery = useQuery({
    queryKey: queryKeys.products,
    queryFn: inventoryApi.products.list,
  })

  const products = productsQuery.data ?? []

  const refreshProducts = () => queryClient.invalidateQueries({ queryKey: queryKeys.products })

  const createMutation = useMutation({
    mutationFn: inventoryApi.products.create,
    onSuccess: () => {
      refreshProducts()
      setForm(emptyForm)
      setMessage({ type: 'success', text: 'Product added successfully.' })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => inventoryApi.products.update(id, payload),
    onSuccess: () => {
      refreshProducts()
      setForm(emptyForm)
      setEditingId(null)
      setMessage({ type: 'success', text: 'Product updated successfully.' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.products.remove,
    onSuccess: () => {
      refreshProducts()
      setMessage({ type: 'success', text: 'Product deleted successfully.' })
    },
  })

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const payload = () => ({
    name: form.name,
    sku: form.sku,
    price: Number(form.price),
    quantity_in_stock: Number(form.quantity_in_stock),
  })

  const validate = () => {
    if (!form.name.trim()) {
      return 'Product name is required.'
    }

    if (!form.sku.trim()) {
      return 'Product SKU is required.'
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      return 'Product price must be zero or greater.'
    }

    if (!Number.isInteger(Number(form.quantity_in_stock)) || Number(form.quantity_in_stock) < 0) {
      return 'Quantity in stock must be a whole number zero or greater.'
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

    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, payload: payload() })
      } else {
        await createMutation.mutateAsync(payload())
      }
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) })
    }
  }

  const startEdit = (product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    })
    setMessage(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
    setMessage(null)
  }

  const deleteProduct = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) {
      return
    }

    setMessage(null)

    try {
      await deleteMutation.mutateAsync(product.id)
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) })
    }
  }

  const busy = createMutation.isPending || updateMutation.isPending

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Product management</p>
          <h1>Products</h1>
        </div>
      </div>

      <div className="split-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>{editingId ? 'Update product' : 'Add product'}</h2>
              <p>SKU, price, and stock are validated before saving</p>
            </div>
          </div>

          <StatusMessage type={message?.type}>{message?.text}</StatusMessage>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Product name</span>
              <input value={form.name} onChange={(event) => setField('name', event.target.value)} placeholder="Wireless scanner" />
            </label>
            <label>
              <span>SKU/code</span>
              <input value={form.sku} onChange={(event) => setField('sku', event.target.value)} placeholder="SCN-100" />
            </label>
            <label>
              <span>Price</span>
              <input value={form.price} onChange={(event) => setField('price', event.target.value)} min="0" step="0.01" type="number" placeholder="129.99" />
            </label>
            <label>
              <span>Quantity in stock</span>
              <input value={form.quantity_in_stock} onChange={(event) => setField('quantity_in_stock', event.target.value)} min="0" step="1" type="number" placeholder="20" />
            </label>

            <div className="button-row">
              <button className="primary-button" type="submit" disabled={busy}>
                {editingId ? <Save size={18} aria-hidden="true" /> : <PackagePlus size={18} aria-hidden="true" />}
                <span>{editingId ? 'Save product' : 'Add product'}</span>
              </button>
              {editingId ? (
                <button className="secondary-button" type="button" onClick={cancelEdit}>
                  <X size={18} aria-hidden="true" />
                  <span>Cancel</span>
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="panel wide-panel">
          <div className="panel-heading">
            <div>
              <h2>Product list</h2>
              <p>{products.length} products available</p>
            </div>
          </div>

          {productsQuery.isError ? <StatusMessage type="error">{getErrorMessage(productsQuery.error)}</StatusMessage> : null}

          {products.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>
                        <span className={`stock-pill ${product.quantity_in_stock <= 5 ? 'warning' : 'ok'}`}>
                          {product.quantity_in_stock}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-button" type="button" title="Edit product" aria-label={`Edit ${product.name}`} onClick={() => startEdit(product)}>
                            <Edit3 size={17} aria-hidden="true" />
                          </button>
                          <button className="icon-button danger" type="button" title="Delete product" aria-label={`Delete ${product.name}`} onClick={() => deleteProduct(product)} disabled={deleteMutation.isPending}>
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
            <EmptyState icon={PackagePlus} title="No products yet" message="Add your first product to start tracking inventory." />
          )}
        </section>
      </div>
    </section>
  )
}

export default Products
