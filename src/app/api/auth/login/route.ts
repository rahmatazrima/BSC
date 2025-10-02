import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role 
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    // Response tanpa password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token: token // Optional: return token in response body juga
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Login failed. Please try again.'
      },
      { status: 500 }
    );
  }
}

// GET - Check login status
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          message: 'No token provided'
        },
        { status: 401 }
      );
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    const decoded = jwt.verify(token, jwtSecret) as any;

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
          error: 'Authentication failed',
          message: 'User not found'
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: 'Authentication valid',
      data: { user }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { 
        error: 'Authentication failed',
        message: 'Invalid or expired token'
      },
      { status: 401 }
    );
  }
}