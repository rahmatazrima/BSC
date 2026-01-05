import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

const SERVICE_FEE = 38000; // Biaya jasa service

// GET - Mengambil handphone berdasarkan ID
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

    // Hanya ADMIN yang boleh akses detail handphone by ID
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can access handphone details'
        },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Handphone ID is required'
        },
        { status: 400 }
      );
    }

    // Ambil handphone berdasarkan ID dengan semua relasi
    const handphone = await prisma.handphone.findUnique({
      where: { id },
      include: {
        kendalaHandphone: {
          include: {
            pergantianBarang: {
              select: {
                id: true,
                namaBarang: true,
                harga: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        services: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                role: true
              }
            },
            waktu: {
              select: {
                id: true,
                namaShift: true,
                jamMulai: true,
                jamSelesai: true,
                isAvailable: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!handphone) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Handphone not found'
        },
        { status: 404 }
      );
    }

    // Calculate service statistics
    const completedServicesCount = handphone.services.filter(s => s.statusService === 'COMPLETED').length;
    
    // Calculate total revenue: sum all harga from pergantianBarang in all kendalaHandphone
    // Then multiply by completed services count (assuming each completed service uses one set of parts)
    const sparepartRevenue = handphone.kendalaHandphone.length > 0
      ? handphone.kendalaHandphone.reduce((total, kendala) => {
          const kendalaRevenue = kendala.pergantianBarang.length > 0
            ? kendala.pergantianBarang.reduce((kendalaTotal, barang) => {
                return kendalaTotal + (barang.harga || 0);
              }, 0)
            : 0;
          return total + kendalaRevenue;
        }, 0) * completedServicesCount
      : 0;
    
    // Total revenue = sparepart revenue + (SERVICE_FEE * completed services count)
    const totalRevenue = sparepartRevenue + (SERVICE_FEE * completedServicesCount);

    const serviceStats = {
      totalServices: handphone.services.length,
      pendingServices: handphone.services.filter(s => s.statusService === 'PENDING').length,
      inProgressServices: handphone.services.filter(s => s.statusService === 'IN_PROGRESS').length,
      completedServices: completedServicesCount,
      cancelledServices: handphone.services.filter(s => s.statusService === 'CANCELLED').length,
      totalRevenue: totalRevenue
    };

    // Recent services (last 5)
    const recentServices = handphone.services.slice(0, 5);

    return NextResponse.json({
      status: true,
      content: {
        ...handphone,
        statistics: serviceStats,
        recentServices
      }
    });

  } catch (error) {
    console.error('Error fetching handphone by ID:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch handphone",
      },
      { status: 500 }
    );
  }
}

// PUT - Update handphone berdasarkan ID (Alternative route)
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

    const { id } = await params;
    const body = await request.json();
    const { 
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

    // Update handphone
    const updatedHandphone = await prisma.handphone.update({
      where: { id },
      data: updateData,
      include: {
        kendalaHandphone: {
          include: {
            pergantianBarang: true
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

// DELETE - Hapus handphone berdasarkan ID (Alternative route)
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

    const { id } = await params;

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
        kendalaHandphone: true,
        _count: {
          select: {
            services: true,
            kendalaHandphone: true
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

    // Cek apakah ada kendala yang terkait dengan handphone ini
    if (existingHandphone._count.kendalaHandphone > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Cannot delete handphone. It has ${existingHandphone._count.kendalaHandphone} kendala(s) associated with it. Please delete the kendala first.`
        },
        { status: 409 }
      );
    }

    // Cek dependency - services
    if (existingHandphone._count.services > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Cannot delete handphone. It is being used by ${existingHandphone._count.services} service(s). Please complete or cancel the services first.`
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