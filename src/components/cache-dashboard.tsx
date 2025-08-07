'use client'

import { useState, useEffect } from 'react'
import { useCacheManagement, type CacheStats } from '@/hooks/use-cache-management'
import { useServiceWorker } from '@/components/service-worker-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  Trash2, 
  Database, 
  Activity, 
  Wifi, 
  WifiOff,
  BarChart3,
  Clock,
  HardDrive
} from 'lucide-react'

export function CacheDashboard() {
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { isOnline, clearCache: clearServiceWorkerCache } = useServiceWorker()
  
  const {
    getCacheStats,
    clearAllCache,
    clearStaleCache,
    refreshAllQueries,
  } = useCacheManagement()

  // Update cache stats periodically
  useEffect(() => {
    const updateStats = () => {
      const stats = getCacheStats()
      setCacheStats(stats)
    }

    updateStats()
    const interval = setInterval(updateStats, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [getCacheStats])

  const handleRefreshAll = async () => {
    setIsRefreshing(true)
    try {
      await refreshAllQueries()
      // Update stats after refresh
      setTimeout(() => {
        const stats = getCacheStats()
        setCacheStats(stats)
        setIsRefreshing(false)
      }, 1000)
    } catch (error) {
      console.error('Error refreshing queries:', error)
      setIsRefreshing(false)
    }
  }

  const handleClearAll = () => {
    clearAllCache()
    clearServiceWorkerCache()
    const stats = getCacheStats()
    setCacheStats(stats)
  }

  const handleClearStale = () => {
    clearStaleCache()
    const stats = getCacheStats()
    setCacheStats(stats)
  }

  if (!cacheStats) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cache Dashboard</h2>
          <p className="text-muted-foreground">
            Quản lý và giám sát hiệu suất cache của ứng dụng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isOnline ? 'default' : 'destructive'} className="flex items-center gap-1">
            {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Queries</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.totalQueries}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số queries trong cache
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stale Queries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.staleQueries}</div>
            <p className="text-xs text-muted-foreground">
              Queries cần được làm mới
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hit Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.hitRate}%</div>
            <p className="text-xs text-muted-foreground">
              Tỷ lệ cache hit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Size</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheStats.cacheSize}</div>
            <p className="text-xs text-muted-foreground">
              Dung lượng cache hiện tại
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Cache Actions</CardTitle>
          <p className="text-sm text-muted-foreground">
            Các thao tác quản lý cache chung
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-4">
            <Button
              onClick={handleRefreshAll}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh All
            </Button>
            
            <Button
              onClick={handleClearStale}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Clock className="h-4 w-4" />
              Clear Stale
            </Button>
            
            <Button
              onClick={handleClearAll}
              variant="destructive"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All
            </Button>
            
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={() => {
                const stats = getCacheStats()
                setCacheStats(stats)
              }}
            >
              <Activity className="h-4 w-4" />
              Update Stats
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm space-y-1">
            <p>• <strong>Hit Rate tốt:</strong> {'>'}80% - Cache đang hoạt động hiệu quả</p>
            <p>• <strong>Stale Queries:</strong> Nên {'<'}20% tổng queries để đảm bảo dữ liệu mới</p>
            <p>• <strong>Cache Size:</strong> Giữ dưới 50MB để tránh ảnh hưởng hiệu suất</p>
            <p>• <strong>Refresh All:</strong> Làm mới toàn bộ dữ liệu từ server</p>
            <p>• <strong>Clear Stale:</strong> Xóa chỉ những cache đã cũ</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}