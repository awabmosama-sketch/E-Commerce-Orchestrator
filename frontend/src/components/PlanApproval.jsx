import DisplayValue from './DisplayValue'

export default function PlanApproval({ investigation, onDecision }) {
  const { plan, findings, result } = investigation

  return (
    <div className="space-y-5">
      {findings?.error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800">
          <p className="font-semibold">Investigation could not be completed</p>
          <p className="mt-1 whitespace-pre-wrap leading-6">{findings.error}</p>
        </div>
      )}
      <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-[0_8px_30px_rgba(29,48,56,0.04)]">
        <div className="mb-5 flex items-start justify-between gap-4"><div><p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">AI investigation</p><h2 className="display-font text-lg font-semibold text-slate-900">Recommended resolution</h2></div><span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">{(investigation.confidence * 100).toFixed(0)}% confidence</span></div>
        <div className="space-y-3 text-sm">
          <p className="leading-6 text-slate-700"><span className="font-semibold text-slate-900">Root cause:</span> <DisplayValue value={investigation.root_cause} /></p>
          <div>
            <p className="mb-2 font-semibold text-slate-900">Plan steps:</p>
            <ul className="space-y-2 text-slate-600">
              {plan?.steps?.map((step, i) => <li key={i} className="flex gap-2"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal-50 text-[11px] font-bold text-teal-700">{i + 1}</span><span><DisplayValue value={step} /></span></li>)}
            </ul>
          </div>
          <p><span className="font-semibold text-slate-900">Action:</span> <span className="capitalize text-slate-600"><DisplayValue value={plan?.action?.replace(/_/g, ' ')} /></span></p>
          <p className="border-t border-slate-100 pt-3 leading-6"><span className="font-semibold text-slate-900">Customer reply:</span> <span className="text-slate-600"><DisplayValue value={plan?.customer_reply} /></span></p>
        </div>
      </div>

      {findings?.db && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(29,48,56,0.04)]">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">DB evidence</h2>
          <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-600"><DisplayValue value={findings.db} /></pre>
        </div>
      )}

      {findings?.logs && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(29,48,56,0.04)]">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Log evidence</h2>
          <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-600"><DisplayValue value={findings.logs} /></pre>
        </div>
      )}

      {result && (result.status || result.error) && (
        <div className={`rounded-2xl border p-5 shadow-[0_8px_30px_rgba(29,48,56,0.04)] ${result.error ? 'border-rose-200 bg-rose-50/70' : 'border-slate-200/80 bg-white'}`}>
          <h2 className={`mb-2 text-sm font-semibold ${result.error ? 'text-rose-800' : 'text-slate-900'}`}>{result.error ? 'Action could not be completed' : 'Execution result'}</h2>
          <pre className={`whitespace-pre-wrap text-xs leading-6 ${result.error ? 'text-rose-700' : 'text-slate-600'}`}><DisplayValue value={result.error || result} /></pre>
        </div>
      )}

      {onDecision.error && (
        <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {onDecision.error.response?.data?.detail || 'The action could not be submitted. Please try again.'}
        </p>
      )}

      {(investigation.approved_by === null || result?.error) && plan?.action !== 'none' && (
        <div className="flex flex-wrap gap-3 rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
          <button
            onClick={() => onDecision.mutate('approve')}
            disabled={onDecision.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-50"
          >
            {onDecision.isPending ? 'Processing...' : 'Approve action'}
          </button>
          <button
            onClick={() => onDecision.mutate('reject')}
            disabled={onDecision.isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-wait disabled:opacity-50"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}