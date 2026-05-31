import { Link } from 'react-router-dom'
import { LayoutDashboard } from 'lucide-react'
import EmptyState from '../components/EmptyState.jsx'

function NotFound() {
  return (
    <section className="page-stack">
      <EmptyState
        icon={LayoutDashboard}
        title="Page not found"
        message="The requested page does not exist."
        action={
          <Link className="primary-button" to="/">
            <LayoutDashboard size={18} aria-hidden="true" />
            <span>Open dashboard</span>
          </Link>
        }
      />
    </section>
  )
}

export default NotFound
