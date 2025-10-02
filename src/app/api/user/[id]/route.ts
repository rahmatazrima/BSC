import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Mengambil user berdasarkan ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
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
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(user), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// PUT - Update user berdasarkan ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { email, name, password, phoneNumber, role } = body;

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Cek email conflict jika email diubah
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return new Response(
          JSON.stringify({ error: 'Email already exists' }),
          { status: 409, headers: { "Content-Type": "application/json" } }
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

    return new Response(JSON.stringify(updatedUser), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// DELETE - Hapus user berdasarkan ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Cek apakah user ada
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Hapus user
    await prisma.user.delete({
      where: { id }
    });

    return new Response(
      JSON.stringify({ message: 'User deleted successfully' }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error('Error deleting user:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}