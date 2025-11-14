import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token");

    if (!token) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication token is required",
        },
        { status: 401 }
      );
    }

    let currentUser: { userId: string; email: string; role: string };

    try {
      const jwtSecret =
        process.env.JWT_SECRET || "your-secret-key-change-in-production";

      currentUser = jwt.verify(token.value, jwtSecret) as {
        userId: string;
        email: string;
        role: string;
      };
    } catch (error) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid or expired token",
        },
        { status: 401 }
      );
    }

    const services = await prisma.service.findMany({
      where: {
        userId: currentUser.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        handphone: {
          include: {
            kendalaHandphone: {
              include: {
                pergantianBarang: true,
              },
            },
          },
        },
        waktu: true,
      },
    });

    const history = services.map((service) => {
      const primaryIssue = service.handphone.kendalaHandphone?.[0];
      const partsPrice = primaryIssue?.pergantianBarang?.reduce(
        (total, item) => total + item.harga,
        0
      );

      return {
        serviceId: service.id,
        status: service.statusService,
        tempat: service.tempat,
        tanggalPesan: service.tanggalPesan,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        handphone: {
          id: service.handphone.id,
          brand: service.handphone.brand,
          tipe: service.handphone.tipe,
        },
        issue: primaryIssue
          ? {
              id: primaryIssue.id,
              topikMasalah: primaryIssue.topikMasalah,
            }
          : null,
        waktu: service.waktu
          ? {
              id: service.waktu.id,
              namaShift: service.waktu.namaShift,
              jamMulai: service.waktu.jamMulai,
              jamSelesai: service.waktu.jamSelesai,
            }
          : null,
        estimasiBiaya: partsPrice ?? 0,
      };
    });

    return NextResponse.json({
      status: true,
      content: history,
      count: history.length,
    });
  } catch (error) {
    console.error("Error fetching user history:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch history",
      },
      { status: 500 }
    );
  }
}


