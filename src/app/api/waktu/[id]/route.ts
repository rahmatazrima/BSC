import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// GET - Mengambil waktu berdasarkan ID
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

    // Hanya ADMIN yang boleh akses detail waktu by ID
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can access waktu details'
        },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Waktu ID is required'
        },
        { status: 400 }
      );
    }

    // Ambil waktu berdasarkan ID dengan semua relasi
    const waktu = await prisma.waktu.findUnique({
      where: { id },
      include: {
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
            handphone: {
              select: {
                id: true,
                brand: true,
                tipe: true,
                kendalaHandphone: {
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
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!waktu) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Waktu not found'
        },
        { status: 404 }
      );
    }

    // Calculate service statistics for this time slot
    const serviceStats = {
      totalServices: waktu.services.length,
      pendingServices: waktu.services.filter(s => s.statusService === 'PENDING').length,
      inProgressServices: waktu.services.filter(s => s.statusService === 'IN_PROGRESS').length,
      completedServices: waktu.services.filter(s => s.statusService === 'COMPLETED').length,
      cancelledServices: waktu.services.filter(s => s.statusService === 'CANCELLED').length,
      totalRevenue: waktu.services
        .filter(s => s.statusService === 'COMPLETED')
        .reduce((total, service) => {
          const price = service.handphone.kendalaHandphone?.pergantianBarang?.harga || 0;
          return total + price;
        }, 0),
      averageServiceValue: 0
    };

    // Calculate average service value
    if (serviceStats.completedServices > 0) {
      serviceStats.averageServiceValue = serviceStats.totalRevenue / serviceStats.completedServices;
    }

    // Group services by status for better analytics
    const servicesByStatus = {
      pending: waktu.services.filter(s => s.statusService === 'PENDING'),
      inProgress: waktu.services.filter(s => s.statusService === 'IN_PROGRESS'),
      completed: waktu.services.filter(s => s.statusService === 'COMPLETED'),
      cancelled: waktu.services.filter(s => s.statusService === 'CANCELLED')
    };

    // Recent services (last 10)
    const recentServices = waktu.services.slice(0, 10);

    // Calculate utilization rate
    const utilizationRate = {
      isFullyBooked: !waktu.isAvailable,
      serviceLoad: waktu.services.length,
      efficiency: serviceStats.completedServices / Math.max(waktu.services.length, 1) * 100
    };

    // Popular handphone brands in this time slot
    const brandStats = waktu.services.reduce((acc, service) => {
      const brand = service.handphone.brand;
      acc[brand] = (acc[brand] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const popularBrands = Object.entries(brandStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([brand, count]) => ({ brand, count }));

    return NextResponse.json({
      status: true,
      content: {
        ...waktu,
        statistics: serviceStats,
        utilization: utilizationRate,
        servicesByStatus,
        recentServices,
        popularBrands,
        analytics: {
          busyLevel: waktu.services.length >= 10 ? 'High' : 
                    waktu.services.length >= 5 ? 'Medium' : 'Low',
          recommendedAction: !waktu.isAvailable ? 'Time slot is unavailable' :
                           waktu.services.length >= 10 ? 'Consider adding more capacity' :
                           'Time slot available for more bookings'
        }
      }
    });

  } catch (error) {
    console.error('Error fetching waktu by ID:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch waktu",
      },
      { status: 500 }
    );
  }
}

// PUT - Update waktu berdasarkan ID (Alternative route)
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

    // Hanya ADMIN yang boleh update waktu
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can update waktu'
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { 
      namaShift,
      jamMulai,
      jamSelesai,
      isAvailable
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Waktu ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah waktu exists
    const existingWaktu = await prisma.waktu.findUnique({
      where: { id },
      include: {
        services: {
          where: {
            statusService: {
              in: ['PENDING', 'IN_PROGRESS']
            }
          }
        }
      }
    });

    if (!existingWaktu) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Waktu not found'
        },
        { status: 404 }
      );
    }

    // Cek apakah ada service aktif jika ingin mengubah waktu menjadi tidak tersedia
    if (isAvailable === false && existingWaktu.services.length > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Cannot set time slot to unavailable. There are ${existingWaktu.services.length} active service(s)`
        },
        { status: 409 }
      );
    }

    // Siapkan data untuk update
    const updateData: any = {};
    
    if (namaShift !== undefined) updateData.namaShift = namaShift;
    if (jamMulai !== undefined) updateData.jamMulai = jamMulai;
    if (jamSelesai !== undefined) updateData.jamSelesai = jamSelesai;
    if (isAvailable !== undefined) updateData.isAvailable = Boolean(isAvailable);

    // Validasi format waktu jika ada perubahan
    if (jamMulai || jamSelesai) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      
      if (jamMulai && !timeRegex.test(jamMulai)) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid jamMulai format. Use HH:MM format'
          },
          { status: 400 }
        );
      }
      
      if (jamSelesai && !timeRegex.test(jamSelesai)) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid jamSelesai format. Use HH:MM format'
          },
          { status: 400 }
        );
      }
    }

    // Cek duplikasi nama shift (exclude current record)
    if (namaShift !== undefined) {
      const conflictWaktu = await prisma.waktu.findFirst({
        where: { 
          namaShift: {
            equals: namaShift,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (conflictWaktu) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: `Waktu shift dengan nama '${namaShift}' sudah ada`
          },
          { status: 409 }
        );
      }
    }

    // Update waktu
    const updatedWaktu = await prisma.waktu.update({
      where: { id },
      data: updateData,
      include: {
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
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Waktu updated successfully',
      data: updatedWaktu
    });

  } catch (error) {
    console.error('Error updating waktu:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update waktu",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus waktu berdasarkan ID (Alternative route)
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

    // Hanya ADMIN yang boleh delete waktu
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can delete waktu'
        },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Waktu ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah waktu exists dan ada services yang menggunakannya
    const existingWaktu = await prisma.waktu.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    if (!existingWaktu) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Waktu not found'
        },
        { status: 404 }
      );
    }

    // Cek dependency dengan services
    if (existingWaktu._count.services > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Cannot delete time slot. It is being used by ${existingWaktu._count.services} service(s)`
        },
        { status: 409 }
      );
    }

    // Hapus waktu
    await prisma.waktu.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Waktu deleted successfully',
      data: { 
        id,
        namaShift: existingWaktu.namaShift,
        jamMulai: existingWaktu.jamMulai,
        jamSelesai: existingWaktu.jamSelesai
      }
    });

  } catch (error) {
    console.error('Error deleting waktu:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete waktu",
      },
      { status: 500 }
    );
  }
}