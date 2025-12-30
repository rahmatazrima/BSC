import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// POST - Logout user
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    
    // Delete auth token cookie dengan path yang sama seperti saat set
    cookieStore.delete('auth-token');

    // Create response dengan cookie deletion yang eksplisit
    const response = NextResponse.json({
      message: 'Logout successful',
      data: {
        redirectUrl: '/'
      }
    });

    // Pastikan cookie dihapus dengan path yang sama dan semua opsi yang sama
    // Gunakan semua opsi yang sama seperti saat set cookie di login
    const isProduction = process.env.NODE_ENV === 'production';
    const isHTTPS = request.url.startsWith('https://');
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: isProduction && isHTTPS, // Only secure if production AND using HTTPS
      sameSite: isProduction ? 'lax' : 'strict', // 'lax' lebih compatible untuk production
      maxAge: 0, // Expire immediately
      path: '/',
      expires: new Date(0) // Set expired date to epoch
    });

    // Set cache control headers untuk mencegah browser cache response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to logout",
      },
      { status: 500 }
    );
  }
}

// GET - Alternative logout method
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth-token');

    // Create response dengan cookie deletion yang eksplisit
    const response = NextResponse.json({
      message: 'Logout successful',
      data: {
        redirectUrl: '/'
      }
    });

    // Pastikan cookie dihapus dengan path yang sama dan semua opsi yang sama
    const isProduction = process.env.NODE_ENV === 'production';
    const isHTTPS = request.url.startsWith('https://');
    
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: isProduction && isHTTPS,
      sameSite: isProduction ? 'lax' : 'strict',
      maxAge: 0,
      path: '/',
      expires: new Date(0)
    });

    // Set cache control headers untuk mencegah browser cache response
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to logout",
      },
      { status: 500 }
    );
  }
}