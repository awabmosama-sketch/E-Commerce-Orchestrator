import { Activity, CheckCircle2, Clock, Inbox } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'

const TILES = [
  { key: 'total', label: 'Total tickets', icon: Inbox, tone: 'text-teal-600', accent: 'bg-teal-50' },
  { key: 'open', label: 'Open', icon: Clock, tone: 'text-sky-600', accent: 'bg-sky-50' },
  { key: 'awaiting_approval', label: 'Awaiting approval', icon: Activity, tone: 'text-orange-600', accent: 'bg-orange-50' },
  { key: 'resolved', label: 'Resolved', icon: CheckCircle2, tone: 'text-emerald-600', accent: 'bg-emerald-50' },
]

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/tickets/stats/overview').then(r => r.data),
    refetchInterval: 10_000,
  })
  const { data: tickets } = useQuery({
    queryKey: ['tickets', ''],
    queryFn: () => api.get('/tickets').then(r => r.data),
    refetchInterval: 5000,
  })

  const value = (key) => (key === 'total' ? stats?.total ?? 0 : stats?.by_status?.[key] ?? 0)

  return (
    <div className="space-y-7">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Operations overview</p>
        <h1 className="display-font text-3xl font-semibold tracking-tight text-slate-900">Good morning, team.</h1>
        <p className="mt-1 text-sm text-slate-500">A live view of your support queue and AI investigations.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {TILES.map(({ key, label, icon: Icon, tone, accent }) => (
          <div key={key} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(29,48,56,0.04)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(29,48,56,0.08)]">
            <div className="flex items-center justify-between">
              <span className={`grid size-9 place-items-center rounded-xl ${accent}`}><Icon className={`size-4 ${tone}`} /></span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Live</span>
            </div>
            <p className="mt-5 text-3xl font-semibold tabular-nums text-slate-900">
              {isLoading ? <span className="inline-block h-8 w-12 animate-pulse rounded-lg bg-slate-100" /> : value(key)}
            </p>
            <p className="mt-1 text-xs text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(29,48,56,0.04)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div><h2 className="display-font text-base font-semibold text-slate-900">Recent tickets</h2><p className="mt-0.5 text-xs text-slate-500">The latest activity across your queue.</p></div>
          <Link to="/tickets" className="text-sm font-semibold text-teal-700 hover:text-teal-800">View all <span aria-hidden="true">→</span></Link>
        </div>

        {!tickets ? (
          <div className="space-y-3 p-5">{[1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-slate-50" />)}</div>
        ) : !tickets.length ? (
          <div className="grid place-items-center px-6 py-16 text-sm text-slate-500">No tickets yet.</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {tickets.slice(0, 6).map((t) => (
              <li key={t.id}>
                <Link
                  to={`/tickets/${t.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[#f7fbfa]"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{t.subject}</p>
                    <p className="truncate text-xs text-slate-500">{t.customer_email}</p>
                  </div>
                  <StatusBadge status={t.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}