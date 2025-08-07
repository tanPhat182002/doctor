import { CacheDashboard } from '@/components/cache-dashboard'

export default function CachePage() {
  return (
    <div className="container mx-auto py-6">
      <CacheDashboard />
    </div>
  )
}

export const metadata = {
  title: 'Cache Management - Pet Management System',
  description: 'Quản lý và giám sát hiệu suất cache của ứng dụng',
}