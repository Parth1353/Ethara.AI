import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const iconMap = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
}

function StatusMessage({ type = 'info', children }) {
  if (!children) {
    return null
  }

  const Icon = iconMap[type] ?? Info

  return (
    <div className={`status-message ${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icon size={18} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}

export default StatusMessage
