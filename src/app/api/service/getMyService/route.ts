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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tempat = searchParams.get("tempat");

    const where: any = {
      userId: currentUser.userId,
    };

    if (status) {
      where.statusService = status;
    }

    if (tempat) {
      where.tempat = {
        contains: tempat,
        mode: "insensitive",
      };
    }

    const services = await prisma.service.findMany({
      where,
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

    return NextResponse.json({
      status: true,
      content: services,
      count: services.length,
    });
  } catch (error) {
    console.error("Error fetching user services:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: "Failed to fetch user services",
      },
      { status: 500 }
    );
  }
}


