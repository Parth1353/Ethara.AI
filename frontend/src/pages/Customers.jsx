import { Trash2, UserPlus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import StatusMessage from '../components/StatusMessage.jsx'
import { getErrorMessage } from '../api/errors.js'
import { inventoryApi, queryKeys } from '../api/inventoryApi.js'

const emptyForm = {
  full_name: '',
  email: '',
  phone: '',
}

function Customers() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState(null)

  const customersQuery = useQuery({
    queryKey: queryKeys.customers,
    queryFn: inventoryApi.customers.list,
  })

  const customers = customersQuery.data ?? []

  const createMutation = useMutation({
    mutationFn: inventoryApi.customers.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
      setForm(emptyForm)
      setMessage({ type: 'success', text: 'Customer added successfully.' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.customers.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers })
      setMessage({ type: 'success', text: 'Customer deleted successfully.' })
    },
  })

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const validate = () => {
    if (!form.full_name.trim()) {
      return 'Customer full name is required.'
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Enter a valid customer email address.'
    }

    if (!form.phone.trim()) {
      return 'Customer phone number is required.'
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
      await createMutation.mutateAsync(form)
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) })
    }
  }

  const deleteCustomer = async (customer) => {
    if (!window.confirm(`Delete ${customer.full_name}?`)) {
      return
    }

    setMessage(null)

    try {
      await deleteMutation.mutateAsync(customer.id)
    } catch (error) {
      setMessage({ type: 'error', text: getErrorMessage(error) })
    }
  }

  return (
    <section className="page-stack">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Customer management</p>
          <h1>Customers</h1>
        </div>
      </div>

      <div className="split-layout">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Add customer</h2>
              <p>Email addresses must be unique</p>
            </div>
          </div>

          <StatusMessage type={message?.type}>{message?.text}</StatusMessage>

          <form className="form-grid" onSubmit={handleSubmit}>
            <label>
              <span>Full name</span>
              <input value={form.full_name} onChange={(event) => setField('full_name', event.target.value)} placeholder="Aarav Mehta" />
            </label>
            <label>
              <span>Email address</span>
              <input value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="aarav@example.com" type="email" />
            </label>
            <label>
              <span>Phone number</span>
              <input value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="+91 98765 43210" />
            </label>
            <div className="button-row">
              <button className="primary-button" type="submit" disabled={createMutation.isPending}>
                <UserPlus size={18} aria-hidden="true" />
                <span>Add customer</span>
              </button>
            </div>
          </form>
        </section>

        <section className="panel wide-panel">
          <div className="panel-heading">
            <div>
              <h2>Customer list</h2>
              <p>{customers.length} customers saved</p>
            </div>
          </div>

          {customersQuery.isError ? <StatusMessage type="error">{getErrorMessage(customersQuery.error)}</StatusMessage> : null}

          {customers.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.full_name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>
                        <button className="icon-button danger" type="button" title="Delete customer" aria-label={`Delete ${customer.full_name}`} onClick={() => deleteCustomer(customer)} disabled={deleteMutation.isPending}>
                          <Trash2 size={17} aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState icon={UserPlus} title="No customers yet" message="Add a customer before creating an order." />
          )}
        </section>
      </div>
    </section>
  )
}

export default Customers
