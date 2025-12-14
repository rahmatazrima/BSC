import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        {
          status: false,
          message: "Handphone ID is required"
        },
        { status: 400 }
      );
    }

    // Ambil informasi lengkap untuk delete preview
    const handphone = await prisma.handphone.findUnique({
      where: { id },
      include: {
        kendalaHandphone: {
          include: {
            pergantianBarang: true,
            _count: {
              select: {
                pergantianBarang: true
              }
            }
          }
        },
        _count: {
          select: {
            services: true,
            kendalaHandphone: true
          }
        }
      }
    });

    if (!handphone) {
      return NextResponse.json(
        {
          status: false,
          message: "Handphone not found"
        },
        { status: 404 }
      );
    }

    // Hitung total sparepart
    const totalSpareparts = handphone.kendalaHandphone.reduce(
      (total, kendala) => total + kendala.pergantianBarang.length,
      0
    );

    return NextResponse.json({
      status: true,
      content: {
        id: handphone.id,
        brand: handphone.brand,
        tipe: handphone.tipe,
        hasActiveServices: handphone._count.services > 0,
        activeServicesCount: handphone._count.services,
        kendalaCount: handphone._count.kendalaHandphone,
        sparepartCount: totalSpareparts,
        canDelete: handphone._count.services === 0,
        kendalaList: handphone.kendalaHandphone.map(k => ({
          id: k.id,
          topikMasalah: k.topikMasalah,
          sparepartCount: k.pergantianBarang.length
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching handphone delete info:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Failed to fetch handphone information"
      },
      { status: 500 }
    );
  }
}
