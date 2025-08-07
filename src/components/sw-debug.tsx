'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ServiceWorkerDebug() {
  const [logs, setLogs] = useState<string[]>([])
  const [isVisible, setIsVisible] = useState(false)

  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      addLog('Service Worker supported')
      
      navigator.serviceWorker.ready.then(registration => {
        addLog(`SW ready: ${registration.scope}`)
        
        if (navigator.serviceWorker.controller) {
          addLog('SW controller available')
        } else {
          addLog('No SW controller')
        }
      })
    } else {
      addLog('Service Worker not supported')
    }
  }, [])

  const testCacheSize = () => {
    addLog('Testing cache size...')
    
    if (navigator.serviceWorker.controller) {
      const messageChannel = new MessageChannel()
      messageChannel.port1.onmessage = (event) => {
        addLog(`Cache size response: ${JSON.stringify(event.data)}`)
      }
      navigator.serviceWorker.controller.postMessage(
        { type: 'GET_CACHE_SIZE' },
        [messageChannel.port2]
      )
    } else {
      addLog('No SW controller for cache test')
    }
  }

  const clearCache = () => {
    addLog('Clearing cache...')
    
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' })
      addLog('Cache clear message sent')
    } else {
      addLog('No SW controller for cache clear')
    }
  }

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-20 right-4 z-50 bg-purple-500 hover:bg-purple-600"
        size="sm"
      >
        SW Debug
      </Button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">SW Debug</h3>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>
      
      <div className="space-y-2 mb-3">
        <Button onClick={testCacheSize} size="sm" className="w-full">
          Test Cache Size
        </Button>
        <Button onClick={clearCache} size="sm" variant="outline" className="w-full">
          Clear Cache
        </Button>
      </div>
      
      <div className="bg-gray-50 rounded p-2 max-h-40 overflow-y-auto">
        <div className="text-xs font-mono space-y-1">
          {logs.map((log, index) => (
            <div key={index} className="text-gray-700">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}