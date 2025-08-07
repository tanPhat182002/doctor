import { DesktopNav } from '@/components/layout/desktop-nav'
import { MobileNav } from '@/components/layout/mobile-nav'
import { Header } from '@/components/layout/header'
import { PageTransition } from '@/components/layout/page-transition'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100/50">
      {/* Desktop Navigation */}
      <div className="hidden lg:block">
        <DesktopNav />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content with Page Transitions */}
      <main className="lg:ml-64 relative overflow-hidden">
        <div className="container mx-auto px-4 py-6 pb-20 lg:pb-6">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
      </main>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}