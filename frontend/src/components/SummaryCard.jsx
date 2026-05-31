function SummaryCard({ icon: Icon, label, value, tone = 'blue' }) {
  return (
    <article className={`summary-card ${tone}`}>
      <div className="summary-icon">{Icon ? <Icon size={22} aria-hidden="true" /> : null}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
      </div>
    </article>
  )
}

export default SummaryCard
