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
    const search = searchParams.get("search"); // Search untuk nama, email, atau device
    const searchDate = searchParams.get("searchDate"); // Search berdasarkan tanggal spesifik (YYYY-MM-DD)
    const brand = searchParams.get("brand"); // Filter brand handphone
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

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

    // Filter berdasarkan tanggal spesifik
    if (searchDate) {
      const searchDateObj = new Date(searchDate);
      const startOfDay = new Date(searchDateObj);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(searchDateObj);
      endOfDay.setHours(23, 59, 59, 999);
      
      where.tanggalPesan = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // Filter berdasarkan brand handphone
    if (brand) {
      where.handphone = {
        brand: {
          contains: brand,
          mode: "insensitive",
        },
      };
    }

    // Ambil semua services dengan relasi lengkap
    const services = await prisma.service.findMany({
      where,
      skip,
      take: limit,
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
        // Include kendalaHandphone yang dipilih customer untuk service ini (many-to-many)
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

    // Get total count for pagination
    const totalCount = await prisma.service.count({ where });

    // Format data untuk admin dashboard
    let formattedServices = services.map((service) => {
      // Ambil semua kendalaHandphone yang dipilih customer untuk service ini
      const selectedKendala = service.kendalaHandphone || [];
      
      // Hitung total harga dari semua pergantianBarang dari semua kendala yang dipilih
      const totalPrice = selectedKendala.reduce((total, kendala) => {
        const kendalaPrice = kendala.pergantianBarang?.reduce(
          (sum, item) => sum + item.harga,
          0
        ) ?? 0;
        return total + kendalaPrice;
      }, 0);

      // Format semua uraian masalah yang dipilih customer
      const problems = selectedKendala.map(k => k.topikMasalah);
      const problemsText = problems.length > 0 ? problems.join(", ") : "-";

      return {
        id: service.id,
        customerName: service.user.name,
        customerEmail: service.user.email,
        customerPhone: service.user.phoneNumber,
        device: `${service.handphone.brand} ${service.handphone.tipe}`,
        problem: problemsText, // Semua uraian masalah yang dipilih
        problems: problems, // Array uraian masalah
        status: service.statusService,
        serviceType: service.tempat,
        alamat: service.alamat, // Alamat lengkap pelanggan (opsional)
        scheduledDate: service.tanggalPesan,
        price: totalPrice,
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
        // Semua kendala yang dipilih customer dengan detail lengkap
        kendalaHandphone: selectedKendala.map(k => ({
          id: k.id,
          topikMasalah: k.topikMasalah,
          pergantianBarang: k.pergantianBarang,
        })),
      };
    });

    // Filter berdasarkan search (nama customer, email, atau device) - dilakukan di frontend karena perlu search di multiple fields
    if (search) {
      const searchLower = search.toLowerCase();
      formattedServices = formattedServices.filter((service) => {
        return (
          service.customerName.toLowerCase().includes(searchLower) ||
          service.customerEmail.toLowerCase().includes(searchLower) ||
          service.device.toLowerCase().includes(searchLower) ||
          service.customerPhone.includes(search)
        );
      });
    }

    // Hitung statistik
    const allServicesForStats = await prisma.service.findMany({
      where,
      select: {
        statusService: true,
        kendalaHandphone: {
          select: {
            topikMasalah: true,
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
      total: totalCount,
      pending: allServicesForStats.filter((s) => s.statusService === "PENDING").length,
      inProgress: allServicesForStats.filter((s) => s.statusService === "IN_PROGRESS")
        .length,
      completed: allServicesForStats.filter((s) => s.statusService === "COMPLETED")
        .length,
      cancelled: allServicesForStats.filter((s) => s.statusService === "CANCELLED")
        .length,
      totalRevenue: formattedServices
        .filter((s) => s.status === "COMPLETED")
        .reduce((sum, service) => sum + service.price, 0),
      // Analytics untuk masalah paling sering berdasarkan kendala yang dipilih customer
      popularProblems: (() => {
        const problemCounts: Record<string, number> = {};
        formattedServices.forEach((service) => {
          service.problems?.forEach((problem) => {
            problemCounts[problem] = (problemCounts[problem] || 0) + 1;
          });
        });
        return Object.entries(problemCounts)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .map(([problem, count]) => ({ problem, count }));
      })(),
    };

    return NextResponse.json({
      status: true,
      content: formattedServices,
      count: formattedServices.length,
      stats: stats,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
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

