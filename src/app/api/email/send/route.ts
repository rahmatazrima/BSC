import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { sendEmail, createEmailTemplate } from '@/lib/email';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Verifikasi authentication
    const token = request.cookies.get('auth-token');
    if (!token) {
      return NextResponse.json(
        { status: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token.value, secret);
    const decoded = payload as { userId: string; email: string; role: string };

    // Cek apakah user adalah admin
    if (decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { status: false, message: 'Hanya admin yang dapat mengirim email' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { to, subject, message, userId, userName } = body;

    // Validasi input
    if (!subject || !message) {
      return NextResponse.json(
        { status: false, message: 'Subject dan message wajib diisi' },
        { status: 400 }
      );
    }

    // Validasi: harus ada userId ATAU to
    if (!userId && !to) {
      return NextResponse.json(
        { status: false, message: 'Pilih user atau masukkan email penerima' },
        { status: 400 }
      );
    }

    // Jika userId diberikan, ambil data user dari database
    let recipientEmail = to;
    let recipientName = userName || 'Pelanggan';

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true },
      });

      if (!user) {
        return NextResponse.json(
          { status: false, message: 'User tidak ditemukan' },
          { status: 404 }
        );
      }

      recipientEmail = user.email;
      recipientName = user.name;
    } else if (to) {
      // Validasi format email jika manual input
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(to)) {
        return NextResponse.json(
          { status: false, message: 'Format email tidak valid' },
          { status: 400 }
        );
      }
    }

    // Buat template email
    const html = createEmailTemplate({
      title: subject,
      message: message,
      userName: recipientName,
    });

    // Kirim email
    const result = await sendEmail({
      to: recipientEmail,
      subject: subject,
      html: html,
    });

    if (!result.success) {
      return NextResponse.json(
        { status: false, message: `Gagal mengirim email: ${result.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: true,
      message: 'Email berhasil dikirim',
      data: {
        to: recipientEmail,
        subject: subject,
      },
    });
  } catch (error) {
    console.error('Error in send email API:', error);
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim email',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

