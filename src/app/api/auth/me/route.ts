import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// GET - Get current logged in user
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      const response = NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'No authentication token found',
          isAuthenticated: false
        },
        { status: 401 }
      );
      // Set cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    // Verify and decode JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    
    let decoded;
    try {
      decoded = jwt.verify(token.value, jwtSecret) as {
        userId: string;
        email: string;
        role: string;
        name: string;
      };
    } catch (jwtError) {
      // Token invalid atau expired
      const response = NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or expired token',
          isAuthenticated: false
        },
        { status: 401 }
      );
      // Set cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    // Get current user data from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      const response = NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'User not found',
          isAuthenticated: false
        },
        { status: 401 }
      );
      // Set cache control headers
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      response.headers.set('Expires', '0');
      return response;
    }

    // Return user data dengan cache control headers
    const response = NextResponse.json({
      status: true,
      message: 'User authenticated',
      data: {
        user: user,
        isAuthenticated: true
      }
    });

    // Set cache control headers untuk mencegah caching
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error) {
    console.error('Get current user error:', error);
    
    const response = NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to get current user",
        isAuthenticated: false
      },
      { status: 500 }
    );
    // Set cache control headers
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  }
}
