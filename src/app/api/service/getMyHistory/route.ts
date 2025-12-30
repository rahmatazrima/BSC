import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SERVICE_FEE = 38000; // Biaya jasa service

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
          select: {
            id: true,
            brand: true,
            tipe: true,
          },
        },
        waktu: true,
        kendalaHandphone: {
          include: {
            pergantianBarang: true,
          },
        },
      },
    });

    const history = services.map((service) => {
      // Ambil semua kendala yang dipilih user untuk service ini
      const selectedIssues = service.kendalaHandphone || [];
      
      // Hitung total harga dari semua pergantian barang dari semua kendala yang dipilih
      const totalPrice = selectedIssues.reduce((total, issue) => {
        const issuePrice = issue.pergantianBarang?.reduce(
          (sum, item) => sum + item.harga,
          0
        ) || 0;
        return total + issuePrice;
      }, 0);

      return {
        serviceId: service.id,
        status: service.statusService,
        tempat: service.tempat,
        alamat: service.alamat, // Alamat lengkap pelanggan (opsional)
        googleMapsLink: service.googleMapsLink, // Link Google Maps (opsional)
        tanggalPesan: service.tanggalPesan,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        handphone: {
          id: service.handphone.id,
          brand: service.handphone.brand,
          tipe: service.handphone.tipe,
        },
        issues: selectedIssues.map((issue) => ({
          id: issue.id,
          topikMasalah: issue.topikMasalah,
          harga: issue.pergantianBarang?.reduce(
            (sum, item) => sum + item.harga,
            0
          ) || 0,
          pergantianBarang: issue.pergantianBarang?.map((item) => ({
            id: item.id,
            namaBarang: item.namaBarang,
            harga: item.harga,
          })) || [],
        })),
        waktu: service.waktu
          ? {
              id: service.waktu.id,
              namaShift: service.waktu.namaShift,
              jamMulai: service.waktu.jamMulai,
              jamSelesai: service.waktu.jamSelesai,
            }
          : null,
        estimasiBiaya: totalPrice,
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


