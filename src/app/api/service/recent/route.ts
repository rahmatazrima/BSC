import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// GET - Mengambil 5 service terbaru untuk overview dashboard
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

    // Ambil 5 service terbaru saja
    const services = await prisma.service.findMany({
      take: 5,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Hitung statistik untuk overview
    const allServices = await prisma.service.findMany({
      select: {
        statusService: true,
        kendalaHandphone: {
          include: {
            pergantianBarang: {
              select: {
                harga: true,
              },
            },
          },
        },
      },
    });

    const stats = {
      total: allServices.length,
      pending: allServices.filter((s) => s.statusService === "PENDING").length,
      inProgress: allServices.filter((s) => s.statusService === "IN_PROGRESS").length,
      completed: allServices.filter((s) => s.statusService === "COMPLETED").length,
      cancelled: allServices.filter((s) => s.statusService === "CANCELLED").length,
      totalRevenue: allServices
        .filter((s) => s.statusService === "COMPLETED")
        .reduce((sum, service) => {
          const serviceTotal = service.kendalaHandphone.reduce((total, kendala) => {
            const kendalaPrice = kendala.pergantianBarang?.reduce(
              (sum, item) => sum + item.harga,
              0
            ) ?? 0;
            return total + kendalaPrice;
          }, 0);
          return sum + serviceTotal;
        }, 0),
    };

    // Format 5 service terbaru
    const formattedServices = services.map((service) => {
      const selectedKendala = service.kendalaHandphone || [];
      
      const totalPrice = selectedKendala.reduce((total, kendala) => {
        const kendalaPrice = kendala.pergantianBarang?.reduce(
          (sum, item) => sum + item.harga,
          0
        ) ?? 0;
        return total + kendalaPrice;
      }, 0);

      const problems = selectedKendala.map(k => k.topikMasalah);
      const problemsText = problems.length > 0 ? problems.join(", ") : "-";

      return {
        id: service.id,
        customerName: service.user.name,
        customerEmail: service.user.email,
        customerPhone: service.user.phoneNumber,
        device: `${service.handphone.brand} ${service.handphone.tipe}`,
        problem: problemsText,
        problems: problems,
        status: service.statusService,
        serviceType: service.tempat,
        alamat: service.alamat,
        googleMapsLink: service.googleMapsLink,
        scheduledDate: service.tanggalPesan,
        price: totalPrice,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        kendalaHandphone: selectedKendala.map(k => ({
          id: k.id,
          topikMasalah: k.topikMasalah,
          pergantianBarang: k.pergantianBarang,
        })),
      };
    });

    return NextResponse.json({
      status: true,
      content: formattedServices,
      stats: stats,
    });
  } catch (error) {
    console.error("Error fetching recent services:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch recent services",
      },
      { status: 500 }
    );
  }
}
