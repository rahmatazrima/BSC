import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')
  const { pathname } = request.nextUrl

  // Public routes yang tidak perlu auth
  const publicRoutes = ['/login', '/register', '/']
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Jika tidak ada token dan bukan public route, redirect ke login
  if (!token && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Jika ada token, verify dan check role
  if (token) {
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      const decoded = jwt.verify(token.value, jwtSecret) as {
        userId: string
        email: string
        role: string
      }

      // Proteksi route admin
      if (pathname.startsWith('/admin') && decoded.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/booking', request.url))
      }

      // Jika sudah login dan mencoba akses halaman login/register
      if (isPublicRoute && pathname !== '/') {
        const redirectUrl = decoded.role === 'ADMIN' ? '/admin/dashboard' : '/booking'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }

    } catch (error) {
      // Token invalid, hapus cookie dan redirect ke login
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