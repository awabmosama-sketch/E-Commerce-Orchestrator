import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Inbox, LayoutDashboard, LogOut, Menu, Settings, Sparkles, X } from 'lucide-react'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import api, { auth } from '../api/axios'

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tickets', label: 'Tickets', icon: Inbox, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { data: me } = useQuery({ queryKey: ['me'], queryFn: () => api.get('/auth/me').then(r => r.data) })
  const { data: aiStatus } = useQuery({
    queryKey: ['ai-status'],
    queryFn: () => api.get('/health/ai').then(r => r.data),
    refetchInterval: 30_000,
  })

  const logout = () => {
    auth.clear()
    navigate('/login', { replace: true })
  }

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={() => setOpen(false)}
          className={({ isActive }) =>
            clsx(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
              isActive
                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
            )
          }
        >
          <Icon className="size-4.5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )

  const brand = (
    <div className="flex items-center gap-2.5 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
      <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">
        <Sparkles className="size-4" />
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold">AI Orchestrator</p>
        <p className="text-[11px] text-slate-500">Support Console</p>
      </div>
    </div>
  )

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200/80 bg-[#f8fbfb]/95 lg:flex">
        {brand}
        {nav}
        <div className="border-t border-slate-200/80 p-3">
          <div className="px-3 pb-2">
            <p className="truncate text-sm font-medium">{me?.name || '—'}</p>
            <p className="truncate text-xs text-slate-500">{me?.email}</p>
          </div>
          <div className="mb-2 flex items-center gap-2 px-3 text-xs text-slate-500" title={aiStatus?.message || 'Checking AI status'}>
            <span className={`size-2 rounded-full ${aiStatus?.connected ? 'bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.12)]' : 'bg-rose-500 shadow-[0_0_0_3px_rgba(244,63,94,0.12)]'}`} />
            <span>{aiStatus ? (aiStatus.connected ? 'AI connected' : 'AI unavailable') : 'Checking AI...'}</span>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-white hover:text-slate-900"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-[#f8fbfb] shadow-xl">
            <div className="flex items-center justify-between">
              {brand}
              <button onClick={() => setOpen(false)} className="p-4 text-slate-500">
                <X className="size-5" />
              </button>
            </div>
            {nav}
          </aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/80 bg-[#f8fbfb]/85 px-4 py-3 backdrop-blur lg:hidden">
        <button aria-label="Open navigation" onClick={() => setOpen(true)} className="text-slate-600">
          <Menu className="size-5" />
        </button>
        <span className="text-sm font-semibold">AI Orchestrator</span>
      </header>
    </>
  )
}