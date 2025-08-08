// Service Worker for Pet Management App
// Provides offline caching and background sync capabilities

const STATIC_CACHE = 'static-v1'
const API_CACHE = 'api-v1'
const IMAGE_CACHE = 'images-v1'

// Storage quota management
const MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB
const CACHE_CLEANUP_THRESHOLD = 0.8 // Clean up when 80% full

// Request persistent storage on mobile
if ('storage' in navigator && 'persist' in navigator.storage) {
  navigator.storage.persist().then(persistent => {
    console.log('Persistent storage:', persistent)
  })
}

// Check storage quota
async function checkStorageQuota() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    const usedPercentage = (estimate.usage || 0) / (estimate.quota || 1)
    
    console.log('Storage usage:', {
      used: Math.round((estimate.usage || 0) / 1024 / 1024) + 'MB',
      quota: Math.round((estimate.quota || 0) / 1024 / 1024) + 'MB',
      percentage: Math.round(usedPercentage * 100) + '%'
    })
    
    // Clean up if approaching quota limit
    if (usedPercentage > CACHE_CLEANUP_THRESHOLD) {
      await cleanupOldCache()
    }
    
    return estimate
  }
  return null
}

// Clean up old cache entries
async function cleanupOldCache() {
  console.log('Cleaning up old cache entries...')
  
  const cacheNames = await caches.keys()
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()
    
    // Remove oldest entries if cache is too large
    if (requests.length > 100) {
      const toDelete = requests.slice(0, requests.length - 50)
      await Promise.all(toDelete.map(request => cache.delete(request)))
    }
  }
}

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/admin',
  '/admin/dashboard',
  
  '/manifest.json',
  '/favicon.ico',
  // Add other critical static resources
]

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/lich-kham',
  '/api/ho-so-thu',
  '/api/khach-hang',
  '/api/xa',
  '/api/huyen',
  '/api/tinh',
  '/api/lich-tai-kham',
  '/api/dashboard',
  '/api/stats',
]

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_RESOURCES)
      }),
      caches.open(API_CACHE),
      caches.open(IMAGE_CACHE),
      checkStorageQuota(), // Check storage quota on install
    ])
  )
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches
          if (cacheName !== STATIC_CACHE && 
              cacheName !== API_CACHE && 
              cacheName !== IMAGE_CACHE) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  
  // Take control of all pages
  self.clients.claim()
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip unsupported schemes (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First with Cache Fallback for better offline support
    event.respondWith(handleApiRequestNetworkFirst(request))
  } else if (isImageRequest(request)) {
    // Images - Cache First
    event.respondWith(handleImageRequest(request))
  } else if (isStaticResource(request)) {
    // Static resources - Stale While Revalidate
    event.respondWith(handleStaticRequest(request))
  } else {
    // Other requests - Network First
    event.respondWith(handleNetworkFirst(request))
  }
})

// Handle API requests with Network First strategy for better offline support
async function handleApiRequestNetworkFirst(request) {
  const url = new URL(request.url)
  
  // Check if this API should be cached
  const shouldCache = CACHEABLE_APIS.some(api => url.pathname.startsWith(api))
  
  if (!shouldCache) {
    return fetch(request)
  }
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE)
      const responseToCache = networkResponse.clone()
      
      // Add cache timestamp
      const headers = new Headers(responseToCache.headers)
      headers.set('sw-cache-date', new Date().toISOString())
      
      const modifiedResponse = new Response(responseToCache.body, {
        status: responseToCache.status,
        statusText: responseToCache.statusText,
        headers: headers
      })
      
      cache.put(request, modifiedResponse)
      console.log('Cached API response:', request.url)
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('Network failed, trying cache:', request.url, error)
    
    // If network fails, try to serve from cache
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      console.log('Serving from cache (offline):', request.url)
      return cachedResponse
    }
    
    // Return offline response
    return new Response(
      JSON.stringify({ 
        error: 'Không có kết nối mạng và không có dữ liệu cache', 
        offline: true 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}



// Handle image requests
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('Image request failed:', error)
    // Return placeholder image or cached version
    const cache = await caches.open(IMAGE_CACHE)
    return cache.match(request) || new Response('', { status: 404 })
  }
}

// Handle static resources with Stale While Revalidate
async function handleStaticRequest(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    // Serve from cache immediately if available
    if (cachedResponse) {
      // Update cache in background
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone())
        }
      }).catch(() => {})
      
      return cachedResponse
    }
    
    // If not in cache, fetch from network
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
    
  } catch (error) {
    console.log('Static request failed:', error)
    // Try to serve from cache if network fails
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    return cachedResponse || new Response('Not Found', { status: 404 })
  }
}

// Handle other requests with Network First
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    console.log('Network first request failed:', error)
    // Try to serve from any cache as fallback
    const caches_list = [STATIC_CACHE, API_CACHE, IMAGE_CACHE]
    
    for (const cacheName of caches_list) {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        return cachedResponse
      }
    }
    
    return new Response('Offline', { status: 503 })
  }
}

// Helper functions
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(new URL(request.url).pathname)
}

function isStaticResource(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/_next/') || 
         url.pathname.startsWith('/static/') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.woff') ||
         url.pathname.endsWith('.woff2')
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  console.log('Performing background sync...')
  
  // Get failed requests from IndexedDB and retry them
  // This would require implementing a queue system
  // For now, just log that sync is happening
}

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      },
      actions: [
        {
          action: 'explore',
          title: 'Xem chi tiết',
          icon: '/icon-explore.png'
        },
        {
          action: 'close',
          title: 'Đóng',
          icon: '/icon-close.png'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'explore') {
    // Open the app to relevant page
    event.waitUntil(
      clients.openWindow('/admin/dashboard')
    )
  }
})

// Message handling for cache management
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        )
      })
    )
  }
  
  if (event.data && event.data.type === 'GET_CACHE_SIZE') {
    console.log('SW: Received GET_CACHE_SIZE message')
    event.waitUntil(
      getCacheSize().then((size) => {
        console.log('SW: Calculated cache size:', size)
        event.ports[0].postMessage({ cacheSize: size })
      })
    )
  }
  
  if (event.data && event.data.type === 'CHECK_STORAGE_QUOTA') {
    console.log('SW: Received CHECK_STORAGE_QUOTA message')
    event.waitUntil(
      checkStorageQuota().then((estimate) => {
        console.log('SW: Storage quota check:', estimate)
        event.ports[0].postMessage({ storageEstimate: estimate })
      })
    )
  }
  
  if (event.data && event.data.type === 'REQUEST_PERSISTENT_STORAGE') {
    console.log('SW: Received REQUEST_PERSISTENT_STORAGE message')
    if ('storage' in navigator && 'persist' in navigator.storage) {
      event.waitUntil(
        navigator.storage.persist().then((persistent) => {
          console.log('SW: Persistent storage granted:', persistent)
          event.ports[0].postMessage({ persistentStorage: persistent })
        })
      )
    }
  }
})

// Get total cache size
async function getCacheSize() {
  const cacheNames = await caches.keys()
  let totalSize = 0
  
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName)
    const requests = await cache.keys()
    
    for (const request of requests) {
      const response = await cache.match(request)
      if (response) {
        const blob = await response.blob()
        totalSize += blob.size
      }
    }
  }
  
  // Check if cache size exceeds limit
  if (totalSize > MAX_CACHE_SIZE) {
    console.warn('Cache size exceeded limit:', totalSize, 'bytes')
    await cleanupOldCache()
  }
  
  return totalSize
}