export default function Settings() {
  return (
    <div className="space-y-7">
      <header>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Workspace</p>
        <h1 className="display-font text-3xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Your workspace configuration and service status.</p>
      </header>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(29,48,56,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Environment</p>
          <h2 className="display-font mt-2 text-lg font-semibold text-slate-900">Support workspace</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">AI investigation and approval workflows are connected to this workspace.</p>
          <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-emerald-700"><span className="size-2 rounded-full bg-emerald-500" /> Services operational</div>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(29,48,56,0.04)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Access</p>
          <h2 className="display-font mt-2 text-lg font-semibold text-slate-900">Review permissions</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">Actions are recorded against your support identity before they reach the commerce service.</p>
          <div className="mt-5 inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">Approval controls enabled</div>
        </div>
      </div>
    </div>
  )
}