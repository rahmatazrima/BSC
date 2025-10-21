import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Mengambil handphone berdasarkan ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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
    const serviceStats = {
      totalServices: handphone.services.length,
      pendingServices: handphone.services.filter(s => s.statusService === 'PENDING').length,
      inProgressServices: handphone.services.filter(s => s.statusService === 'IN_PROGRESS').length,
      completedServices: handphone.services.filter(s => s.statusService === 'COMPLETED').length,
      cancelledServices: handphone.services.filter(s => s.statusService === 'CANCELLED').length,
      totalRevenue: handphone.kendalaHanphone?.pergantianBarang?.harga 
        ? handphone.services.filter(s => s.statusService === 'COMPLETED').length * 
          handphone.kendalaHanphone.pergantianBarang.harga
        : 0
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
        kendalaHanphone: {
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

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

    // Cek dependency
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