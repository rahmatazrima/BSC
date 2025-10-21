import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Mengambil semua waktu atau waktu berdasarkan query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const namaShift = searchParams.get('namaShift');
    const isAvailable = searchParams.get('isAvailable');

    // Jika ada ID, ambil waktu spesifik
    if (id) {
      const waktu = await prisma.waktu.findUnique({
        where: { id },
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
            }
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

      return NextResponse.json({
        status: true,
        content: waktu
      });
    }

    // Build where condition
    const where: any = {};
    if (namaShift) {
      where.namaShift = { 
        contains: namaShift, 
        mode: 'insensitive' 
      };
    }
    if (isAvailable !== null && isAvailable !== undefined) {
      where.isAvailable = isAvailable === 'true';
    }

    // Ambil semua waktu dengan relasi services
    const waktuList = await prisma.waktu.findMany({
      where,
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
          }
        },
        _count: {
          select: {
            services: true
          }
        }
      },
      orderBy: [
        { jamMulai: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      status: true,
      content: waktuList,
      count: waktuList.length
    });

  } catch (error) {
    console.error('Error fetching waktu:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch waktu data",
      },
      { status: 500 }
    );
  }
}

// POST - Membuat waktu baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      namaShift,
      jamMulai,
      jamSelesai,
      isAvailable = true
    } = body;

    // Validasi input required
    if (!namaShift || !jamMulai || !jamSelesai) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'All fields are required',
          fields: {
            namaShift: !namaShift ? 'Nama shift is required' : null,
            jamMulai: !jamMulai ? 'Jam mulai is required' : null,
            jamSelesai: !jamSelesai ? 'Jam selesai is required' : null,
          }
        },
        { status: 400 }
      );
    }

    // Validasi format jam (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(jamMulai)) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid format for jamMulai. Use HH:MM format (e.g., 08:30)'
        },
        { status: 400 }
      );
    }

    if (!timeRegex.test(jamSelesai)) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Invalid format for jamSelesai. Use HH:MM format (e.g., 17:00)'
        },
        { status: 400 }
      );
    }

    // Validasi logic jam mulai < jam selesai
    const [startHour, startMinute] = jamMulai.split(':').map(Number);
    const [endHour, endMinute] = jamSelesai.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime >= endTime) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Jam mulai must be earlier than jam selesai'
        },
        { status: 400 }
      );
    }

    // Cek apakah shift dengan nama yang sama sudah ada
    const existingShift = await prisma.waktu.findFirst({
      where: { 
        namaShift: {
          equals: namaShift,
          mode: 'insensitive'
        }
      }
    });

    if (existingShift) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Shift dengan nama '${namaShift}' sudah ada`
        },
        { status: 409 }
      );
    }

    // Cek overlap jam dengan shift lain
    const overlappingShift = await prisma.waktu.findFirst({
      where: {
        OR: [
          // Jam mulai baru berada di dalam range shift existing
          {
            AND: [
              { jamMulai: { lte: jamMulai } },
              { jamSelesai: { gt: jamMulai } }
            ]
          },
          // Jam selesai baru berada di dalam range shift existing
          {
            AND: [
              { jamMulai: { lt: jamSelesai } },
              { jamSelesai: { gte: jamSelesai } }
            ]
          },
          // Shift baru menutupi shift existing
          {
            AND: [
              { jamMulai: { gte: jamMulai } },
              { jamSelesai: { lte: jamSelesai } }
            ]
          }
        ]
      }
    });

    if (overlappingShift) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Jam shift overlap dengan shift '${overlappingShift.namaShift}' (${overlappingShift.jamMulai} - ${overlappingShift.jamSelesai})`
        },
        { status: 409 }
      );
    }

    // Buat waktu baru
    const newWaktu = await prisma.waktu.create({
      data: {
        namaShift,
        jamMulai,
        jamSelesai,
        isAvailable: Boolean(isAvailable)
      },
      include: {
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    return NextResponse.json(
      {
        message: 'Waktu shift created successfully',
        data: newWaktu
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating waktu:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create waktu shift",
      },
      { status: 500 }
    );
  }
}

// PUT - Update waktu
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
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
      where: { id }
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

    // Siapkan data untuk update
    const updateData: any = {};
    
    if (namaShift !== undefined) {
      // Cek nama shift conflict (exclude current record)
      const conflictShift = await prisma.waktu.findFirst({
        where: { 
          namaShift: {
            equals: namaShift,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (conflictShift) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: `Shift dengan nama '${namaShift}' sudah ada`
          },
          { status: 409 }
        );
      }
      updateData.namaShift = namaShift;
    }

    if (jamMulai !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(jamMulai)) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid format for jamMulai. Use HH:MM format'
          },
          { status: 400 }
        );
      }
      updateData.jamMulai = jamMulai;
    }

    if (jamSelesai !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(jamSelesai)) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid format for jamSelesai. Use HH:MM format'
          },
          { status: 400 }
        );
      }
      updateData.jamSelesai = jamSelesai;
    }

    if (isAvailable !== undefined) {
      updateData.isAvailable = Boolean(isAvailable);
    }

    // Validasi jam mulai < jam selesai jika keduanya diupdate
    const finalJamMulai = updateData.jamMulai || existingWaktu.jamMulai;
    const finalJamSelesai = updateData.jamSelesai || existingWaktu.jamSelesai;

    const [startHour, startMinute] = finalJamMulai.split(':').map(Number);
    const [endHour, endMinute] = finalJamSelesai.split(':').map(Number);
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;

    if (startTime >= endTime) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Jam mulai must be earlier than jam selesai'
        },
        { status: 400 }
      );
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
            tanggalPesan: true
          }
        },
        _count: {
          select: {
            services: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Waktu shift updated successfully',
      data: updatedWaktu
    });

  } catch (error) {
    console.error('Error updating waktu:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update waktu shift",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus waktu
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

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

    // Cek apakah ada services yang menggunakan waktu ini
    if (existingWaktu._count.services > 0) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Cannot delete waktu shift. It is being used by ${existingWaktu._count.services} service(s)`
        },
        { status: 409 }
      );
    }

    // Hapus waktu
    await prisma.waktu.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Waktu shift deleted successfully',
      data: { 
        id,
        namaShift: existingWaktu.namaShift
      }
    });

  } catch (error) {
    console.error('Error deleting waktu:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete waktu shift",
      },
      { status: 500 }
    );
  }
}