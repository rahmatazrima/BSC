// src/app/api/profile/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// PUT - Update profile user yang sedang login
export async function PUT(request: NextRequest) {
  try {
    // Get token from cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token');

    if (!token) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'No authentication token found',
        },
        { status: 401 }
      );
    }

    // Verify JWT token
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
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, phoneNumber } = body;

    // Validasi input
    if (!name || !email || !phoneNumber) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Name, email, and phone number are required',
        },
        { status: 400 }
      );
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    // Validasi format nomor telepon (minimal 10 digit)
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phoneNumber.replace(/[\s-]/g, ''))) {
      return NextResponse.json(
        {
          error: 'Validation Error',
          message: 'Phone number must be 10-15 digits',
        },
        { status: 400 }
      );
    }

    // Cek apakah email sudah digunakan user lain
    if (email !== decoded.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists && emailExists.id !== decoded.userId) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Email already in use by another account',
          },
          { status: 409 }
        );
      }
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.replace(/[\s-]/g, ''),
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

    // Jika email berubah, generate JWT token baru
    if (email !== decoded.email) {
      const newToken = jwt.sign(
        {
          userId: updatedUser.id,
          email: updatedUser.email,
          role: updatedUser.role,
          name: updatedUser.name,
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      const response = NextResponse.json({
        status: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
          tokenUpdated: true
        }
      });

      // Set new cookie
      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json({
      status: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUser,
        tokenUpdated: false
      }
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to update profile',
      },
      { status: 500 }
    );
  }
}