import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import StatusBadge from '../components/StatusBadge'

const STATUSES = ['', 'open', 'failed', 'investigating', 'awaiting_approval', 'executing', 'resolved', 'rejected']

export default function Tickets() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')

  const { data: tickets, isLoading } = useQuery({
    queryKey: ['tickets', status, q],
    queryFn: () => {
      const params = new URLSearchParams()
      if (status) params.append('status', status)
      if (q) params.append('q', q)
      return api.get(`/tickets?${params}`).then(r => r.data)
    },
    refetchInterval: 5000,
  })

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Queue management</p>
          <h1 className="display-font text-3xl font-semibold tracking-tight text-slate-900">Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">Manage customer issues and move investigations forward.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="search"
            placeholder="Search subject or email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm capitalize outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s ? s.replace(/_/g, ' ') : 'All statuses'}</option>
            ))}
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(29,48,56,0.04)]">
        {isLoading ? (
          <div className="grid place-items-center px-6 py-16">
            <div className="w-full space-y-3 p-5">{[1, 2, 3, 4].map((item) => <div key={item} className="h-12 animate-pulse rounded-xl bg-slate-50" />)}</div>
          </div>
        ) : !tickets?.length ? (
          <div className="grid place-items-center px-6 py-16 text-sm text-slate-500">No tickets found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-[#f7fbfa] text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                <tr>
                  <th className="px-5 py-3">Subject</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Order</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id} className="transition hover:bg-[#f7fbfa]">
                    <td className="px-5 py-3">
                      <Link to={`/tickets/${t.id}`} className="font-semibold text-slate-800 hover:text-teal-700">
                        {t.subject}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{t.customer_email}</td>
                    <td className="px-5 py-3 text-slate-600">{t.order_ref || '—'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}