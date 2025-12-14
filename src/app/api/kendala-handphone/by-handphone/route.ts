import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const handphoneId = searchParams.get("handphoneId");

    if (!handphoneId) {
      return NextResponse.json(
        {
          status: false,
          message: "handphoneId is required",
          content: []
        },
        { status: 400 }
      );
    }

    // Get all kendala for specific handphone
    const kendalaList = await prisma.kendalaHandphone.findMany({
      where: {
        handphoneId: handphoneId
      },
      include: {
        handphone: true,
        pergantianBarang: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      status: true,
      message: "Berhasil mengambil data kendala",
      content: kendalaList
    });

  } catch (error) {
    console.error("Error fetching kendala by handphone:", error);
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
