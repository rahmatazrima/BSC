import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';

// GET - Mengambil semua service atau service berdasarkan query
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');
    const tempat = searchParams.get('tempat');

    // Jika ada ID, ambil service spesifik
    if (id) {
      const service = await prisma.service.findUnique({
        where: { id },
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
              kendalaHandphone: {
                include: {
                  pergantianBarang: true
                }
              }
            }
          },
          waktu: true
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

      return NextResponse.json({
        status: true,
        content: service
      });
    }

    // Build where condition
    const where: any = {};
    
    // Jika USER (bukan ADMIN), hanya tampilkan data mereka sendiri
    if (currentUser.role !== 'ADMIN') {
      where.userId = currentUser.userId;
    } else {
      // Jika ADMIN dan ada filter userId dari query, gunakan filter tersebut
      if (userId) where.userId = userId;
    }
    
    if (status) where.statusService = status;
    if (tempat) where.tempat = { contains: tempat, mode: 'insensitive' };

    // Ambil semua services dengan relasi
    const services = await prisma.service.findMany({
      where,
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
            kendalaHandphone: {
              include: {
                pergantianBarang: true
              }
            }
          }
        },
        waktu: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      status: true,
      content: services,
      count: services.length,
      // Info untuk debugging
      requestedBy: {
        userId: currentUser.userId,
        role: currentUser.role
      }
    });

  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch services",
      },
      { status: 500 }
    );
  }
}

// POST - Membuat service baru
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { 
      statusService = 'PENDING',
      tempat,
      tanggalPesan,
      handphoneId,
      waktuId
    } = body;

    // Validasi input required (userId tidak perlu dari body, ambil dari token)
    if (!tempat || !tanggalPesan || !handphoneId || !waktuId) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'All fields are required',
          fields: {
            tempat: !tempat ? 'Tempat is required' : null,
            tanggalPesan: !tanggalPesan ? 'Tanggal pesan is required' : null,
            handphoneId: !handphoneId ? 'Handphone ID is required' : null,
            waktuId: !waktuId ? 'Waktu ID is required' : null,
          }
        },
        { status: 400 }
      );
    }

    // Validasi format tanggal
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

    // Gunakan userId dari JWT token
    const userId = currentUser.userId;

    // Cek apakah user exists (seharusnya selalu ada karena dari token valid)
    const userExists = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!userExists) {
      return NextResponse.json(
        {
          error: 'Not found',
          message: 'User not found'
        },
        { status: 404 }
      );
    }

    // Cek apakah handphone exists
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

    // Cek apakah waktu exists
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

    // Cek apakah shift sudah terisi pada tanggal yang sama
    // Set waktu ke awal dan akhir hari untuk query
    const startOfDay = new Date(parsedDate);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(parsedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingServiceOnSameShift = await prisma.service.findFirst({
      where: {
        waktuId: waktuId,
        tanggalPesan: {
          gte: startOfDay,
          lte: endOfDay
        },
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
      const formattedDate = parsedDate.toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Shift "${waktuExists.namaShift}" (${waktuExists.jamMulai} - ${waktuExists.jamSelesai}) sudah terisi untuk tanggal ${formattedDate}`,
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

    // Buat service baru dan update isAvailable shift menjadi false
    const newService = await prisma.$transaction(async (tx) => {
      // Buat service
      const service = await tx.service.create({
        data: {
          statusService,
          tempat,
          tanggalPesan: parsedDate,
          userId,
          handphoneId,
          waktuId
        },
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
              kendalaHandphone: {
                include: {
                  pergantianBarang: true
                }
              }
            }
          },
          waktu: true
        }
      });

      // Set isAvailable shift menjadi false karena sudah terisi
      await tx.waktu.update({
        where: { id: waktuId },
        data: { isAvailable: false }
      });

      return service;
    });

    return NextResponse.json(
      {
        message: 'Service created successfully',
        data: newService,
        // Info untuk debugging
        createdBy: {
          userId: currentUser.userId,
          email: currentUser.email,
          role: currentUser.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create service",
      },
      { status: 500 }
    );
  }
}

// PUT - Update service
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
    const body = await request.json();
    const { 
      id,
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

    // Siapkan data untuk update
    const updateData: any = {};
    if (statusService) updateData.statusService = statusService;
    if (tempat) updateData.tempat = tempat;
    if (tanggalPesan) {
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
    if (handphoneId) updateData.handphoneId = handphoneId;
    if (waktuId) {
      // Cek waktu exists jika mengubah waktu
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
    if (waktuId || tanggalPesan) {
      const finalWaktuId = waktuId || existingService.waktuId;
      const finalTanggalPesan = tanggalPesan ? new Date(tanggalPesan) : existingService.tanggalPesan;
      
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
              kendalaHandphone: {
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
      if (waktuId && waktuId !== existingService.waktuId) {
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

// DELETE - Hapus service
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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
      data: { id }
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