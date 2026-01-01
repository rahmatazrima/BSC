import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// POST - Login user
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid request',
          message: 'Invalid JSON body'
        },
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Validasi input
    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Email and password are required',
          fields: {
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null,
          }
        },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid email format'
        },
        { status: 400 }
      );
    }

    // Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: 'Authentication failed',
          message: 'Invalid email or password'
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      jwtSecret,
      { expiresIn: '3h' } // Token berlaku 3 jam
    );

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    
    // Untuk production tanpa HTTPS, set secure: false
    const isProduction = process.env.NODE_ENV === 'production';
    const isHTTPS = request.url.startsWith('https://');
    
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction && isHTTPS, // Only secure if production AND using HTTPS
      sameSite: isProduction ? 'lax' : 'strict', // 'lax' lebih compatible untuk production
      maxAge: 3 * 60 * 60, // 3 hours
      path: '/'
    });

    // Response tanpa password
    const { password: _, ...userWithoutPassword } = user;

    // Tentukan redirect URL berdasarkan role
    const redirectUrl = user.role === 'ADMIN' 
      ? '/admin' 
      : '/';

    return NextResponse.json({
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token: token, // Optional: untuk mobile/API client
        redirectUrl: redirectUrl
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to process login",
      },
      { status: 500 }
    );
  }
}

// GET - Check login status / Current user
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'No authentication token found'
        },
        { status: 401 }
      );
    }

    // Verify token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token.value, jwtSecret) as {
      userId: string;
      email: string;
      role: string;
      name: string;
    };

    // Get current user data
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
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'User not found'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      status: true,
      data: {
        user: user,
        isAuthenticated: true
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to check authentication",
      },
      { status: 500 }
    );
  }
}