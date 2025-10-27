import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// GET - Mengambil kendala handphone berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    // Hanya ADMIN yang boleh akses detail kendala handphone by ID
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can access kendala handphone details'
        },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Kendala handphone ID is required'
        },
        { status: 400 }
      );
    }

    // Ambil kendala handphone berdasarkan ID dengan semua relasi
    const kendalaHandphone = await prisma.kendalaHandphone.findUnique({
      where: { id },
      include: {
        pergantianBarang: {
          select: {
            id: true,
            namaBarang: true,
            harga: true,
            createdAt: true,
            updatedAt: true
          }
        },
        handphone: {
          select: {
            id: true,
            brand: true,
            tipe: true,
            createdAt: true,
            services: {
              select: {
                id: true,
                statusService: true,
                tempat: true,
                tanggalPesan: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    phoneNumber: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' }
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

    // Calculate additional statistics
    const stats = {
      totalServices: kendalaHandphone.handphone.length > 0 
        ? kendalaHandphone.handphone.reduce((total, hp) => total + hp.services.length, 0)
        : 0,
      activeServices: kendalaHandphone.handphone.length > 0
        ? kendalaHandphone.handphone.reduce((total, hp) => 
            total + hp.services.filter(service => 
              service.statusService === 'PENDING' || service.statusService === 'IN_PROGRESS'
            ).length, 0)
        : 0,
      completedServices: kendalaHandphone.handphone.length > 0
        ? kendalaHandphone.handphone.reduce((total, hp) => 
            total + hp.services.filter(service => service.statusService === 'COMPLETED').length, 0)
        : 0
    };

    return NextResponse.json({
      status: true,
      content: {
        ...kendalaHandphone,
        statistics: stats
      }
    });

  } catch (error) {
    console.error('Error fetching kendala handphone by ID:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch kendala handphone",
      },
      { status: 500 }
    );
  }
}

// PUT - Update kendala handphone berdasarkan ID (Alternative route)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;
    const body = await request.json();
    const { 
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

// DELETE - Hapus kendala handphone berdasarkan ID (Alternative route)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const { id } = params;

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