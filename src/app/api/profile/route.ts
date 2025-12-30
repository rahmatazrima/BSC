// src/app/api/profile/route.ts
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

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
    const { name, email, phoneNumber, currentPassword, newPassword } = body;

    // Validasi input dasar
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

    // Validasi dan update password jika ada
    let passwordChanged = false;
    let hashedPassword: string | undefined;

    if (currentPassword && newPassword) {
      // Validasi panjang password baru
      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Password baru minimal 6 karakter',
          },
          { status: 400 }
        );
      }

      // Get current user data with password
      const currentUser = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { password: true }
      });

      if (!currentUser) {
        return NextResponse.json(
          {
            error: 'Not Found',
            message: 'User not found',
          },
          { status: 404 }
        );
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, currentUser.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          {
            error: 'Validation Error',
            message: 'Password lama tidak sesuai',
          },
          { status: 400 }
        );
      }

      // Hash new password
      hashedPassword = await bcrypt.hash(newPassword, 10);
      passwordChanged = true;
    }

    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phoneNumber: phoneNumber.replace(/[\s-]/g, ''),
    };

    // Add password to update if changed
    if (hashedPassword) {
      updateData.password = hashedPassword;
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: updateData,
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
          tokenUpdated: true,
          passwordChanged
        }
      });

      // Set new cookie
      const isProduction = process.env.NODE_ENV === 'production';
      const isHTTPS = request.url.startsWith('https://');
      
      response.cookies.set('auth-token', newToken, {
        httpOnly: true,
        secure: isProduction && isHTTPS,
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
        tokenUpdated: false,
        passwordChanged
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