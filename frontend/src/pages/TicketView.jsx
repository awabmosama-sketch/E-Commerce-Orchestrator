import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../api/axios'
import TicketDetail from '../components/TicketDetail'

export default function TicketView() {
  const { id } = useParams()
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => api.get(`/tickets/${id}`).then(r => r.data),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      return ['investigating', 'executing'].includes(status) ? 1500 : false
    },
  })

  if (isLoading) {
    return (
      <div className="grid place-items-center py-24">
        <span className="inline-block size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
      </div>
    )
  }

  if (error) {
    return <div className="py-24 text-center text-sm text-rose-600">Failed to load ticket.</div>
  }

  return <TicketDetail ticket={ticket} />
}