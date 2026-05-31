function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state">
      {Icon ? <Icon size={28} aria-hidden="true" /> : null}
      <h3>{title}</h3>
      <p>{message}</p>
      {action ? <div className="empty-action">{action}</div> : null}
    </div>
  )
}

export default EmptyState
