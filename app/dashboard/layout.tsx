import Link from 'next/link'
import './dashboard-layout.css'

function DashboardNav() {
  return (
    <nav className="dashboard-nav">
      <Link href="/dashboard" className="dashboard-nav-link">
        New Run
      </Link>
      <Link href="/dashboard/runs" className="dashboard-nav-link">
        Run History
      </Link>
    </nav>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-shell">
      <DashboardNav />
      <main className="dashboard-content">{children}</main>
    </div>
  )
}
