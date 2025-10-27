import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// POST - Register user baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name,
      email, 
      password,
      phoneNumber,
      role = 'USER' // Default role adalah USER
    } = body;

    // Validasi input required
    if (!name || !email || !password || !phoneNumber) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'All fields are required',
          fields: {
            name: !name ? 'Name is required' : null,
            email: !email ? 'Email is required' : null,
            password: !password ? 'Password is required' : null,
            phoneNumber: !phoneNumber ? 'Phone number is required' : null,
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

    // Validasi panjang password (minimal 6 karakter)
    if (password.length < 6) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Password must be at least 6 characters long'
        },
        { status: 400 }
      );
    }

    // Validasi phone number (hanya angka dan minimal 10 digit)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Phone number must be 10-15 digits'
        },
        { status: 400 }
      );
    }

    // Validasi role (hanya ADMIN atau USER)
    const validRoles = ['USER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid role. Must be USER or ADMIN'
        },
        { status: 400 }
      );
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Email already registered'
        },
        { status: 409 }
      );
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phoneNumber,
        role
      },
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

    // Generate JWT token untuk auto-login setelah register
    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const token = jwt.sign(
      { 
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
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

    // Tentukan redirect URL berdasarkan role
    const redirectUrl = newUser.role === 'ADMIN' 
      ? '/admin/dashboard' 
      : '/booking';

    return NextResponse.json(
      {
        message: 'User registered successfully',
        data: {
          user: newUser,
          token: token,
          redirectUrl: redirectUrl
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to register user",
      },
      { status: 500 }
    );
  }
}

// GET - Get all users (Admin only, optional)
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
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

    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const decoded = jwt.verify(token.value, jwtSecret) as {
      userId: string;
      email: string;
      role: string;
    };

    // Check if user is admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Admin access required'
        },
        { status: 403 }
      );
    }

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phoneNumber: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      status: true,
      content: users,
      count: users.length
    });

  } catch (error) {
    console.error('Get users error:', error);
    
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
        message: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}