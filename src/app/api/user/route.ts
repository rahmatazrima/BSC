import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        const users = await prisma.user.findMany()

        return NextResponse.json({status: true, content: users}, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { 
              error: 'Internal server error',
              message: 'Failed to fetch users'
            },
            { status: 500 }
          );
    }
}

// GET - Mengambil semua user atau user berdasarkan query
// export async function GET(request: NextRequest) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const id = searchParams.get('id');
//     const role = searchParams.get('role');
//     const search = searchParams.get('search');

//     if (id) {
//       const user = await prisma.user.findUnique({
//         where: { id },
//         select: {
//           id: true,
//           email: true,
//           name: true,
//           phoneNumber: true,
//           role: true,
//           createdAt: true,
//           updatedAt: true,
//         }
//       });

//       if (!user) {
//         return NextResponse.json(
//           { error: 'User not found' },
//           { status: 404 }
//         );
//       }

//       return NextResponse.json(user);
//     }

//     const where: any = {};
//     if (role) where.role = role;
//     if (search) {
//       where.OR = [
//         { name: { contains: search, mode: 'insensitive' } },
//         { email: { contains: search, mode: 'insensitive' } },
//       ];
//     }

//     const users = await prisma.user.findMany({
//       where,
//       select: {
//         id: true,
//         email: true,
//         name: true,
//         phoneNumber: true,
//         role: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//       orderBy: { createdAt: 'desc' }
//     });

//     return NextResponse.json({
//       data: users,
//       count: users.length
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     return NextResponse.json(
//       { 
//         error: 'Internal server error',
//         message: 'Failed to fetch users'
//       },
//       { status: 500 }
//     );
//   }
// }

// POST - Membuat user baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, phoneNumber, role = 'USER' } = body;

    // Validasi input
    if (!email || !name || !password) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: 'Email, name, and password are required',
          fields: {
            email: !email ? 'Email is required' : null,
            name: !name ? 'Name is required' : null,
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

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: 'Password must be at least 6 characters long'
        },
        { status: 400 }
      );
    }

    // Cek apakah email sudah ada
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          error: 'Conflict',
          message: 'Email already exists'
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Buat user baru
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        phoneNumber,
        role,
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

    return NextResponse.json(
      {
        message: 'User created successfully',
        data: newUser
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to create user'
      },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, password, phoneNumber, role } = body;

    if (!id) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    // Validasi email format jika email diubah
    if (email) {
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
    }

    // Validasi password jika diubah
    if (password && password.length < 6) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: 'Password must be at least 6 characters long'
        },
        { status: 400 }
      );
    }

    // Cek email conflict jika email diubah
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { 
            error: 'Conflict',
            message: 'Email already exists'
          },
          { status: 409 }
        );
      }
    }

    // Siapkan data untuk update
    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (role) updateData.role = role;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
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

    return NextResponse.json({
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to update user'
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          message: 'User ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    // Hapus user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'User deleted successfully',
      data: { id }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Failed to delete user'
      },
      { status: 500 }
    );
  }
}