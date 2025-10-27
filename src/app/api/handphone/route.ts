import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// GET - Mengambil semua handphone atau berdasarkan query
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
    const brand = searchParams.get('brand');
    const tipe = searchParams.get('tipe');
    const kendalaId = searchParams.get('kendalaId');

    // Build where condition
    const where: any = {};
    if (brand) {
      where.brand = { 
        contains: brand, 
        mode: 'insensitive' 
      };
    }
    if (tipe) {
      where.tipe = { 
        contains: tipe, 
        mode: 'insensitive' 
      };
    }
    if (kendalaId) {
      where.kendalaHandphoneId = kendalaId;
    }

    // Ambil semua handphone dengan relasi
    const handphoneList = await prisma.handphone.findMany({
      where,
      include: {
        kendalaHanphone: {
          select: {
            id: true,
            topikMasalah: true,
            pergantianBarang: {
              select: {
                id: true,
                namaBarang: true,
                harga: true
              }
            }
          }
        },
        services: {
          select: {
            id: true,
            statusService: true,
            tempat: true,
            tanggalPesan: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true
              }
            },
            waktu: {
              select: {
                id: true,
                namaShift: true,
                jamMulai: true,
                jamSelesai: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: [
        { brand: 'asc' },
        { tipe: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      status: true,
      content: handphoneList,
      count: handphoneList.length
    });

  } catch (error) {
    console.error('Error fetching handphone:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch handphone data",
      },
      { status: 500 }
    );
  }
}

// POST - Membuat handphone baru
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

    // Hanya ADMIN yang boleh membuat handphone
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can create handphone'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      brand,
      tipe,
      kendalaHandphoneId
    } = body;

    // Validasi input required
    if (!brand || !tipe || !kendalaHandphoneId) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'All fields are required',
          fields: {
            brand: !brand ? 'Brand is required' : null,
            tipe: !tipe ? 'Tipe is required' : null,
            kendalaHandphoneId: !kendalaHandphoneId ? 'Kendala handphone ID is required' : null,
          }
        },
        { status: 400 }
      );
    }

    // Cek apakah kendala handphone exists
    const existingKendalaHandphone = await prisma.kendalaHandphone.findUnique({
      where: { id: kendalaHandphoneId }
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

    // Cek apakah kombinasi brand + tipe + kendala sudah ada
    const existingHandphone = await prisma.handphone.findFirst({
      where: { 
        brand: {
          equals: brand,
          mode: 'insensitive'
        },
        tipe: {
          equals: tipe,
          mode: 'insensitive'
        },
        kendalaHandphoneId
      }
    });

    if (existingHandphone) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Handphone ${brand} ${tipe} with this problem already exists`
        },
        { status: 409 }
      );
    }

    // Buat handphone baru
    const newHandphone = await prisma.handphone.create({
      data: {
        brand,
        tipe,
        kendalaHandphoneId
      },
      include: {
        kendalaHanphone: {
          select: {
            id: true,
            topikMasalah: true,
            pergantianBarang: {
              select: {
                id: true,
                namaBarang: true,
                harga: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: 'Handphone created successfully',
        data: newHandphone
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating handphone:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create handphone",
      },
      { status: 500 }
    );
  }
}

// PUT - Update handphone
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

    // Hanya ADMIN yang boleh update handphone
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can update handphone'
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      id,
      brand,
      tipe,
      kendalaHandphoneId
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Handphone ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah handphone exists
    const existingHandphone = await prisma.handphone.findUnique({
      where: { id }
    });

    if (!existingHandphone) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Handphone not found'
        },
        { status: 404 }
      );
    }

    // Siapkan data untuk update
    const updateData: any = {};
    
    if (brand !== undefined) updateData.brand = brand;
    if (tipe !== undefined) updateData.tipe = tipe;
    
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

    // Cek duplikasi setelah update
    if (brand !== undefined || tipe !== undefined || kendalaHandphoneId !== undefined) {
      const finalBrand = brand !== undefined ? brand : existingHandphone.brand;
      const finalTipe = tipe !== undefined ? tipe : existingHandphone.tipe;
      const finalKendalaId = kendalaHandphoneId !== undefined ? kendalaHandphoneId : existingHandphone.kendalaHandphoneId;

      const conflictHandphone = await prisma.handphone.findFirst({
        where: { 
          brand: {
            equals: finalBrand,
            mode: 'insensitive'
          },
          tipe: {
            equals: finalTipe,
            mode: 'insensitive'
          },
          kendalaHandphoneId: finalKendalaId,
          id: { not: id }
        }
      });

      if (conflictHandphone) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: `Handphone ${finalBrand} ${finalTipe} with this problem already exists`
          },
          { status: 409 }
        );
      }
    }

    // Update handphone
    const updatedHandphone = await prisma.handphone.update({
      where: { id },
      data: updateData,
      include: {
        kendalaHanphone: {
          select: {
            id: true,
            topikMasalah: true,
            pergantianBarang: {
              select: {
                id: true,
                namaBarang: true,
                harga: true
              }
            }
          }
        },
        services: {
          select: {
            id: true,
            statusService: true,
            tempat: true,
            tanggalPesan: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Handphone updated successfully',
      data: updatedHandphone
    });

  } catch (error) {
    console.error('Error updating handphone:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update handphone",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus handphone
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

    // Hanya ADMIN yang boleh delete handphone
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can delete handphone'
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
          message: 'Handphone ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah handphone exists
    const existingHandphone = await prisma.handphone.findUnique({
      where: { id },
      include: {
        services: true,
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!existingHandphone) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Handphone not found'
        },
        { status: 404 }
      );
    }

    // Cek apakah ada services yang menggunakan handphone ini
    if (existingHandphone._count.services > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Cannot delete handphone. It is being used by ${existingHandphone._count.services} service(s)`
        },
        { status: 409 }
      );
    }

    // Hapus handphone
    await prisma.handphone.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Handphone deleted successfully',
      data: { 
        id,
        brand: existingHandphone.brand,
        tipe: existingHandphone.tipe
      }
    });

  } catch (error) {
    console.error('Error deleting handphone:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete handphone",
      },
      { status: 500 }
    );
  }
}