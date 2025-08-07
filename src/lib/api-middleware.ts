import { NextRequest, NextResponse } from 'next/server'
import { withCache, invalidateCache, createCachedResponse } from './api-cache'
import { z } from 'zod'

// Request validation schemas
const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(1000).default(10),
})

const searchSchema = z.object({
  q: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Error response helper
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: unknown
): NextResponse {
  const response: Record<string, unknown> = {
    error: message,
    status,
    timestamp: new Date().toISOString(),
  }
  
  if (details) {
    response.details = details
  }
  
  return NextResponse.json(response, { status })
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  options?: {
    message?: string
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
    cache?: {
      maxAge?: number
      staleWhileRevalidate?: number
      mustRevalidate?: boolean
    }
  }
): NextResponse {
  const response = {
    data,
    success: true,
    timestamp: new Date().toISOString(),
    ...(options?.message && { message: options.message }),
    ...(options?.pagination && { pagination: options.pagination }),
  }

  if (options?.cache) {
    return createCachedResponse(response, options.cache)
  }

  return NextResponse.json(response)
}

// Request validation middleware
export function withValidation<T extends z.ZodSchema>(
  schema: T,
  handler: (
    request: NextRequest,
    validatedData: z.infer<T>,
    ...args: unknown[]
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    try {
      let data: unknown

      if (request.method === 'GET') {
        // Parse query parameters for GET requests
        const url = new URL(request.url)
        data = Object.fromEntries(url.searchParams.entries())
      } else {
        // Parse JSON body for other methods
        try {
          data = await request.json()
        } catch {
          return createErrorResponse('Invalid JSON in request body', 400)
        }
      }

      const validatedData = schema.parse(data)
      return handler(request, validatedData, ...args)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse(
          'Validation failed',
          400,
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          }))
        )
      }

      console.error('Validation middleware error:', error)
      return createErrorResponse('Internal server error', 500)
    }
  }
}

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  maxRequests: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return function (
    handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      const now = Date.now()
      const windowStart = now - windowMs

      // Clean up old entries
      for (const [key, value] of rateLimitMap.entries()) {
        if (value.resetTime < windowStart) {
          rateLimitMap.delete(key)
        }
      }

      const clientData = rateLimitMap.get(clientIp)
      
      if (!clientData) {
        rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs })
      } else if (clientData.count >= maxRequests) {
        return createErrorResponse(
          'Too many requests',
          429,
          {
            retryAfter: Math.ceil((clientData.resetTime - now) / 1000),
            limit: maxRequests,
            window: windowMs / 1000,
          }
        )
      } else {
        clientData.count++
      }

      const response = await handler(request, ...args)
      
      // Add rate limit headers
      const remaining = Math.max(0, maxRequests - (clientData?.count || 1))
      response.headers.set('X-RateLimit-Limit', maxRequests.toString())
      response.headers.set('X-RateLimit-Remaining', remaining.toString())
      response.headers.set('X-RateLimit-Reset', Math.ceil((clientData?.resetTime || now + windowMs) / 1000).toString())

      return response
    }
  }
}

// CORS middleware
export function withCors(
  options: {
    origin?: string | string[]
    methods?: string[]
    allowedHeaders?: string[]
    credentials?: boolean
  } = {}
) {
  const {
    origin = '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials = false,
  } = options

  return function (
    handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  ) {
    return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
          status: 200,
          headers: {
            'Access-Control-Allow-Origin': Array.isArray(origin) ? origin.join(', ') : origin,
            'Access-Control-Allow-Methods': methods.join(', '),
            'Access-Control-Allow-Headers': allowedHeaders.join(', '),
            'Access-Control-Max-Age': '86400',
            ...(credentials && { 'Access-Control-Allow-Credentials': 'true' }),
          },
        })
      }

      const response = await handler(request, ...args)

      // Add CORS headers to response
      response.headers.set('Access-Control-Allow-Origin', Array.isArray(origin) ? origin.join(', ') : origin)
      if (credentials) {
        response.headers.set('Access-Control-Allow-Credentials', 'true')
      }

      return response
    }
  }
}

// Error handling middleware
export function withErrorHandling(
  handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: unknown[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof Error) {
        // Handle known error types
        if (error.message.includes('not found')) {
          return createErrorResponse('Resource not found', 404)
        }
        if (error.message.includes('unauthorized')) {
          return createErrorResponse('Unauthorized', 401)
        }
        if (error.message.includes('forbidden')) {
          return createErrorResponse('Forbidden', 403)
        }
      }

      return createErrorResponse('Internal server error', 500)
    }
  }
}

// Compose multiple middlewares
export function compose(
  ...middlewares: Array<
    (handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>) => 
    (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  >
) {
  return function (
    handler: (request: NextRequest, ...args: unknown[]) => Promise<NextResponse>
  ) {
    return middlewares.reduceRight(
      (acc, middleware) => middleware(acc),
      handler
    )
  }
}

// Cache invalidation helpers
export function invalidatePetCache(petId?: string): void {
  if (petId) {
    invalidateCache(['/api/ho-so-thu', `/api/ho-so-thu/${petId}`])
  } else {
    invalidateCache('/api/ho-so-thu')
  }
}

export function invalidateScheduleCache(scheduleId?: string): void {
  if (scheduleId) {
    invalidateCache(['/api/lich-kham', `/api/lich-kham/${scheduleId}`])
  } else {
    invalidateCache('/api/lich-kham')
  }
}

export function invalidateCustomerCache(customerId?: string): void {
  if (customerId) {
    invalidateCache(['/api/khach-hang', `/api/khach-hang/${customerId}`])
  } else {
    invalidateCache('/api/khach-hang')
  }
}

// Common validation schemas
export const commonSchemas = {
  pagination: paginationSchema,
  search: searchSchema,
  id: z.object({ id: z.string().min(1) }),
  petId: z.object({ maHoSo: z.string().min(1) }),
  customerId: z.object({ maKhachHang: z.string().min(1) }),
}

// Pre-configured middleware combinations
export const apiMiddleware = {
  // For GET endpoints with caching
  cached: compose(
    withErrorHandling,
    withCors(),
    withRateLimit(200, 15 * 60 * 1000), // 200 requests per 15 minutes
    withCache
  ),
  
  // For mutation endpoints (POST, PUT, DELETE)
  mutation: compose(
    withErrorHandling,
    withCors(),
    withRateLimit(50, 15 * 60 * 1000) // 50 requests per 15 minutes
  ),
  
  // For public endpoints
  public: compose(
    withErrorHandling,
    withCors(),
    withRateLimit(500, 15 * 60 * 1000) // 500 requests per 15 minutes
  ),
}