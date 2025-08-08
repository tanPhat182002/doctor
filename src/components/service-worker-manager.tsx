'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'

interface ServiceWorkerState {
  isSupported: boolean
  isRegistered: boolean
  isOnline: boolean
  cacheSize: number
  updateAvailable: boolean
}

export function ServiceWorkerManager() {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isSupported: false,
    isRegistered: false,
    isOnline: true,
    cacheSize: 0,
    updateAvailable: false,
  })

  const getCacheSize = useCallback(() => {
    console.log('getCacheSize called, controller:', navigator.serviceWorker.controller)
    if (navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        console.log('Received cache size response:', event.data)
        if (event.data && event.data.cacheSize !== undefined) {
          setSwState(prev => ({ ...prev, cacheSize: event.data.cacheSize }))
        }
      }
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      )
    } else {
      console.log('No service worker controller available')
    }
  }, [])

  const checkStorageQuota = useCallback(() => {
    console.log('checkStorageQuota called')
    if (navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        console.log('Received storage quota response:', event.data)
        if (event.data && event.data.storageEstimate) {
          const estimate = event.data.storageEstimate
          const usedMB = Math.round((estimate.usage || 0) / 1024 / 1024)
          const quotaMB = Math.round((estimate.quota || 0) / 1024 / 1024)
          console.log(`Storage: ${usedMB}MB / ${quotaMB}MB`)
        }
      }
      navigator.serviceWorker.controller.postMessage(
        { type: 'CHECK_STORAGE_QUOTA' },
        [messageChannel.port2]
      )
    }
  }, [])

  const requestPersistentStorage = useCallback(() => {
    console.log('requestPersistentStorage called')
    if (navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        console.log('Received persistent storage response:', event.data)
        if (event.data && event.data.persistentStorage !== undefined) {
          console.log('Persistent storage granted:', event.data.persistentStorage)
        }
      }
      navigator.serviceWorker.controller.postMessage(
        { type: 'REQUEST_PERSISTENT_STORAGE' },
        [messageChannel.port2]
      )
    }
  }, [])

  const updateServiceWorker = useCallback(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [])

  const showUpdateNotification = useCallback(() => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <div className="font-medium">Có phiên bản mới!</div>
          <div className="text-sm text-gray-600">
            Cập nhật ứng dụng để có trải nghiệm tốt nhất
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                updateServiceWorker()
                toast.dismiss(t.id)
              }}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
            >
              Cập nhật
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Để sau
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
        position: 'bottom-center',
      }
    )
  }, [updateServiceWorker])

  const registerServiceWorker = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      })

      setSwState(prev => ({ ...prev, isRegistered: true }))

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setSwState(prev => ({ ...prev, updateAvailable: true }))
              showUpdateNotification()
            }
          })
        }
      })

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.cacheSize) {
          setSwState(prev => ({ ...prev, cacheSize: event.data.cacheSize }))
        }
      })

      // Get initial cache size
      getCacheSize()

      console.log('Service Worker registered successfully')
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      toast.error('Không thể kích hoạt chế độ offline')
    }
  }, [getCacheSize, showUpdateNotification])

  useEffect(() => {
    // Check if service workers are supported
    if ('serviceWorker' in navigator) {
      setSwState(prev => ({ ...prev, isSupported: true }))
      registerServiceWorker()
      
      // Get initial cache size and check storage quota
      setTimeout(() => {
        getCacheSize()
        checkStorageQuota()
        requestPersistentStorage() // Request persistent storage for mobile
      }, 1000)
    }

    // Listen for online/offline events
    const handleOnline = () => {
      setSwState(prev => ({ ...prev, isOnline: true }))
      toast.success('Đã kết nối lại internet')
    }

    const handleOffline = () => {
      setSwState(prev => ({ ...prev, isOnline: false }))
      toast.error('Mất kết nối internet - Ứng dụng sẽ hoạt động offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Check initial online status
    setSwState(prev => ({ ...prev, isOnline: navigator.onLine }))

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [registerServiceWorker, getCacheSize, checkStorageQuota, requestPersistentStorage])

  const clearCache = async () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
      setSwState(prev => ({ ...prev, cacheSize: 0 }))
      toast.success('Đã xóa cache thành công')
    }
  }



  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Only show in development or when there are cache management needs
  if (process.env.NODE_ENV !== 'development' && swState.cacheSize === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Online/Offline Indicator */}
      <div className="mb-2">
        <div
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            swState.isOnline
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          <div
            className={`w-2 h-2 rounded-full mr-1 ${
              swState.isOnline ? 'bg-green-400' : 'bg-red-400'
            }`}
          />
          {swState.isOnline ? 'Online' : 'Offline'}
        </div>
      </div>

      {/* Cache Management (Development only) */}
      {process.env.NODE_ENV === 'development' && swState.isRegistered && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
          <div className="font-medium mb-2">Service Worker</div>
          
          <div className="space-y-1 text-xs text-gray-600">
            <div>Status: {swState.isRegistered ? 'Active' : 'Inactive'}</div>
            <div>Cache: {formatBytes(swState.cacheSize)}</div>
            {swState.updateAvailable && (
              <div className="text-blue-600">Update available</div>
            )}
          </div>

          <div className="flex gap-1 mt-2">
            <button
              onClick={getCacheSize}
              className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs hover:bg-blue-100"
            >
              Refresh
            </button>
            <button
              onClick={clearCache}
              className="px-2 py-1 bg-red-50 text-red-600 rounded text-xs hover:bg-red-100"
            >
              Clear
            </button>
            {swState.updateAvailable && (
              <button
                onClick={updateServiceWorker}
                className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs hover:bg-green-100"
              >
                Update
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for using service worker state in other components
export function useServiceWorker() {
  const [isOnline, setIsOnline] = useState(true)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator)
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const clearCache = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
    }
  }

  const forceUpdate = () => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }

  return {
    isOnline,
    isSupported,
    clearCache,
    forceUpdate,
  }
}