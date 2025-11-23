import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// GET - Mengambil semua service untuk admin
export async function GET(request: NextRequest) {
  try {
    // Verify JWT token
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

    // Hanya ADMIN yang bisa akses endpoint ini
    if (currentUser.role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Admin access required",
        },
        { status: 403 }
      );
    }

    // Query parameters untuk filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");
    const tempat = searchParams.get("tempat");

    // Build where condition
    const where: any = {};

    if (status) {
      where.statusService = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (tempat) {
      where.tempat = {
        contains: tempat,
        mode: "insensitive",
      };
    }

    // Ambil semua services dengan relasi lengkap
    const services = await prisma.service.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            role: true,
          },
        },
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Format data untuk admin dashboard
    const formattedServices = services.map((service) => {
      const primaryIssue = service.handphone.kendalaHandphone?.[0];
      const partsPrice = primaryIssue?.pergantianBarang?.reduce(
        (total, item) => total + item.harga,
        0
      ) ?? 0;

      return {
        id: service.id,
        customerName: service.user.name,
        customerEmail: service.user.email,
        customerPhone: service.user.phoneNumber,
        device: `${service.handphone.brand} ${service.handphone.tipe}`,
        problem: primaryIssue?.topikMasalah ?? "-",
        status: service.statusService,
        serviceType: service.tempat,
        alamat: service.alamat, // Alamat lengkap pelanggan (opsional)
        scheduledDate: service.tanggalPesan,
        price: partsPrice,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        handphone: {
          id: service.handphone.id,
          brand: service.handphone.brand,
          tipe: service.handphone.tipe,
        },
        waktu: service.waktu
          ? {
              id: service.waktu.id,
              namaShift: service.waktu.namaShift,
              jamMulai: service.waktu.jamMulai,
              jamSelesai: service.waktu.jamSelesai,
            }
          : null,
        issue: primaryIssue
          ? {
              id: primaryIssue.id,
              topikMasalah: primaryIssue.topikMasalah,
              pergantianBarang: primaryIssue.pergantianBarang,
            }
          : null,
      };
    });

    // Hitung statistik
    const stats = {
      total: services.length,
      pending: services.filter((s) => s.statusService === "PENDING").length,
      inProgress: services.filter((s) => s.statusService === "IN_PROGRESS")
        .length,
      completed: services.filter((s) => s.statusService === "COMPLETED")
        .length,
      cancelled: services.filter((s) => s.statusService === "CANCELLED")
        .length,
      totalRevenue: formattedServices
        .filter((s) => s.status === "COMPLETED")
        .reduce((sum, service) => sum + service.price, 0),
    };

    return NextResponse.json({
      status: true,
      content: formattedServices,
      count: formattedServices.length,
      stats: stats,
    });
  } catch (error) {
    console.error("Error fetching all services:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch services",
      },
      { status: 500 }
    );
  }
}

