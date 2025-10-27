import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// GET - Mengambil service berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify JWT token untuk mendapatkan user info
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

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Service ID is required'
        },
        { status: 400 }
      );
    }

    // Ambil service berdasarkan ID dengan semua relasi
    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
            createdAt: true
          }
        },
        handphone: {
          include: {
            kendalaHanphone: {
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
            }
          }
        },
        waktu: {
          select: {
            id: true,
            namaShift: true,
            jamMulai: true,
            jamSelesai: true,
            isAvailable: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!service) {
      return NextResponse.json(
        { 
          error: 'Not found',
          message: 'Service not found'
        },
        { status: 404 }
      );
    }

    // Jika bukan admin, hanya bisa lihat data sendiri
    if (currentUser.role !== 'ADMIN' && service.userId !== currentUser.userId) {
      return NextResponse.json(
        { 
          error: 'Forbidden',
          message: 'You are not authorized to view this service'
        },
        { status: 403 }
      );
    }

    // Calculate service duration (estimated)
    const serviceDuration = {
      estimatedDuration: service.waktu ? 
        calculateDuration(service.waktu.jamMulai, service.waktu.jamSelesai) : null,
      scheduledDate: service.tanggalPesan,
      fullSchedule: service.waktu ? 
        `${service.tanggalPesan.toDateString()} ${service.waktu.jamMulai} - ${service.waktu.jamSelesai}` : null
    };

    // Calculate service cost and details
    const serviceDetails = {
      problemDescription: service.handphone?.kendalaHanphone?.topikMasalah || 'No problem specified',
      replacementPart: service.handphone?.kendalaHanphone?.pergantianBarang?.namaBarang || 'No parts needed',
      estimatedCost: service.handphone?.kendalaHanphone?.pergantianBarang?.harga || 0,
      deviceInfo: service.handphone ? 
        `${service.handphone.brand} ${service.handphone.tipe}` : 'Unknown device',
      serviceLocation: service.tempat
    };

    // Calculate service timeline
    const now = new Date();
    const serviceDate = new Date(service.tanggalPesan);
    const daysDifference = Math.ceil((serviceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    const timeline = {
      isUpcoming: daysDifference > 0,
      isPast: daysDifference < 0,
      isToday: daysDifference === 0,
      daysFromNow: daysDifference,
      status: service.statusService,
      timelineStatus: getTimelineStatus(service.statusService, daysDifference)
    };

    // Service analytics
    const analytics = {
      customerHistory: {
        totalServicesWithThisCustomer: await prisma.service.count({
          where: { userId: service.userId }
        }),
        customerSince: service.user.createdAt
      },
      deviceHistory: {
        totalServicesForThisDevice: await prisma.service.count({
          where: { handphoneId: service.handphoneId }
        }),
        commonProblems: await getCommonProblemsForDevice(service.handphoneId)
      },
      timeSlotUtilization: {
        totalServicesInThisTimeSlot: await prisma.service.count({
          where: { waktuId: service.waktuId }
        }),
        timeSlotPopularity: await getTimeSlotPopularity(service.waktuId)
      }
    };

    return NextResponse.json({
      status: true,
      content: {
        ...service,
        serviceDuration,
        serviceDetails,
        timeline,
        analytics
      }
    });

  } catch (error) {
    console.error('Error fetching service by ID:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch service",
      },
      { status: 500 }
    );
  }
}

// PUT - Update service berdasarkan ID (Alternative route)
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

    // Hanya ADMIN yang boleh melakukan update
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can update services'
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { 
      statusService,
      tempat,
      tanggalPesan,
      handphoneId,
      waktuId
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Service ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah service exists
    const existingService = await prisma.service.findUnique({
      where: { id }
    });

    if (!existingService) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Service not found'
        },
        { status: 404 }
      );
    }

    // Validasi status service
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (statusService && !validStatuses.includes(statusService)) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Siapkan data untuk update
    const updateData: any = {};
    if (statusService !== undefined) updateData.statusService = statusService;
    if (tempat !== undefined) updateData.tempat = tempat;
    
    if (tanggalPesan !== undefined) {
      const parsedDate = new Date(tanggalPesan);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid date format for tanggalPesan'
          },
          { status: 400 }
        );
      }
      updateData.tanggalPesan = parsedDate;
    }

    if (handphoneId !== undefined) {
      const handphoneExists = await prisma.handphone.findUnique({
        where: { id: handphoneId }
      });

      if (!handphoneExists) {
        return NextResponse.json(
          {
            error: 'Not found',
            message: 'Handphone not found'
          },
          { status: 404 }
        );
      }
      updateData.handphoneId = handphoneId;
    }

    if (waktuId !== undefined) {
      const waktuExists = await prisma.waktu.findUnique({
        where: { id: waktuId }
      });

      if (!waktuExists) {
        return NextResponse.json(
          {
            error: 'Not found',
            message: 'Waktu not found'
          },
          { status: 404 }
        );
      }

      updateData.waktuId = waktuId;
    }

    // Cek apakah shift sudah terisi pada tanggal yang sama (jika mengubah waktu atau tanggal)
    if (waktuId !== undefined || tanggalPesan !== undefined) {
      const finalWaktuId = waktuId !== undefined ? waktuId : existingService.waktuId;
      const finalTanggalPesan = tanggalPesan !== undefined ? new Date(tanggalPesan) : existingService.tanggalPesan;
      
      const startOfDay = new Date(finalTanggalPesan);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(finalTanggalPesan);
      endOfDay.setHours(23, 59, 59, 999);

      const existingServiceOnSameShift = await prisma.service.findFirst({
        where: {
          waktuId: finalWaktuId,
          tanggalPesan: {
            gte: startOfDay,
            lte: endOfDay
          },
          id: { not: id }, // Exclude current service being updated
          statusService: {
            not: 'CANCELLED' // Tidak hitung service yang dibatalkan
          }
        },
        include: {
          waktu: true,
          user: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      if (existingServiceOnSameShift) {
        const waktuInfo = await prisma.waktu.findUnique({
          where: { id: finalWaktuId }
        });

        const formattedDate = finalTanggalPesan.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        return NextResponse.json(
          {
            error: 'Conflict',
            message: `Shift "${waktuInfo?.namaShift}" (${waktuInfo?.jamMulai} - ${waktuInfo?.jamSelesai}) sudah terisi untuk tanggal ${formattedDate}`,
            details: {
              existingService: {
                id: existingServiceOnSameShift.id,
                user: existingServiceOnSameShift.user.name,
                shift: existingServiceOnSameShift.waktu.namaShift,
                time: `${existingServiceOnSameShift.waktu.jamMulai} - ${existingServiceOnSameShift.waktu.jamSelesai}`
              }
            }
          },
          { status: 409 }
        );
      }
    }

    // Update service dan handle perubahan isAvailable shift
    const updatedService = await prisma.$transaction(async (tx) => {
      // Update service
      const service = await tx.service.update({
        where: { id },
        data: updateData,
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
            include: {
              kendalaHanphone: {
                include: {
                  pergantianBarang: true
                }
              }
            }
          },
          waktu: true
        }
      });

      // Jika status diubah menjadi CANCELLED, kembalikan isAvailable shift ke true
      if (statusService === 'CANCELLED' && existingService.statusService !== 'CANCELLED') {
        await tx.waktu.update({
          where: { id: existingService.waktuId },
          data: { isAvailable: true }
        });
      }

      // Jika waktu/shift diubah
      if (waktuId !== undefined && waktuId !== existingService.waktuId) {
        // Set shift lama menjadi available (true)
        await tx.waktu.update({
          where: { id: existingService.waktuId },
          data: { isAvailable: true }
        });

        // Set shift baru menjadi not available (false)
        await tx.waktu.update({
          where: { id: waktuId },
          data: { isAvailable: false }
        });
      }

      return service;
    });

    return NextResponse.json({
      message: 'Service updated successfully',
      data: updatedService
    });

  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update service",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus service berdasarkan ID (Alternative route)
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

    // Hanya ADMIN yang boleh menghapus service
    if (currentUser.role !== 'ADMIN') {
      return NextResponse.json(
        {
          error: 'Forbidden',
          message: 'Only admin can delete services'
        },
        { status: 403 }
      );
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Service ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah service exists
    const existingService = await prisma.service.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        handphone: {
          select: {
            brand: true,
            tipe: true
          }
        }
      }
    });

    if (!existingService) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'Service not found'
        },
        { status: 404 }
      );
    }

    // Validasi: tidak bisa hapus service yang sedang IN_PROGRESS
    if (existingService.statusService === 'IN_PROGRESS') {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Cannot delete service that is currently in progress'
        },
        { status: 409 }
      );
    }

    // Hapus service dan kembalikan isAvailable shift ke true
    await prisma.$transaction(async (tx) => {
      // Hapus service
      await tx.service.delete({
        where: { id }
      });

      // Kembalikan isAvailable shift ke true
      await tx.waktu.update({
        where: { id: existingService.waktuId },
        data: { isAvailable: true }
      });
    });

    return NextResponse.json({
      message: 'Service deleted successfully',
      data: { 
        id,
        customer: existingService.user.name,
        device: `${existingService.handphone?.brand} ${existingService.handphone?.tipe}`,
        status: existingService.statusService
      }
    });

  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete service",
      },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateDuration(startTime: string, endTime: string): string {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  const diffMinutes = endMinutes - startMinutes;
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  return `${hours}h ${minutes}m`;
}

function getTimelineStatus(status: string, daysFromNow: number): string {
  if (status === 'COMPLETED') return 'Service completed';
  if (status === 'CANCELLED') return 'Service cancelled';
  if (status === 'IN_PROGRESS') return 'Service in progress';
  
  if (daysFromNow > 0) return `Scheduled in ${daysFromNow} day(s)`;
  if (daysFromNow === 0) return 'Scheduled for today';
  return `Overdue by ${Math.abs(daysFromNow)} day(s)`;
}

async function getCommonProblemsForDevice(handphoneId: string) {
  const services = await prisma.service.findMany({
    where: { handphoneId },
    include: {
      handphone: {
        include: {
          kendalaHanphone: {
            select: {
              topikMasalah: true
            }
          }
        }
      }
    }
  });

  const problemCounts = services.reduce((acc, service) => {
    const problem = service.handphone?.kendalaHanphone?.topikMasalah || 'Unknown';
    acc[problem] = (acc[problem] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(problemCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .map(([problem, count]) => ({ problem, count }));
}

async function getTimeSlotPopularity(waktuId: string) {
  const totalServices = await prisma.service.count({
    where: { waktuId }
  });

  const completedServices = await prisma.service.count({
    where: { 
      waktuId,
      statusService: 'COMPLETED'
    }
  });

  return {
    totalBookings: totalServices,
    completedBookings: completedServices,
    completionRate: totalServices > 0 ? (completedServices / totalServices * 100).toFixed(1) + '%' : '0%'
  };
}