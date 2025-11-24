import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// GET - Mengambil pergantian barang berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify JWT token untuk memastikan user adalah ADMIN
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Authentication token is required'
        },
        { status: 401 }
      );
    }

    let currentUser: { userId: string; email: string; role: string };
    
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      currentUser = jwt.verify(token.value, jwtSecret) as { userId: string; email: string; role: string };
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        },
        { status: 401 }
      );
    }

    // Hanya ADMIN yang boleh akses detail pergantian barang by ID
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can access pergantian barang details'
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Pergantian barang ID is required'
        },
        { status: 400 }
      );
    }

    // Ambil pergantian barang berdasarkan ID
    const pergantianBarang = await prisma.pergantianBarang.findUnique({
      where: { id },
      include: {
        kendalaHandphone: {
          include: {
            handphone: {
              select: {
                id: true,
                brand: true,
                tipe: true
              }
            }
          }
        }
      }
    });

    if (!pergantianBarang) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Pergantian barang not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: true,
      content: pergantianBarang
    });

  } catch (error) {
    console.error('Error fetching pergantian barang by ID:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch pergantian barang",
      },
      { status: 500 }
    );
  }
}

// PUT - Update pergantian barang berdasarkan ID (Alternative)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify JWT token untuk memastikan user adalah ADMIN
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Authentication token is required'
        },
        { status: 401 }
      );
    }

    let currentUser: { userId: string; email: string; role: string };
    
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      currentUser = jwt.verify(token.value, jwtSecret) as { userId: string; email: string; role: string };
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        },
        { status: 401 }
      );
    }

    // Hanya ADMIN yang boleh update pergantian barang
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can update pergantian barang'
        },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { namaBarang, harga } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Pergantian barang ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah pergantian barang exists
    const existingPergantianBarang = await prisma.pergantianBarang.findUnique({
      where: { id }
    });

    if (!existingPergantianBarang) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Pergantian barang not found'
        },
        { status: 404 }
      );
    }

    // Siapkan data untuk update
    const updateData: any = {};
    
    if (namaBarang !== undefined) {
      // Cek nama barang conflict (exclude current record)
      const conflictBarang = await prisma.pergantianBarang.findFirst({
        where: { 
          namaBarang: {
            equals: namaBarang,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (conflictBarang) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: `Barang dengan nama '${namaBarang}' sudah ada`
          },
          { status: 409 }
        );
      }
      updateData.namaBarang = namaBarang;
    }

    if (harga !== undefined && harga !== null) {
      const parsedHarga = parseFloat(harga);
      if (isNaN(parsedHarga) || parsedHarga < 0) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Harga must be a positive number'
          },
          { status: 400 }
        );
      }
      updateData.harga = parsedHarga;
    }

    // Update pergantian barang
    const updatedPergantianBarang = await prisma.pergantianBarang.update({
      where: { id },
      data: updateData,
      include: {
        kendalaHandphone: {
          include: {
            handphone: {
              select: {
                id: true,
                brand: true,
                tipe: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Pergantian barang updated successfully',
      data: updatedPergantianBarang
    });

  } catch (error) {
    console.error('Error updating pergantian barang:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update pergantian barang",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pergantian barang berdasarkan ID (Alternative)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify JWT token untuk memastikan user adalah ADMIN
    const token = request.cookies.get('auth-token');
    
    if (!token) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Authentication token is required'
        },
        { status: 401 }
      );
    }

    let currentUser: { userId: string; email: string; role: string };
    
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      currentUser = jwt.verify(token.value, jwtSecret) as { userId: string; email: string; role: string };
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        },
        { status: 401 }
      );
    }

    // Hanya ADMIN yang boleh delete pergantian barang
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can delete pergantian barang'
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Pergantian barang ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah pergantian barang exists
    const existingPergantianBarang = await prisma.pergantianBarang.findUnique({
      where: { id },
      include: {
        kendalaHandphone: {
          include: {
            handphone: true
          }
        }
      }
    });

    if (!existingPergantianBarang) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Pergantian barang not found'
        },
        { status: 404 }
      );
    }

    // Note: PergantianBarang belongs to KendalaHandphone (not the other way)
    // So it's safe to delete as long as no services are using the kendala
    // We can safely delete the sparepart without breaking relationships

    // Hapus pergantian barang
    await prisma.pergantianBarang.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Pergantian barang deleted successfully',
      data: { 
        id,
        namaBarang: existingPergantianBarang.namaBarang
      }
    });

  } catch (error) {
    console.error('Error deleting pergantian barang:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete pergantian barang",
      },
      { status: 500 }
    );
  }
}