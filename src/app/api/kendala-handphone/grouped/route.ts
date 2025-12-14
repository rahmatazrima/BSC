import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get all handphones that have kendala, grouped with count
    const handphonesWithKendala = await prisma.handphone.findMany({
      where: {
        kendalaHandphone: {
          some: {} // Only get handphones that have at least one kendala
        }
      },
      select: {
        id: true,
        brand: true,
        tipe: true,
        _count: {
          select: {
            kendalaHandphone: true
          }
        }
      },
      orderBy: [
        { brand: 'asc' },
        { tipe: 'asc' }
      ]
    });

    // Transform the data to a cleaner format
    const groupedData = handphonesWithKendala.map(hp => ({
      id: hp.id,
      brand: hp.brand,
      tipe: hp.tipe,
      kendalaCount: hp._count.kendalaHandphone
    }));

    return NextResponse.json({
      status: true,
      message: "Berhasil mengambil data handphone dengan kendala",
      content: groupedData
    });

  } catch (error) {
    console.error("Error fetching grouped kendala:", error);
    return NextResponse.json(
      {
        status: false,
        message: "Terjadi kesalahan saat mengambil data",
        content: []
      },
      { status: 500 }
    );
  }
}
