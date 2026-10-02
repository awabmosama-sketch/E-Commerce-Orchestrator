const PHASES = [
  { key: 'investigating', label: 'Investigation started', detail: 'Analysts are reviewing the ticket evidence.' },
  { key: 'awaiting_approval', label: 'Plan ready for review', detail: 'The AI recommendation is ready for your approval.' },
  { key: 'executing', label: 'Action in progress', detail: 'The approved action is being sent to the commerce service.' },
]

const ACTIVE_PHASE = {
  investigating: 0,
  awaiting_approval: 1,
  executing: 2,
}

export default function OperationProgress({ status }) {
  const activeIndex = ACTIVE_PHASE[status]
  if (activeIndex === undefined) return null

  return (
    <section className="rounded-2xl border border-teal-100 bg-[#f2fbf8] p-5" aria-live="polite">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-teal-600 text-white shadow-sm shadow-teal-600/20">
          <span className="size-3 animate-pulse rounded-full bg-white" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Workflow in progress</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">{PHASES[activeIndex].label}</p>
          <p className="mt-1 text-sm text-slate-600">{PHASES[activeIndex].detail}</p>
        </div>
      </div>

      <ol className="mt-5 grid grid-cols-3 gap-2">
        {PHASES.map((phase, index) => (
          <li key={phase.key} className="relative pr-2">
            {index < PHASES.length - 1 && <span className={`absolute left-6 right-0 top-2.5 h-px ${index < activeIndex ? 'bg-teal-500' : 'bg-teal-100'}`} />}
            <div className="relative flex items-start gap-2">
              <span className={`grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${index <= activeIndex ? 'bg-teal-600 text-white' : 'bg-white text-slate-400 ring-1 ring-inset ring-slate-200'}`}>
                {index < activeIndex ? '✓' : index + 1}
              </span>
              <span className={`text-[11px] font-semibold leading-4 ${index <= activeIndex ? 'text-teal-800' : 'text-slate-400'}`}>{phase.label}</span>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
