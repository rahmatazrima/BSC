import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// GET - Mengambil semua pergantian barang atau berdasarkan query
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token untuk memastikan user terautentikasi
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

    // Cek apakah user exists
    const userExists = await prisma.user.findUnique({
      where: { id: currentUser.userId }
    });

    if (!userExists) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'User not found'
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const namaBarang = searchParams.get('namaBarang');
    const minHarga = searchParams.get('minHarga');
    const maxHarga = searchParams.get('maxHarga');

    // Jika ada ID, ambil pergantian barang spesifik
    if (id) {
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
    }

    // Build where condition
    const where: any = {};
    if (namaBarang) {
      where.namaBarang = { 
        contains: namaBarang, 
        mode: 'insensitive' 
      };
    }
    if (minHarga || maxHarga) {
      where.harga = {};
      if (minHarga) where.harga.gte = parseFloat(minHarga);
      if (maxHarga) where.harga.lte = parseFloat(maxHarga);
    }

    // Ambil semua pergantian barang dengan relasi
    const pergantianBarangList = await prisma.pergantianBarang.findMany({
      where,
      include: {
        kendalaHandphone: {
          include: {
            handphone: true
          }
        }
      },
      orderBy: [
        { harga: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      status: true,
      content: pergantianBarangList,
      count: pergantianBarangList.length
    });

  } catch (error) {
    console.error('Error fetching pergantian barang:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch pergantian barang data",
      },
      { status: 500 }
    );
  }
}

// POST - Membuat pergantian barang baru
export async function POST(request: NextRequest) {
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

    // Hanya ADMIN yang boleh membuat pergantian barang
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can create pergantian barang'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      namaBarang,
      harga,
      kendalaHandphoneId
    } = body;

    // Validasi input required
    if (!namaBarang || harga === undefined || harga === null || !kendalaHandphoneId) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'All fields are required',
          fields: {
            namaBarang: !namaBarang ? 'Nama barang is required' : null,
            harga: (harga === undefined || harga === null) ? 'Harga is required' : null,
            kendalaHandphoneId: !kendalaHandphoneId ? 'Kendala handphone ID is required' : null,
          }
        },
        { status: 400 }
      );
    }

    // Validasi harga harus number dan positif
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

    // Cek apakah kendala handphone exists
    const existingKendala = await prisma.kendalaHandphone.findUnique({
      where: { id: kendalaHandphoneId }
    });

    if (!existingKendala) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Kendala handphone not found'
        },
        { status: 404 }
      );
    }

    // Buat pergantian barang baru
    const newPergantianBarang = await prisma.pergantianBarang.create({
      data: {
        namaBarang,
        harga: parsedHarga,
        kendalaHandphoneId
      },
      include: {
        kendalaHandphone: {
          include: {
            handphone: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: 'Pergantian barang created successfully',
        data: newPergantianBarang
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating pergantian barang:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create pergantian barang",
      },
      { status: 500 }
    );
  }
}

// PUT - Update pergantian barang
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { 
      id,
      namaBarang,
      harga,
      kendalaHandphoneId
    } = body;

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

    if (kendalaHandphoneId !== undefined) {
      // Cek apakah kendala handphone exists
      const kendalaExists = await prisma.kendalaHandphone.findUnique({
        where: { id: kendalaHandphoneId }
      });

      if (!kendalaExists) {
        return NextResponse.json(
          {
            error: 'Not found',
            message: 'Kendala handphone not found'
          },
          { status: 404 }
        );
      }

      updateData.kendalaHandphoneId = kendalaHandphoneId;
    }

    // Update pergantian barang
    const updatedPergantianBarang = await prisma.pergantianBarang.update({
      where: { id },
      data: updateData,
      include: {
        kendalaHandphone: {
          include: {
            handphone: true
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

// DELETE - Hapus pergantian barang
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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