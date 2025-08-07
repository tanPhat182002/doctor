'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'
import { useState, useEffect } from 'react'
import { getQueryClient, performanceUtils, backgroundSync } from '@/lib/query-client'


export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => getQueryClient())

  useEffect(() => {
    // Setup performance monitoring
    performanceUtils.logSlowQueries(queryClient)
    
    // Setup background sync
    backgroundSync.setupBackgroundRefresh(queryClient)
    backgroundSync.setupOnlineSync(queryClient)
    
    // Log cache stats in development
    if (process.env.NODE_ENV === 'development') {
      const logStats = () => {
        const stats = performanceUtils.getCacheStats(queryClient)
        console.log('React Query Cache Stats:', stats)
      }
      
      // Log stats every 30 seconds in development
      const interval = setInterval(logStats, 30000)
      
      return () => clearInterval(interval)
    }
  }, [queryClient])

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <ReactQueryDevtools 
          initialIsOpen={false} 
          buttonPosition="bottom-left"
          position="left"
        />
        <Toaster 
          position="top-right" 
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

      </QueryClientProvider>
    </SessionProvider>
  )
}