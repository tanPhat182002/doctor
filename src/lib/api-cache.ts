import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

// Cache configuration
interface CacheConfig {
  ttl: number // Time to live in milliseconds
  max: number // Maximum number of items
}

interface CacheItem<T> {
  data: T
  timestamp: number
  etag: string
}

// Default cache configurations for different endpoints
const CACHE_CONFIGS: Record<string, CacheConfig> = {
  '/api/lich-kham': { ttl: 2 * 60 * 1000, max: 100 }, // 2 minutes
  '/api/ho-so-thu': { ttl: 5 * 60 * 1000, max: 200 }, // 5 minutes
  '/api/khach-hang': { ttl: 5 * 60 * 1000, max: 200 }, // 5 minutes
  '/api/xa': { ttl: 30 * 60 * 1000, max: 50 }, // 30 minutes
  default: { ttl: 5 * 60 * 1000, max: 100 }, // 5 minutes default
}

// Create simple Map caches for different endpoints (temporary replacement for LRU)
const caches = new Map<string, Map<string, CacheItem<unknown>>>()

// Get or create cache for endpoint
function getCache(endpoint: string): Map<string, CacheItem<unknown>> {
  if (!caches.has(endpoint)) {
    caches.set(endpoint, new Map<string, CacheItem<unknown>>())
  }
  return caches.get(endpoint)!
}

// Generate cache key from request
function generateCacheKey(request: NextRequest): string {
  const url = new URL(request.url)
  const searchParams = new URLSearchParams(url.searchParams)
  
  // Sort search params for consistent cache keys
  const sortedParams = Array.from(searchParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
  
  return `${url.pathname}?${sortedParams}`
}

// Generate ETag from data
function generateETag(data: unknown): string {
  const hash = createHash('md5')
    .update(JSON.stringify(data))
    .digest('hex')
  return `"${hash}"`
}

// Check if request has valid cache headers
function hasValidCacheHeaders(request: NextRequest): boolean {
  const cacheControl = request.headers.get('cache-control')
  return !cacheControl?.includes('no-cache') && !cacheControl?.includes('no-store')
}

// API Cache Middleware
export class ApiCache {
  private static instance: ApiCache
  
  static getInstance(): ApiCache {
    if (!ApiCache.instance) {
      ApiCache.instance = new ApiCache()
    }
    return ApiCache.instance
  }
  
  // Get cached response
  get<T>(request: NextRequest): CacheItem<T> | null {
    if (!hasValidCacheHeaders(request)) {
      return null
    }
    
    const url = new URL(request.url)
    const cache = getCache(url.pathname)
    const cacheKey = generateCacheKey(request)
    
    const cached = cache.get(cacheKey)
    if (!cached) {
      return null
    }
    
    // Check if cache is still valid
    const config = CACHE_CONFIGS[url.pathname] || CACHE_CONFIGS.default
    const isExpired = Date.now() - cached.timestamp > config.ttl
    
    if (isExpired) {
      cache.delete(cacheKey)
      return null
    }
    
    return cached as CacheItem<T>
  }
  
  // Set cached response
  set<T>(request: NextRequest, data: T): void {
    if (!hasValidCacheHeaders(request)) {
      return
    }
    
    const url = new URL(request.url)
    const cache = getCache(url.pathname)
    const cacheKey = generateCacheKey(request)
    
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      etag: generateETag(data),
    }
    
    cache.set(cacheKey, cacheItem)
  }
  
  // Invalidate cache for specific patterns
  invalidate(pattern: string): void {
    for (const [endpoint, cache] of caches.entries()) {
      if (endpoint.includes(pattern)) {
        cache.clear()
      }
    }
  }
  
  // Invalidate specific cache key
  invalidateKey(request: NextRequest): void {
    const url = new URL(request.url)
    const cache = getCache(url.pathname)
    const cacheKey = generateCacheKey(request)
    cache.delete(cacheKey)
  }
  
  // Clear all caches
  clearAll(): void {
    for (const cache of caches.values()) {
      cache.clear()
    }
  }
  
  // Get cache statistics
  getStats(): Record<string, { size: number; max: number }> {
    const stats: Record<string, { size: number; max: number }> = {}
    
    for (const [endpoint, cache] of caches.entries()) {
      const config = CACHE_CONFIGS[endpoint] || CACHE_CONFIGS.default
      stats[endpoint] = {
        size: cache.size,
        max: config.max,
      }
    }
    
    return stats
  }
}

// Cache decorator for API routes
export function withCache(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>,
  options?: { ttl?: number; skipCache?: boolean }
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    const cache = ApiCache.getInstance()
    
    // Skip cache for non-GET requests or if explicitly disabled
    if (request.method !== 'GET' || options?.skipCache) {
      return handler(request, ...args)
    }
    
    // Check cache first
    const cached = cache.get<unknown>(request)
    if (cached) {
      // Check ETag for conditional requests
      const ifNoneMatch = request.headers.get('if-none-match')
      if (ifNoneMatch === cached.etag) {
        return new NextResponse(null, { status: 304 })
      }
      
      return NextResponse.json(cached.data, {
        headers: {
          'ETag': cached.etag,
          'Cache-Control': 'public, max-age=300', // 5 minutes
          'X-Cache': 'HIT',
        },
      })
    }
    
    // Execute handler and cache result
    const response = await handler(request, ...args)
    
    // Only cache successful responses
    if (response.status === 200) {
      try {
        const data = await response.clone().json()
        cache.set(request, data)
        
        // Add cache headers to response
        const etag = generateETag(data)
        response.headers.set('ETag', etag)
        response.headers.set('Cache-Control', 'public, max-age=300')
        response.headers.set('X-Cache', 'MISS')
      } catch (error) {
        // If response is not JSON, don't cache
        console.warn('Failed to cache non-JSON response:', error)
      }
    }
    
    return response
  }
}

// Cache invalidation helper
export function invalidateCache(patterns: string | string[]): void {
  const cache = ApiCache.getInstance()
  const patternsArray = Array.isArray(patterns) ? patterns : [patterns]
  
  for (const pattern of patternsArray) {
    cache.invalidate(pattern)
  }
}

// Conditional request helper
export function handleConditionalRequest(
  request: NextRequest,
  data: unknown
): NextResponse | null {
  const etag = generateETag(data)
  const ifNoneMatch = request.headers.get('if-none-match')
  
  if (ifNoneMatch === etag) {
    return new NextResponse(null, { 
      status: 304,
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=300',
      },
    })
  }
  
  return null
}

// Response compression helper
export function createCachedResponse(
  data: unknown,
  options?: {
    maxAge?: number
    staleWhileRevalidate?: number
    mustRevalidate?: boolean
  }
): NextResponse {
  const etag = generateETag(data)
  const maxAge = options?.maxAge || 300 // 5 minutes default
  const swr = options?.staleWhileRevalidate || 600 // 10 minutes default
  const mustRevalidate = options?.mustRevalidate || false
  
  let cacheControl = `public, max-age=${maxAge}, s-maxage=${maxAge}`
  
  if (swr) {
    cacheControl += `, stale-while-revalidate=${swr}`
  }
  
  if (mustRevalidate) {
    cacheControl += ', must-revalidate'
  }
  
  return NextResponse.json(data, {
    headers: {
      'ETag': etag,
      'Cache-Control': cacheControl,
      'Vary': 'Accept-Encoding',
      'X-Cache': 'FRESH',
    },
  })
}