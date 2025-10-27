import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// GET - Mengambil semua kendala handphone atau berdasarkan query
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
    const topikMasalah = searchParams.get('topikMasalah');

    // Jika ada ID, ambil kendala handphone spesifik
    if (id) {
      const kendalaHandphone = await prisma.kendalaHandphone.findUnique({
        where: { id },
        include: {
          pergantianBarang: {
            select: {
              id: true,
              namaBarang: true,
              harga: true
            }
          },
          handphone: {
            select: {
              id: true,
              brand: true,
              tipe: true,
              services: {
                select: {
                  id: true,
                  statusService: true,
                  tempat: true,
                  tanggalPesan: true,
                  user: {
                    select: {
                      name: true,
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!kendalaHandphone) {
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Kendala handphone not found'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: true,
        content: kendalaHandphone
      });
    }

    // Build where condition
    const where: any = {};
    if (topikMasalah) {
      where.topikMasalah = { 
        contains: topikMasalah, 
        mode: 'insensitive' 
      };
    }

    // Ambil semua kendala handphone dengan relasi
    const kendalaHandphoneList = await prisma.kendalaHandphone.findMany({
      where,
      include: {
        pergantianBarang: {
          select: {
            id: true,
            namaBarang: true,
            harga: true
          }
        },
        handphone: {
          select: {
            id: true,
            brand: true,
            tipe: true
          }
        },
        _count: {
          select: {
            handphone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      status: true,
      content: kendalaHandphoneList,
      count: kendalaHandphoneList.length
    });

  } catch (error) {
    console.error('Error fetching kendala handphone:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch kendala handphone data",
      },
      { status: 500 }
    );
  }
}

// POST - Membuat kendala handphone baru
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

    // Hanya ADMIN yang boleh membuat kendala handphone
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can create kendala handphone'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      topikMasalah,
      pergantianBarangId
    } = body;

    // Validasi input required
    if (!topikMasalah || !pergantianBarangId) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'All fields are required',
          fields: {
            topikMasalah: !topikMasalah ? 'Topik masalah is required' : null,
            pergantianBarangId: !pergantianBarangId ? 'Pergantian barang ID is required' : null,
          }
        },
        { status: 400 }
      );
    }

    // Cek apakah pergantian barang exists dan belum digunakan
    const existingPergantianBarang = await prisma.pergantianBarang.findUnique({
      where: { id: pergantianBarangId },
      include: {
        kendalaHanphone: true
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

    if (existingPergantianBarang.kendalaHanphone) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Pergantian barang '${existingPergantianBarang.namaBarang}' sudah digunakan oleh kendala handphone lain`
        },
        { status: 409 }
      );
    }

    // Cek apakah topik masalah dengan nama yang sama sudah ada
    const existingKendala = await prisma.kendalaHandphone.findFirst({
      where: { 
        topikMasalah: {
          equals: topikMasalah,
          mode: 'insensitive'
        }
      }
    });

    if (existingKendala) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Kendala handphone dengan topik '${topikMasalah}' sudah ada`
        },
        { status: 409 }
      );
    }

    // Buat kendala handphone baru
    const newKendalaHandphone = await prisma.kendalaHandphone.create({
      data: {
        topikMasalah,
        pergantianBarangId
      },
      include: {
        pergantianBarang: {
          select: {
            id: true,
            namaBarang: true,
            harga: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: 'Kendala handphone created successfully',
        data: newKendalaHandphone
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating kendala handphone:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create kendala handphone",
      },
      { status: 500 }
    );
  }
}

// PUT - Update kendala handphone
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

    // Hanya ADMIN yang boleh update kendala handphone
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can update kendala handphone'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      id,
      topikMasalah,
      pergantianBarangId
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Kendala handphone ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah kendala handphone exists
    const existingKendalaHandphone = await prisma.kendalaHandphone.findUnique({
      where: { id }
    });

    if (!existingKendalaHandphone) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Kendala handphone not found'
        },
        { status: 404 }
      );
    }

    // Siapkan data untuk update
    const updateData: any = {};
    
    if (topikMasalah !== undefined) {
      // Cek topik masalah conflict (exclude current record)
      const conflictKendala = await prisma.kendalaHandphone.findFirst({
        where: { 
          topikMasalah: {
            equals: topikMasalah,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (conflictKendala) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: `Kendala handphone dengan topik '${topikMasalah}' sudah ada`
          },
          { status: 409 }
        );
      }
      updateData.topikMasalah = topikMasalah;
    }

    if (pergantianBarangId !== undefined) {
      // Cek apakah pergantian barang exists dan belum digunakan (exclude current record)
      const existingPergantianBarang = await prisma.pergantianBarang.findUnique({
        where: { id: pergantianBarangId },
        include: {
          kendalaHanphone: true
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

      if (existingPergantianBarang.kendalaHanphone && 
          existingPergantianBarang.kendalaHanphone.id !== id) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: `Pergantian barang '${existingPergantianBarang.namaBarang}' sudah digunakan oleh kendala handphone lain`
          },
          { status: 409 }
        );
      }

      updateData.pergantianBarangId = pergantianBarangId;
    }

    // Update kendala handphone
    const updatedKendalaHandphone = await prisma.kendalaHandphone.update({
      where: { id },
      data: updateData,
      include: {
        pergantianBarang: {
          select: {
            id: true,
            namaBarang: true,
            harga: true
          }
        },
        handphone: {
          select: {
            id: true,
            brand: true,
            tipe: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Kendala handphone updated successfully',
      data: updatedKendalaHandphone
    });

  } catch (error) {
    console.error('Error updating kendala handphone:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update kendala handphone",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus kendala handphone
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

    // Hanya ADMIN yang boleh delete kendala handphone
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can delete kendala handphone'
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
          message: 'Kendala handphone ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah kendala handphone exists
    const existingKendalaHandphone = await prisma.kendalaHandphone.findUnique({
      where: { id },
      include: {
        handphone: true,
        _count: {
          select: {
            handphone: true
          }
        }
      }
    });

    if (!existingKendalaHandphone) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Kendala handphone not found'
        },
        { status: 404 }
      );
    }

    // Cek apakah ada handphone yang menggunakan kendala ini
    if (existingKendalaHandphone._count.handphone > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Cannot delete kendala handphone. It is being used by ${existingKendalaHandphone._count.handphone} handphone(s)`
        },
        { status: 409 }
      );
    }

    // Hapus kendala handphone
    await prisma.kendalaHandphone.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Kendala handphone deleted successfully',
      data: { 
        id,
        topikMasalah: existingKendalaHandphone.topikMasalah
      }
    });

  } catch (error) {
    console.error('Error deleting kendala handphone:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete kendala handphone",
      },
      { status: 500 }
    );
  }
}