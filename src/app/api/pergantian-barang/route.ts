import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET - Mengambil semua pergantian barang atau berdasarkan query
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const namaBarang = searchParams.get('namaBarang');
    const minHarga = searchParams.get('minHarga');
    const maxHarga = searchParams.get('maxHarga');

    // Jika ada ID, ambil pergantian barang spesifik
    if (id) {
      const pergantianBarang = await prisma.pergantianBarang.findUnique({
        where: { id },
        include: {
          kendalaHanphone: {
            include: {
              handphone: {
                select: {
                  id: true,
                  brand: true,
                  tipe: true
                }
              }
            }
          }
        }
      });

      if (!pergantianBarang) {
        return NextResponse.json(
          { 
            error: 'Not found',
            message: 'Pergantian barang not found'
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: true,
        content: pergantianBarang
      });
    }

    // Build where condition
    const where: any = {};
    if (namaBarang) {
      where.namaBarang = { 
        contains: namaBarang, 
        mode: 'insensitive' 
      };
    }
    if (minHarga || maxHarga) {
      where.harga = {};
      if (minHarga) where.harga.gte = parseFloat(minHarga);
      if (maxHarga) where.harga.lte = parseFloat(maxHarga);
    }

    // Ambil semua pergantian barang dengan relasi
    const pergantianBarangList = await prisma.pergantianBarang.findMany({
      where,
      include: {
        kendalaHanphone: {
          include: {
            handphone: {
              select: {
                id: true,
                brand: true,
                tipe: true
              }
            }
          }
        }
      },
      orderBy: [
        { harga: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({
      status: true,
      content: pergantianBarangList,
      count: pergantianBarangList.length
    });

  } catch (error) {
    console.error('Error fetching pergantian barang:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch pergantian barang data",
      },
      { status: 500 }
    );
  }
}

// POST - Membuat pergantian barang baru
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      namaBarang,
      harga
    } = body;

    // Validasi input required
    if (!namaBarang || harga === undefined || harga === null) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'All fields are required',
          fields: {
            namaBarang: !namaBarang ? 'Nama barang is required' : null,
            harga: (harga === undefined || harga === null) ? 'Harga is required' : null,
          }
        },
        { status: 400 }
      );
    }

    // Validasi harga harus number dan positif
    const parsedHarga = parseFloat(harga);
    if (isNaN(parsedHarga) || parsedHarga < 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Harga must be a positive number'
        },
        { status: 400 }
      );
    }

    // Cek apakah barang dengan nama yang sama sudah ada
    const existingBarang = await prisma.pergantianBarang.findFirst({
      where: { 
        namaBarang: {
          equals: namaBarang,
          mode: 'insensitive'
        }
      }
    });

    if (existingBarang) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Barang dengan nama '${namaBarang}' sudah ada`
        },
        { status: 409 }
      );
    }

    // Buat pergantian barang baru
    const newPergantianBarang = await prisma.pergantianBarang.create({
      data: {
        namaBarang,
        harga: parsedHarga
      }
    });

    return NextResponse.json(
      {
        message: 'Pergantian barang created successfully',
        data: newPergantianBarang
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating pergantian barang:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to create pergantian barang",
      },
      { status: 500 }
    );
  }
}

// PUT - Update pergantian barang
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      namaBarang,
      harga
    } = body;

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Pergantian barang ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah pergantian barang exists
    const existingPergantianBarang = await prisma.pergantianBarang.findUnique({
      where: { id }
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

    // Siapkan data untuk update
    const updateData: any = {};
    
    if (namaBarang !== undefined) {
      // Cek nama barang conflict (exclude current record)
      const conflictBarang = await prisma.pergantianBarang.findFirst({
        where: { 
          namaBarang: {
            equals: namaBarang,
            mode: 'insensitive'
          },
          id: { not: id }
        }
      });

      if (conflictBarang) {
        return NextResponse.json(
          {
            error: 'Conflict',
            message: `Barang dengan nama '${namaBarang}' sudah ada`
          },
          { status: 409 }
        );
      }
      updateData.namaBarang = namaBarang;
    }

    if (harga !== undefined && harga !== null) {
      const parsedHarga = parseFloat(harga);
      if (isNaN(parsedHarga) || parsedHarga < 0) {
        return NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Harga must be a positive number'
          },
          { status: 400 }
        );
      }
      updateData.harga = parsedHarga;
    }

    // Update pergantian barang
    const updatedPergantianBarang = await prisma.pergantianBarang.update({
      where: { id },
      data: updateData,
      include: {
        kendalaHanphone: {
          include: {
            handphone: {
              select: {
                id: true,
                brand: true,
                tipe: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Pergantian barang updated successfully',
      data: updatedPergantianBarang
    });

  } catch (error) {
    console.error('Error updating pergantian barang:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to update pergantian barang",
      },
      { status: 500 }
    );
  }
}

// DELETE - Hapus pergantian barang
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          message: 'Pergantian barang ID is required'
        },
        { status: 400 }
      );
    }

    // Cek apakah pergantian barang exists
    const existingPergantianBarang = await prisma.pergantianBarang.findUnique({
      where: { id },
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

    // Cek apakah ada kendala handphone yang menggunakan pergantian barang ini
    if (existingPergantianBarang.kendalaHanphone) {
      return NextResponse.json(
        {
          error: 'Conflict',
          message: `Cannot delete pergantian barang. It is being used by kendala handphone '${existingPergantianBarang.kendalaHanphone.topikMasalah}'`
        },
        { status: 409 }
      );
    }

    // Hapus pergantian barang
    await prisma.pergantianBarang.delete({
      where: { id }
    });

    return NextResponse.json({
      message: 'Pergantian barang deleted successfully',
      data: { 
        id,
        namaBarang: existingPergantianBarang.namaBarang
      }
    });

  } catch (error) {
    console.error('Error deleting pergantian barang:', error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to delete pergantian barang",
      },
      { status: 500 }
    );
  }
}