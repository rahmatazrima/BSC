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

    // Query service dengan relasi kendalaHandphone (many-to-many)
    // Jika relasi belum tersedia, akan return empty array
    const services = await prisma.service.findMany({
      where: {
        userId: currentUser.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        handphone: {
          select: {
            id: true,
            brand: true,
            tipe: true,
          },
        },
        waktu: true,
        // Ambil kendalaHandphone yang dipilih user untuk service ini (relasi many-to-many)
        kendalaHandphone: {
          select: {
            id: true,
            topikMasalah: true,
            handphoneId: true,
          },
        },
      },
    });

    const trackingData = services.map((service) => {
      // Ambil semua kendala yang dipilih user untuk service ini
      // Type assertion untuk handle relasi many-to-many yang mungkin belum tersedia di type
      const serviceWithKendala = service as typeof service & {
        kendalaHandphone?: Array<{
          id: string;
          topikMasalah: string;
          handphoneId: string;
        }>;
      };
      const selectedKendalas = serviceWithKendala.kendalaHandphone || [];

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
          // Completed jika status IN_PROGRESS atau COMPLETED (sudah melewati tahap ini)
          completed: 
            service.statusService === "IN_PROGRESS" || 
            service.statusService === "COMPLETED",
          timestamp:
            service.statusService === "IN_PROGRESS" || service.statusService === "COMPLETED"
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
        alamat: service.alamat, // Alamat lengkap pelanggan (opsional)
        tanggalPesan: service.tanggalPesan,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        handphone: {
          id: service.handphone.id,
          brand: service.handphone.brand,
          tipe: service.handphone.tipe,
        },
        // Kirim array semua kendala yang dipilih user
        issues: selectedKendalas.map((kendala) => ({
          id: kendala.id,
          topikMasalah: kendala.topikMasalah,
        })),
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
    
    // Log error detail untuk debugging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch tracking data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}


