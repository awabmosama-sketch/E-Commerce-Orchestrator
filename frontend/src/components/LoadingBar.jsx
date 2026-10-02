import { useIsFetching, useIsMutating } from '@tanstack/react-query'

export default function LoadingBar() {
  const active = useIsFetching() + useIsMutating() > 0

  return (
    <div className={`pointer-events-none fixed inset-x-0 top-0 z-50 h-0.5 overflow-hidden bg-transparent transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}>
      <div className="loading-bar h-full w-1/2 bg-teal-500 shadow-[0_0_12px_rgba(20,184,166,0.8)]" />
    </div>
  )
}