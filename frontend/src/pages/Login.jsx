import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import api, { auth } from '../api/axios'

export default function Login() {
  const [email, setEmail] = useState('admin@shop.io')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      auth.set(data.access_token)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="absolute -right-24 -top-24 size-80 rounded-full bg-teal-100/70 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 size-96 rounded-full bg-orange-100/60 blur-3xl" />
      <div className="page-enter relative w-full max-w-md rounded-3xl border border-white/80 bg-white/90 p-8 shadow-[0_24px_80px_rgba(29,48,56,0.12)] backdrop-blur sm:p-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-slate-900 text-teal-300 shadow-lg shadow-slate-900/15">
            <Sparkles className="size-5" />
          </span>
          <div>
            <h1 className="display-font text-lg font-semibold text-slate-900">Support Console</h1>
            <p className="text-xs text-slate-500">The calm center of your support operation.</p>
          </div>
        </div>

        <div className="mb-7"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Welcome back</p><h2 className="display-font text-3xl font-semibold tracking-tight text-slate-900">Resolve with clarity.</h2><p className="mt-2 text-sm leading-6 text-slate-500">Sign in to review live customer issues and AI-generated resolutions.</p></div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            />
          </label>
          <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
            />
          </label>

          {error && <p role="alert" className="rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-3.5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-wait disabled:opacity-60"
          >
            {loading && <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />}
            {loading ? 'Signing in...' : 'Sign in'}
            {!loading && <ArrowRight className="size-4" />}
          </button>
        </form>
      </div>
    </div>
  )
}