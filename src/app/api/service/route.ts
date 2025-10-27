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
            kendalaHanphone: {
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

    // Cek apakah waktu exists dan available
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

    if (!waktuExists.isAvailable) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: 'Selected time slot is not available'
        },
        { status: 409 }
      );
    }

    // Buat service baru
    const newService = await prisma.service.create({
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
      // Cek availability jika mengubah waktu
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

      if (!waktuExists.isAvailable) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: 'Selected time slot is not available'
          },
          { status: 409 }
        );
      }

      updateData.waktuId = waktuId;
    }

    // Update service
    const updatedService = await prisma.service.update({
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

    // Hapus service
    await prisma.service.delete({
      where: { id }
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