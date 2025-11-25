import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  const { pathname } = request.nextUrl

  // Skip middleware for static files (images, fonts, etc.)
  const staticFileExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot']
  if (staticFileExtensions.some(ext => pathname.toLowerCase().endsWith(ext))) {
    return NextResponse.next()
  }

  // Skip middleware for PWA files (service worker, manifest)
  const pwaFiles = ['/sw.js', '/manifest.json', '/service-worker.js']
  if (pwaFiles.includes(pathname)) {
    return NextResponse.next()
  }

  // Public routes - Exact match only
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Protected routes untuk user biasa
  const userRoutes = ['/booking', '/profile', '/history', '/tracking']
  const isUserRoute = userRoutes.some(route => pathname.startsWith(route))

  // Admin routes
  const adminRoutes = ['/admin']
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // Jika tidak ada token dan bukan public route
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika ada token
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      const secret = new TextEncoder().encode(jwtSecret)
      
      const { payload } = await jwtVerify(token.value, secret)
      
      const decoded = payload as {
        userId: string
        email: string
        role: string
      }

      // ADMIN mencoba akses user route → redirect ke admin
      if (decoded.role === 'ADMIN' && isUserRoute) {
        return NextResponse.redirect(new URL('/admin', request.url))
      }

      // USER mencoba akses admin route → redirect ke booking
      if (decoded.role !== 'ADMIN' && isAdminRoute) {
        return NextResponse.redirect(new URL('/booking', request.url))
      }

      // Sudah login, akses login/register page → redirect sesuai role
      if (pathname === '/login' || pathname === '/register') {
        const redirectUrl = decoded.role === 'ADMIN' ? '/admin' : '/booking'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }

    } catch (error) {
      // Token invalid - hapus cookie dengan semua opsi yang sama
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 0,
        path: '/',
        expires: new Date(0)
      })
      // Set cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      response.headers.set('Pragma', 'no-cache')
      response.headers.set('Expires', '0')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sw.js|manifest.json|service-worker.js|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)',
  ],
}