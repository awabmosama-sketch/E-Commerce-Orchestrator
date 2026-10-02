const STYLES = {
  open: 'bg-sky-50 text-sky-700 ring-sky-200',
  investigating: 'bg-amber-50 text-amber-700 ring-amber-200',
  awaiting_approval: 'bg-orange-50 text-orange-700 ring-orange-200',
  executing: 'bg-violet-50 text-violet-700 ring-violet-200',
  resolved: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-slate-100 text-slate-600 ring-slate-200',
  failed: 'bg-rose-50 text-rose-700 ring-rose-200',
}

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${STYLES[status] || STYLES.rejected}`}>
      <span className="size-1.5 rounded-full bg-current" />
      {status.replace(/_/g, ' ')}
    </span>
  )
}
