import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SERVICE_FEE = 38000; // Biaya jasa service

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

interface MonthlyRevenue {
  month: number;
  year: number;
  monthName: string;
  totalRevenue: number;
  totalOrders: number;
  revenueFromParts: number; // Pendapatan dari pergantian barang
  revenueFromService: number; // Pendapatan dari biaya jasa
  averageOrderValue: number; // Rata-rata nilai per pesanan
  percentageOfTotal: number; // Persentase dari total tahun
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token");

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized - No token provided" },
        { status: 401 }
      );
    }

    let decoded: JwtPayload;
    
    try {
      decoded = jwt.verify(token.value, JWT_SECRET) as JwtPayload;
    } catch (error) {
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (decoded.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Parse query params untuk filter tahun
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const currentYear = new Date().getFullYear();
    const targetYear = yearParam ? parseInt(yearParam) : currentYear;

    // Query untuk mendapatkan semua service COMPLETED dalam tahun tertentu
    const startDate = new Date(targetYear, 0, 1); // January 1st
    const endDate = new Date(targetYear + 1, 0, 1); // January 1st next year
    
    const services = await prisma.service.findMany({
      where: {
        statusService: "COMPLETED",
        tanggalPesan: {
          gte: startDate,
          lt: endDate,
        },
      },
      select: {
        tanggalPesan: true,
        kendalaHandphone: {
          select: {
            pergantianBarang: {
              select: {
                harga: true,
              },
            },
          },
        },
      },
    });

    // Kelompokkan berdasarkan bulan
    const monthlyData: { 
      [key: number]: { 
        totalRevenue: number; 
        totalOrders: number;
        revenueFromParts: number;
        revenueFromService: number;
      } 
    } = {};

    services.forEach((service: { 
      tanggalPesan: Date; 
      kendalaHandphone: Array<{ pergantianBarang: Array<{ harga: number }> }> 
    }) => {
      const month = new Date(service.tanggalPesan).getMonth() + 1; // 1-12
      
      if (!monthlyData[month]) {
        monthlyData[month] = {
          totalRevenue: 0,
          totalOrders: 0,
          revenueFromParts: 0,
          revenueFromService: 0,
        };
      }

      // Hitung total biaya dari semua pergantian barang
      let partsRevenue = 0;
      service.kendalaHandphone.forEach((kendala) => {
        kendala.pergantianBarang.forEach((barang) => {
          partsRevenue += Number(barang.harga);
        });
      });

      // Tambahkan ke monthly data
      monthlyData[month].revenueFromParts += partsRevenue;
      monthlyData[month].revenueFromService += SERVICE_FEE;
      monthlyData[month].totalRevenue += partsRevenue + SERVICE_FEE;
      monthlyData[month].totalOrders += 1;
    });

    // Nama bulan dalam bahasa Indonesia
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    // Hitung total tahun terlebih dahulu untuk persentase
    const yearTotal = Object.values(monthlyData).reduce((sum, item) => sum + item.totalRevenue, 0);

    // Format hasil sebagai array untuk 12 bulan
    const result: MonthlyRevenue[] = [];
    for (let month = 1; month <= 12; month++) {
      const data = monthlyData[month];
      const totalRevenue = data?.totalRevenue || 0;
      const totalOrders = data?.totalOrders || 0;
      
      result.push({
        month,
        year: targetYear,
        monthName: monthNames[month - 1],
        totalRevenue,
        totalOrders,
        revenueFromParts: data?.revenueFromParts || 0,
        revenueFromService: data?.revenueFromService || 0,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        percentageOfTotal: yearTotal > 0 ? (totalRevenue / yearTotal) * 100 : 0,
      });
    }

    // Hitung total keseluruhan untuk tahun ini
    const yearTotalOrders = result.reduce((sum, item) => sum + item.totalOrders, 0);
    const totalPartsRevenue = result.reduce((sum, item) => sum + item.revenueFromParts, 0);
    const totalServiceRevenue = result.reduce((sum, item) => sum + item.revenueFromService, 0);
    
    // Cari bulan terbaik
    const bestMonth = result.reduce((best, current) => 
      current.totalRevenue > best.totalRevenue ? current : best
    , result[0]);
    
    // Hitung rata-rata pendapatan per bulan (hanya bulan yang ada transaksi)
    const monthsWithRevenue = result.filter(m => m.totalRevenue > 0);
    const averageMonthlyRevenue = monthsWithRevenue.length > 0 
      ? yearTotal / monthsWithRevenue.length 
      : 0;

    return NextResponse.json({
      year: targetYear,
      monthlyRevenue: result,
      summary: {
        yearTotal,
        yearTotalOrders,
        totalPartsRevenue,
        totalServiceRevenue,
        bestMonth: {
          month: bestMonth.monthName,
          revenue: bestMonth.totalRevenue,
          orders: bestMonth.totalOrders,
        },
        averageMonthlyRevenue,
        averageOrderValue: yearTotalOrders > 0 ? yearTotal / yearTotalOrders : 0,
        monthsWithRevenue: monthsWithRevenue.length,
      },
    });
  } catch (error) {
    console.error("Error fetching monthly revenue:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { message: errorMessage, error: String(error) },
      { status: 500 }
    );
  }
}
