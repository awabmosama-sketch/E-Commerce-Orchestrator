import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import LoadingBar from './LoadingBar'

export default function Layout() {
  const location = useLocation()

  return (
    <div className="min-h-screen">
      <LoadingBar />
      <Navbar />
      <main className="lg:pl-60">
        <div className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}