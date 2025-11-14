import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

type TrackingStep = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  timestamp?: string;
};

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

    const trackingData = services.map((service) => {
      const primaryIssue = service.handphone.kendalaHandphone?.[0];

      const steps: TrackingStep[] = [
        {
          id: 1,
          title: "Belum dikerjakan",
          description: "Pesanan Anda sedang dalam antrian",
          completed:
            service.statusService !== "PENDING" &&
            service.statusService !== "CANCELLED",
          timestamp: service.createdAt.toISOString(),
        },
        {
          id: 2,
          title: "Sedang dikerjakan",
          description:
            "Teknisi sedang mengerjakan perbaikan perangkat Anda atau sedang dijadwalkan",
          completed: service.statusService === "IN_PROGRESS",
          timestamp:
            service.statusService === "IN_PROGRESS"
              ? service.updatedAt.toISOString()
              : undefined,
        },
        {
          id: 3,
          title:
            service.statusService === "CANCELLED"
              ? "Pesanan dibatalkan"
              : "Selesai",
          description:
            service.statusService === "CANCELLED"
              ? "Pesanan dibatalkan, silakan hubungi admin untuk informasi lebih lanjut"
              : "Perbaikan selesai dan perangkat siap digunakan",
          completed: service.statusService === "COMPLETED",
          timestamp:
            service.statusService === "COMPLETED"
              ? service.updatedAt.toISOString()
              : undefined,
        },
      ];

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
        steps,
      };
    });

    return NextResponse.json({
      status: true,
      content: trackingData,
      count: trackingData.length,
    });
  } catch (error) {
    console.error("Error fetching tracking data:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch tracking data",
      },
      { status: 500 }
    );
  }
}


