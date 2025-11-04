import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'
export const runtime ='nodejs'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  const { pathname } = request.nextUrl

  // Public routes - Exact match only
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // Protected routes untuk user biasa
  const userRoutes = ['/booking', '/profile', '/history']
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
      
      const decoded = jwt.verify(token.value, jwtSecret) as {
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
      // Token invalid
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('auth-token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}