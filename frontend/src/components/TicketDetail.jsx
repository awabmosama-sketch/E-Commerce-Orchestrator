import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import OperationProgress from './OperationProgress'
import PlanApproval from './PlanApproval'
import StatusBadge from './StatusBadge'

export default function TicketDetail({ ticket }) {
  const queryClient = useQueryClient()
  const [investigationStarted, setInvestigationStarted] = useState(false)

  useEffect(() => {
    if (ticket.status === 'open' && ticket.investigation) {
      setInvestigationStarted(false)
    }
  }, [ticket.status, ticket.investigation])

  const investigate = useMutation({
    mutationFn: () => {
      setInvestigationStarted(true)
      return api.post(`/tickets/${ticket.id}/investigate`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
    onError: () => setInvestigationStarted(false),
  })

  const decide = useMutation({
    mutationFn: (action) => api.post(`/tickets/${ticket.id}/${action}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })

  const inv = ticket.investigation

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Ticket #{ticket.id}</p>
          <h1 className="display-font text-3xl font-semibold tracking-tight text-slate-900">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {ticket.customer_email} · Order {ticket.order_ref || '—'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          {['open', 'failed'].includes(ticket.status) && (
            <button
              onClick={() => investigate.mutate()}
              disabled={investigate.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"
            >
              {investigate.isPending && <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
              {investigate.isPending ? 'Starting investigation...' : ticket.status === 'failed' ? 'Retry investigation' : 'Investigate via AI'}
            </button>
          )}
        </div>
      </header>

      <OperationProgress status={investigationStarted || investigate.isPending ? (ticket.status === 'open' ? 'investigating' : ticket.status) : ticket.status} />

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(29,48,56,0.04)]">
        <div className="mb-4 flex items-center justify-between"><h2 className="display-font text-base font-semibold text-slate-900">Customer complaint</h2><span className="text-xs text-slate-400">Received {new Date(ticket.created_at).toLocaleDateString()}</span></div>
        <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-slate-600">{ticket.body}</p>
      </div>

      {inv && <PlanApproval investigation={inv} onDecision={decide} />}
    </div>
  )
}